import crypto from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";

function getGameRules(title: string) {
  if (title === "Memory Match") return { expectedMaxScore: 1000, minDurationSeconds: 30 };
  if (title === "Quiz Game") return { expectedMaxScore: 200, minDurationSeconds: 45 };
  if (title === "Reaction Clicker") return { expectedMaxScore: 150, minDurationSeconds: 15 };
  return { expectedMaxScore: 1000, minDurationSeconds: 20 };
}

const MatchQueueStatus = {
  WAITING: "WAITING",
  MATCHED: "MATCHED",
  CANCELLED: "CANCELLED",
} as const;

function mapQueueResponse(entry: {
  id: string;
  gameId: string;
  stakePoints: number;
  status: string;
  matchedAt: Date | null;
  createdAt: Date;
  user: { id: string; name: string };
}, opponent?: { id: string; name: string } | null) {
  return {
    queueEntryId: entry.id,
    gameId: entry.gameId,
    stakePoints: entry.stakePoints,
    status: entry.status,
    matchedAt: entry.matchedAt,
    queuedAt: entry.createdAt,
    opponent: opponent ?? null,
  };
}

function mapOpenQueueEntry(entry: {
  id: string;
  gameId: string;
  stakePoints: number;
  createdAt: Date;
  user: { id: string; name: string };
}) {
  return {
    queueEntryId: entry.id,
    gameId: entry.gameId,
    stakePoints: entry.stakePoints,
    queuedAt: entry.createdAt,
    opponent: entry.user,
  };
}

export async function startSession(userId: string, gameId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, status: "PUBLISHED" },
  });

  if (!game) {
    throw new AppError("Game not found", 404);
  }

  const rules = getGameRules(game.title);
  const sessionToken = crypto.randomBytes(24).toString("hex");

  const session = await prisma.playSession.create({
    data: {
      userId,
      gameId,
      sessionToken,
      expectedMaxScore: rules.expectedMaxScore,
      minDurationSeconds: rules.minDurationSeconds,
      meta: { gameTitle: game.title },
    },
  });

  return {
    session,
    rules,
  };
}

export async function endSession(userId: string, input: {
  sessionToken: string;
  lookAwayEvents?: number;
  faceDetectedRatio?: number;
}) {
  const session = await prisma.playSession.findUnique({
    where: { sessionToken: input.sessionToken },
  });

  if (!session || session.userId !== userId) {
    throw new AppError("Session not found", 404);
  }

  return prisma.playSession.update({
    where: { sessionToken: input.sessionToken },
    data: {
      endedAt: new Date(),
      lookAwayEvents: input.lookAwayEvents ?? session.lookAwayEvents,
      faceDetectedRatio: input.faceDetectedRatio ?? session.faceDetectedRatio,
    },
  });
}

export async function findMatchmaking(userId: string, input: { gameId: string; stakePoints: number; targetQueueEntryId?: string }) {
  const game = await prisma.game.findFirst({
    where: { id: input.gameId, status: "PUBLISHED" },
  });

  if (!game) {
    throw new AppError("Game not found", 404);
  }

  const existingEntry = await prisma.matchQueueEntry.findFirst({
    where: {
      userId,
      gameId: input.gameId,
      stakePoints: input.stakePoints,
      status: { in: [MatchQueueStatus.WAITING, MatchQueueStatus.MATCHED] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (existingEntry?.status === MatchQueueStatus.MATCHED && existingEntry.opponentEntryId) {
    const opponent = await prisma.matchQueueEntry.findUnique({
      where: { id: existingEntry.opponentEntryId },
      include: { user: { select: { id: true, name: true } } },
    });

    return {
      match: mapQueueResponse(existingEntry, opponent?.user ?? null),
    };
  }

  if (existingEntry?.status === MatchQueueStatus.WAITING) {
    return {
      match: mapQueueResponse(existingEntry),
    };
  }

  const waitingOpponent = input.targetQueueEntryId
    ? await prisma.matchQueueEntry.findFirst({
        where: {
          id: input.targetQueueEntryId,
          gameId: input.gameId,
          status: MatchQueueStatus.WAITING,
          userId: { not: userId },
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      })
    : await prisma.matchQueueEntry.findFirst({
        where: {
          gameId: input.gameId,
          stakePoints: input.stakePoints,
          status: MatchQueueStatus.WAITING,
          userId: { not: userId },
        },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

  if (input.targetQueueEntryId && !waitingOpponent) {
    throw new AppError("Selected queue entry is no longer available", 404);
  }

  if (!waitingOpponent) {
    const queuedEntry = await prisma.matchQueueEntry.create({
      data: {
        userId,
        gameId: input.gameId,
        stakePoints: input.stakePoints,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      match: mapQueueResponse(queuedEntry),
    };
  }

  const matchedAt = new Date();

  const [opponentEntry, playerEntry] = await prisma.$transaction([
    prisma.matchQueueEntry.update({
      where: { id: waitingOpponent.id },
      data: {
        status: MatchQueueStatus.MATCHED,
        matchedAt,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.matchQueueEntry.create({
      data: {
        userId,
        gameId: input.gameId,
        stakePoints: waitingOpponent.stakePoints,
        status: MatchQueueStatus.MATCHED,
        opponentEntryId: waitingOpponent.id,
        matchedAt,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  await prisma.matchQueueEntry.update({
    where: { id: opponentEntry.id },
    data: {
      opponentEntryId: playerEntry.id,
    },
  });

  return {
    match: mapQueueResponse(playerEntry, opponentEntry.user),
  };
}

export async function listOpenMatchmakingQueues(userId: string, gameId: string) {
  const queues = await prisma.matchQueueEntry.findMany({
    where: {
      gameId,
      status: MatchQueueStatus.WAITING,
      userId: { not: userId },
    },
    orderBy: [{ stakePoints: "asc" }, { createdAt: "asc" }],
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return {
    queues: queues.map(mapOpenQueueEntry),
  };
}

export async function getMatchmakingStatus(userId: string, gameId: string, stakePoints?: number) {
  const entry = await prisma.matchQueueEntry.findFirst({
    where: {
      userId,
      gameId,
      ...(stakePoints ? { stakePoints } : {}),
      status: { in: [MatchQueueStatus.WAITING, MatchQueueStatus.MATCHED] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!entry) {
    return { match: null };
  }

  const opponent = entry.opponentEntryId
    ? await prisma.matchQueueEntry.findUnique({
        where: { id: entry.opponentEntryId },
        include: { user: { select: { id: true, name: true } } },
      })
    : null;

  return {
    match: mapQueueResponse(entry, opponent?.user ?? null),
  };
}

export async function cancelMatchmaking(userId: string, queueEntryId: string) {
  const entry = await prisma.matchQueueEntry.findUnique({
    where: { id: queueEntryId },
  });

  if (!entry || entry.userId !== userId) {
    throw new AppError("Queue entry not found", 404);
  }

  if (entry.status !== MatchQueueStatus.WAITING) {
    throw new AppError("Only waiting queue entries can be cancelled", 400);
  }

  const updated = await prisma.matchQueueEntry.update({
    where: { id: queueEntryId },
    data: {
      status: MatchQueueStatus.CANCELLED,
      cancelledAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return {
    match: mapQueueResponse(updated),
  };
}

export async function leaveActiveMatchmaking(userId: string, gameId?: string) {
  const activeEntries = await prisma.matchQueueEntry.findMany({
    where: {
      userId,
      ...(gameId ? { gameId } : {}),
      status: { in: [MatchQueueStatus.WAITING, MatchQueueStatus.MATCHED] },
    },
  });

  if (!activeEntries.length) {
    return { cleared: 0 };
  }

  const entryIds = new Set<string>();

  for (const entry of activeEntries) {
    entryIds.add(entry.id);
    if (entry.opponentEntryId) {
      entryIds.add(entry.opponentEntryId);
    }
  }

  const cancelledAt = new Date();
  const result = await prisma.matchQueueEntry.updateMany({
    where: {
      id: { in: [...entryIds] },
      status: { in: [MatchQueueStatus.WAITING, MatchQueueStatus.MATCHED] },
    },
    data: {
      status: MatchQueueStatus.CANCELLED,
      cancelledAt,
    },
  });

  return {
    cleared: result.count,
  };
}
