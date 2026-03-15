import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";

const SubmissionStatus = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const GameStatus = {
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
} as const;

const ReviewDecision = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export async function getAdminDashboard() {
  const [pendingSubmissions, publishedGames, cheatFlags, recentSubmissions] = await Promise.all([
    prisma.gameSubmission.count({ where: { status: SubmissionStatus.PENDING_REVIEW } }),
    prisma.game.count({ where: { status: GameStatus.PUBLISHED } }),
    prisma.cheatFlag.count(),
    prisma.gameSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        game: { select: { id: true, title: true, category: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return { pendingSubmissions, publishedGames, cheatFlags, recentSubmissions };
}

export async function listAdminSubmissions() {
  return prisma.gameSubmission.findMany({
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    include: {
      game: true,
      creator: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getAdminSubmissionById(submissionId: string) {
  const submission = await prisma.gameSubmission.findUnique({
    where: { id: submissionId },
    include: {
      game: true,
      creator: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return submission;
}

async function reviewSubmission(input: {
  submissionId: string;
  reviewerId: string;
  notes: string;
  decision: "APPROVED" | "REJECTED";
}) {
  const submission = await prisma.gameSubmission.findUnique({
    where: { id: input.submissionId },
    include: { game: true },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  const reviewedAt = new Date();
  const submissionStatus =
    input.decision === ReviewDecision.APPROVED ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;
  const gameStatus = input.decision === ReviewDecision.APPROVED ? GameStatus.PUBLISHED : GameStatus.REJECTED;

  const [updatedSubmission] = await prisma.$transaction([
    prisma.gameSubmission.update({
      where: { id: input.submissionId },
      data: {
        status: submissionStatus,
        reviewerId: input.reviewerId,
        reviewNotes: input.notes,
        reviewedAt,
      },
      include: {
        game: true,
        creator: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        reviews: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.review.create({
      data: {
        submissionId: input.submissionId,
        reviewerId: input.reviewerId,
        decision: input.decision,
        notes: input.notes,
      },
    }),
    prisma.game.update({
      where: { id: submission.gameId },
      data: {
        status: gameStatus,
      },
    }),
  ]);

  return updatedSubmission;
}

export function approveSubmission(submissionId: string, reviewerId: string, notes: string) {
  return reviewSubmission({
    submissionId,
    reviewerId,
    notes,
    decision: ReviewDecision.APPROVED,
  });
}

export function rejectSubmission(submissionId: string, reviewerId: string, notes: string) {
  return reviewSubmission({
    submissionId,
    reviewerId,
    notes,
    decision: ReviewDecision.REJECTED,
  });
}

export async function listCheatFlags() {
  return prisma.cheatFlag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      game: { select: { id: true, title: true, category: true } },
      score: true,
    },
  });
}
