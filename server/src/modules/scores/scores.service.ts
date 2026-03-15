import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { evaluateScore } from "../../services/antiCheat.js";

export async function submitScore(userId: string, input: {
  gameId: string;
  value: number;
  durationSeconds: number;
  sessionToken: string;
  lookAwayCount?: number;
  faceVisibleRatio?: number;
  clientMeta?: Record<string, unknown>;
}) {
  const game = await prisma.game.findFirst({
    where: { id: input.gameId, status: "PUBLISHED" },
  });

  if (!game) {
    throw new AppError("Game not found", 404);
  }

  const decision = await evaluateScore({
    userId,
    gameId: input.gameId,
    value: input.value,
    durationSeconds: input.durationSeconds,
    sessionToken: input.sessionToken,
    lookAwayCount: input.lookAwayCount,
    faceVisibleRatio: input.faceVisibleRatio,
    clientMeta: input.clientMeta,
  });

  const score = await prisma.score.create({
    data: {
      userId,
      gameId: input.gameId,
      value: input.value,
      durationSeconds: input.durationSeconds,
      status: decision.status,
      sessionTokenSnapshot: input.sessionToken,
      payloadHash: decision.payloadHash,
      lookAwayCount: input.lookAwayCount,
      faceVisibleRatio: input.faceVisibleRatio,
      clientMeta: (input.clientMeta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
    include: {
      cheatFlags: true,
    },
  });

  if (decision.reasons.length > 0) {
    await prisma.cheatFlag.createMany({
      data: decision.reasons.map((item) => ({
        scoreId: score.id,
        userId,
        gameId: input.gameId,
        reason: item.reason,
        severity: item.severity,
      })),
    });
  }

  return prisma.score.findUnique({
    where: { id: score.id },
    include: { cheatFlags: true },
  });
}

export async function getLeaderboard(gameId: string) {
  return prisma.score.findMany({
    where: {
      gameId,
      status: "ACCEPTED",
    },
    orderBy: [{ value: "desc" }, { durationSeconds: "asc" }, { submittedAt: "asc" }],
    take: 20,
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}
