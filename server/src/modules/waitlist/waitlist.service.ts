import { prisma } from "../../config/prisma.js";

type CreateWaitlistEntryInput = {
  name: string;
  email: string;
  role: "PLAYER" | "CREATOR";
  note?: string;
  wantsUpdates: boolean;
};

export async function createWaitlistEntry(input: CreateWaitlistEntryInput) {
  const entry = await prisma.waitlistEntry.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      role: input.role,
      note: input.note,
      wantsUpdates: input.wantsUpdates,
    },
    create: input,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      note: true,
      wantsUpdates: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const stats = await getWaitlistStats();

  return {
    entry,
    stats,
  };
}

export async function getWaitlistStats() {
  const [total, playerCount, creatorCount] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.count({ where: { role: "PLAYER" } }),
    prisma.waitlistEntry.count({ where: { role: "CREATOR" } }),
  ]);

  return {
    total,
    playerCount,
    creatorCount,
  };
}

export async function getWaitlistEntries() {
  const [total, entries] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        note: true,
        wantsUpdates: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    total,
    entries,
  };
}
