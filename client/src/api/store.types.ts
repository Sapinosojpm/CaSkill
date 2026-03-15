export type PointPackage = {
  id: string;
  name: string;
  description: string | null;
  pointsAmount: number;
  priceCents: number;
  currency: string;
};

export type WalletSummary = {
  wallet: {
    userId: string;
    pointsBalance: number;
  };
};

export type PointTransaction = {
  id: string;
  type: string;
  delta: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  paymentOrderId: string | null;
  paymentOrderStatus: string | null;
};

export type PointPackagesResponse = {
  packages: PointPackage[];
};

export type PointTransactionsResponse = {
  transactions: PointTransaction[];
};

export type CheckoutSessionResponse = {
  orderId: string;
  checkoutUrl: string;
};

