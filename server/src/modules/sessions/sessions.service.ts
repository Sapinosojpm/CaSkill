import crypto from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";

function getGameRules(title: string) {
  if (title === "Memory Match") return { expectedMaxScore: 1000, minDurationSeconds: 30 };
  if (title === "Quiz Game") return { expectedMaxScore: 200, minDurationSeconds: 45 };
  if (title === "Reaction Clicker") return { expectedMaxScore: 150, minDurationSeconds: 15 };
  return { expectedMaxScore: 1000, minDurationSeconds: 20 };
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
