import Stripe from "stripe";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

const defaultPointPackages = [
  {
    name: "Starter Stack",
    description: "A light top-up for quick matches and practice runs.",
    pointsAmount: 100,
    priceCents: 499,
    currency: "usd",
    sortOrder: 1,
  },
  {
    name: "Competitive Pack",
    description: "A balanced bundle for regular ranked play.",
    pointsAmount: 250,
    priceCents: 999,
    currency: "usd",
    sortOrder: 2,
  },
  {
    name: "Champion Crate",
    description: "Best value for players grinding matches all week.",
    pointsAmount: 700,
    priceCents: 1999,
    currency: "usd",
    sortOrder: 3,
  },
] as const;

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError("Stripe payments are not configured on the server", 503);
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

function formatPointPackage(pointPackage: {
  id: string;
  name: string;
  description: string | null;
  pointsAmount: number;
  priceCents: number;
  currency: string;
}) {
  return {
    id: pointPackage.id,
    name: pointPackage.name,
    description: pointPackage.description,
    pointsAmount: pointPackage.pointsAmount,
    priceCents: pointPackage.priceCents,
    currency: pointPackage.currency,
  };
}

async function ensureDefaultPointPackages() {
  const count = await prisma.pointPackage.count();

  if (count > 0) {
    return;
  }

  await prisma.pointPackage.createMany({
    data: defaultPointPackages.map((item) => ({
      ...item,
      currency: env.STRIPE_CURRENCY.toLowerCase(),
    })),
  });
}

export async function listPointPackages() {
  await ensureDefaultPointPackages();

  const packages = await prisma.pointPackage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { pointsAmount: "asc" }],
  });

  return {
    packages: packages.map(formatPointPackage),
  };
}

export async function getWalletSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      pointsBalance: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    wallet: {
      userId: user.id,
      pointsBalance: user.pointsBalance,
    },
  };
}

export async function listPointTransactions(userId: string) {
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      paymentOrder: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return {
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      delta: transaction.delta,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      createdAt: transaction.createdAt,
      paymentOrderId: transaction.paymentOrder?.id ?? null,
      paymentOrderStatus: transaction.paymentOrder?.status ?? null,
    })),
  };
}

export async function createCheckoutSession(userId: string, pointPackageId: string) {
  const stripe = getStripeClient();
  await ensureDefaultPointPackages();

  const [user, pointPackage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    }),
    prisma.pointPackage.findFirst({
      where: { id: pointPackageId, isActive: true },
    }),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!pointPackage) {
    throw new AppError("Point package not found", 404);
  }

  const order = await prisma.paymentOrder.create({
    data: {
      userId,
      pointPackageId: pointPackage.id,
      priceCents: pointPackage.priceCents,
      currency: pointPackage.currency,
      pointsAmount: pointPackage.pointsAmount,
    },
  });

  const storeUrl = `${env.CLIENT_URLS[0]}/store`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${storeUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${storeUrl}?checkout=cancel`,
    customer_email: user.email,
    metadata: {
      orderId: order.id,
      userId,
      pointPackageId: pointPackage.id,
      pointsAmount: String(pointPackage.pointsAmount),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: pointPackage.currency,
          unit_amount: pointPackage.priceCents,
          product_data: {
            name: pointPackage.name,
            description: pointPackage.description ?? `${pointPackage.pointsAmount} CaSkill points`,
          },
        },
      },
    ],
  });

  await prisma.paymentOrder.update({
    where: { id: order.id },
    data: {
      checkoutSessionId: session.id,
    },
  });

  if (!session.url) {
    throw new AppError("Stripe checkout session did not return a redirect URL", 500);
  }

  return {
    orderId: order.id,
    checkoutUrl: session.url,
  };
}

async function completePaymentOrderByCheckoutSession(checkoutSessionId: string, stripePaymentIntentId?: string | null) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { checkoutSessionId },
    });

    if (!order || order.status === "COMPLETED") {
      return;
    }

    const updatedUser = await tx.user.update({
      where: { id: order.userId },
      data: {
        pointsBalance: {
          increment: order.pointsAmount,
        },
      },
      select: {
        pointsBalance: true,
      },
    });

    await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        stripePaymentIntentId: stripePaymentIntentId ?? order.stripePaymentIntentId,
        completedAt: new Date(),
      },
    });

    await tx.pointTransaction.create({
      data: {
        userId: order.userId,
        paymentOrderId: order.id,
        type: "PURCHASE",
        delta: order.pointsAmount,
        balanceAfter: updatedUser.pointsBalance,
        description: `Stripe purchase credited ${order.pointsAmount} points`,
      },
    });
  });
}

async function expirePaymentOrderByCheckoutSession(checkoutSessionId: string) {
  await prisma.paymentOrder.updateMany({
    where: {
      checkoutSessionId,
      status: "PENDING",
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export async function processStripeWebhook(rawBody: Buffer, signatureHeader?: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError("Stripe webhook secret is not configured on the server", 503);
  }

  if (!signatureHeader) {
    throw new AppError("Missing Stripe signature header", 400);
  }

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(rawBody, signatureHeader, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await completePaymentOrderByCheckoutSession(session.id, typeof session.payment_intent === "string" ? session.payment_intent : null);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await expirePaymentOrderByCheckoutSession(session.id);
  }

  return { received: true };
}
