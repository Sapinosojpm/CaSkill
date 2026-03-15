import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";

type ScoreCheckInput = {
  userId: string;
  gameId: string;
  value: number;
  durationSeconds: number;
  sessionToken: string;
  lookAwayCount?: number;
  faceVisibleRatio?: number;
  clientMeta?: Record<string, unknown>;
};

type CheatDecision = {
  status: "ACCEPTED" | "FLAGGED" | "REJECTED";
  reasons: { reason: string; severity: "LOW" | "MEDIUM" | "HIGH" }[];
  payloadHash: string;
  session: {
    id: string;
    sessionToken: string;
  } | null;
};

export async function evaluateScore(input: ScoreCheckInput): Promise<CheatDecision> {
  const session = await prisma.playSession.findUnique({
    where: { sessionToken: input.sessionToken },
  });

  const reasons: CheatDecision["reasons"] = [];
  const payloadHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({
      gameId: input.gameId,
      value: input.value,
      durationSeconds: input.durationSeconds,
      sessionToken: input.sessionToken,
      lookAwayCount: input.lookAwayCount ?? 0,
      faceVisibleRatio: input.faceVisibleRatio ?? null,
    }))
    .digest("hex");

  if (!session || session.userId !== input.userId || session.gameId !== input.gameId) {
    reasons.push({ reason: "Invalid or missing play session token.", severity: "HIGH" });
  }

  if (session?.expectedMaxScore && input.value > session.expectedMaxScore) {
    reasons.push({ reason: "Score exceeds allowed maximum for this game.", severity: "HIGH" });
  }

  if (session?.minDurationSeconds && input.durationSeconds < session.minDurationSeconds) {
    reasons.push({ reason: "Completion time is unrealistically fast.", severity: "HIGH" });
  }

  if ((input.lookAwayCount ?? 0) >= 6) {
    reasons.push({ reason: "Repeated look-away events detected.", severity: "MEDIUM" });
  }

  if ((input.faceVisibleRatio ?? 1) < 0.45) {
    reasons.push({ reason: "Face visibility ratio is below the acceptable threshold.", severity: "MEDIUM" });
  }

  const suspiciousRecentScores = await prisma.score.count({
    where: {
      userId: input.userId,
      gameId: input.gameId,
      submittedAt: {
        gte: new Date(Date.now() - 10 * 60 * 1000),
      },
      status: { in: ["FLAGGED", "REJECTED"] },
    },
  });

  if (suspiciousRecentScores >= 2) {
    reasons.push({ reason: "Repeated suspicious submissions detected in a short window.", severity: "MEDIUM" });
  }

  let status: CheatDecision["status"] = "ACCEPTED";

  if (reasons.some((item) => item.severity === "HIGH")) {
    status = reasons.some((item) => item.reason.includes("Invalid or missing play session token"))
      ? "REJECTED"
      : "FLAGGED";
  } else if (reasons.length > 0) {
    status = "FLAGGED";
  }

  return {
    status,
    reasons,
    payloadHash,
    session: session ? { id: session.id, sessionToken: session.sessionToken } : null,
  };
}
