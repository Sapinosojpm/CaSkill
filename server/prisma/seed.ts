import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const UserRole = {
  ADMIN: "ADMIN",
  CREATOR: "CREATOR",
  PLAYER: "PLAYER",
} as const;

const GameStatus = {
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
} as const;

const SubmissionStatus = {
  APPROVED: "APPROVED",
  PENDING_REVIEW: "PENDING_REVIEW",
} as const;

const ReviewDecision = {
  APPROVED: "APPROVED",
} as const;

const ScoreStatus = {
  ACCEPTED: "ACCEPTED",
  FLAGGED: "FLAGGED",
  REJECTED: "REJECTED",
} as const;

const CheatSeverity = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
} as const;

const prisma = new PrismaClient();

async function main() {
  await prisma.cheatFlag.deleteMany();
  await prisma.score.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.paymentOrder.deleteMany();
  await prisma.pointPackage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.playSession.deleteMany();
  await prisma.gameSubmission.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, creator, player] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ava Admin",
        email: "admin@caskill1.local",
        passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Chris Creator",
        email: "creator@caskill1.local",
        passwordHash,
        role: UserRole.CREATOR,
      },
    }),
    prisma.user.create({
      data: {
        name: "Piper Player",
        email: "player@caskill1.local",
        passwordHash,
        role: UserRole.PLAYER,
        pointsBalance: 120,
      },
    }),
  ]);

  await prisma.pointPackage.createMany({
    data: [
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
    ],
  });

  const memoryManifest = {
    title: "Memory Match",
    version: "1.0.0",
    entryFile: "dist/index.html",
    description: "Flip cards, match pairs, and finish as quickly as possible.",
    category: "Puzzle",
    controls: "Mouse or touch to flip tiles.",
    scoringRules: "Higher score for more matches with lower completion time.",
  };

  const quizManifest = {
    title: "Quiz Game",
    version: "1.0.0",
    entryFile: "dist/index.html",
    description: "Answer timed trivia questions and stack streak bonuses.",
    category: "Trivia",
    controls: "Mouse, touch, or keyboard number keys.",
    scoringRules: "10 points per correct answer plus streak bonus.",
  };

  const reactionManifest = {
    title: "Reaction Clicker",
    version: "1.0.0",
    entryFile: "dist/index.html",
    description: "Click as fast as possible during short timed bursts.",
    category: "Arcade",
    controls: "Mouse or touch.",
    scoringRules: "One point per valid click inside the active window.",
  };

  const duelManifest = {
    title: "Reaction Duel",
    version: "1.0.0",
    entryFile: "dist/index.html",
    description: "A same-screen 1v1 reaction battle where each player races to hit the correct side first.",
    category: "1v1 Arcade",
    controls: "Left player uses Q, right player uses P.",
    scoringRules: "Win rounds by reacting faster on the correct side. More round wins means a higher final score.",
  };

  const [memoryGame, quizGame, reactionGame, duelGame] = await Promise.all([
    prisma.game.create({
      data: {
        title: "Memory Match",
        description: "A neon memory game with quick rounds and leaderboard scoring.",
        thumbnailUrl: "/uploads/thumbnails/memory-match.png",
        category: "Puzzle",
        status: GameStatus.PUBLISHED,
        creatorId: creator.id,
        version: "1.0.0",
        entryFile: "dist/index.html",
        packagePath: "/uploads/packages/memory-match-v1.zip",
        buildPath: "/uploads/extracted/memory-match-v1/dist",
        manifestData: memoryManifest,
        scoringRules: "Score 100 per match, minus time penalties.",
        controls: "Click cards to reveal matching symbols.",
      },
    }),
    prisma.game.create({
      data: {
        title: "Quiz Game",
        description: "A timed trivia challenge with simple anti-cheat guardrails.",
        thumbnailUrl: "/uploads/thumbnails/quiz-game.png",
        category: "Trivia",
        status: GameStatus.PUBLISHED,
        creatorId: creator.id,
        version: "1.0.0",
        entryFile: "dist/index.html",
        packagePath: "/uploads/packages/quiz-game-v1.zip",
        buildPath: "/uploads/extracted/quiz-game-v1/dist",
        manifestData: quizManifest,
        scoringRules: "Correct answers plus streak bonus determine score.",
        controls: "Keyboard or tap to answer timed prompts.",
      },
    }),
    prisma.game.create({
      data: {
        title: "Reaction Clicker",
        description: "Fast arcade clicking with strict session and timing checks.",
        thumbnailUrl: "/uploads/thumbnails/reaction-clicker.png",
        category: "Arcade",
        status: GameStatus.IN_REVIEW,
        creatorId: creator.id,
        version: "1.1.0",
        entryFile: "dist/index.html",
        packagePath: "/uploads/packages/reaction-clicker-v1-1.zip",
        buildPath: "/uploads/extracted/reaction-clicker-v1-1/dist",
        manifestData: reactionManifest,
        scoringRules: "One point per successful reaction tap.",
        controls: "Click only when the board goes live.",
      },
    }),
    prisma.game.create({
      data: {
        title: "Reaction Duel",
        description: "A built-in sample 1v1 duel where two players race side-by-side on the same keyboard.",
        thumbnailUrl: "/uploads/thumbnails/reaction-duel.png",
        category: "1v1 Arcade",
        status: GameStatus.PUBLISHED,
        creatorId: creator.id,
        version: "1.0.0",
        entryFile: "dist/index.html",
        packagePath: "/uploads/packages/reaction-duel-v1.zip",
        buildPath: "/uploads/extracted/reaction-duel-v1/dist",
        manifestData: duelManifest,
        scoringRules: "Each won round is worth 100 points plus reaction-speed bonus.",
        controls: "Player 1 presses Q for left. Player 2 presses P for right.",
      },
    }),
  ]);

  const [memorySubmission, quizSubmission, reactionSubmission, duelSubmission] = await Promise.all([
    prisma.gameSubmission.create({
      data: {
        gameId: memoryGame.id,
        creatorId: creator.id,
        zipFileUrl: "/uploads/packages/memory-match-v1.zip",
        manifestData: memoryManifest,
        status: SubmissionStatus.APPROVED,
        reviewerId: admin.id,
        reviewNotes: "Solid first submission. Ready for public catalog.",
        submittedAt: new Date("2026-03-01T10:00:00.000Z"),
        reviewedAt: new Date("2026-03-02T09:30:00.000Z"),
      },
    }),
    prisma.gameSubmission.create({
      data: {
        gameId: quizGame.id,
        creatorId: creator.id,
        zipFileUrl: "/uploads/packages/quiz-game-v1.zip",
        manifestData: quizManifest,
        status: SubmissionStatus.APPROVED,
        reviewerId: admin.id,
        reviewNotes: "Approved after README clarification on scoring.",
        submittedAt: new Date("2026-03-03T08:00:00.000Z"),
        reviewedAt: new Date("2026-03-04T12:00:00.000Z"),
      },
    }),
    prisma.gameSubmission.create({
      data: {
        gameId: reactionGame.id,
        creatorId: creator.id,
        zipFileUrl: "/uploads/packages/reaction-clicker-v1-1.zip",
        manifestData: reactionManifest,
        status: SubmissionStatus.PENDING_REVIEW,
        submittedAt: new Date("2026-03-10T14:15:00.000Z"),
      },
    }),
    prisma.gameSubmission.create({
      data: {
        gameId: duelGame.id,
        creatorId: creator.id,
        zipFileUrl: "/uploads/packages/reaction-duel-v1.zip",
        manifestData: duelManifest,
        status: SubmissionStatus.APPROVED,
        reviewerId: admin.id,
        reviewNotes: "Good MVP sample for same-screen 1v1 gameplay.",
        submittedAt: new Date("2026-03-05T09:45:00.000Z"),
        reviewedAt: new Date("2026-03-05T14:00:00.000Z"),
      },
    }),
  ]);

  await prisma.review.createMany({
    data: [
      {
        submissionId: memorySubmission.id,
        reviewerId: admin.id,
        decision: ReviewDecision.APPROVED,
        notes: "Metadata and thumbnail look good. Publishing approved.",
        createdAt: new Date("2026-03-02T09:30:00.000Z"),
      },
      {
        submissionId: quizSubmission.id,
        reviewerId: admin.id,
        decision: ReviewDecision.APPROVED,
        notes: "Good build. Ready for catalog.",
        createdAt: new Date("2026-03-04T12:00:00.000Z"),
      },
      {
        submissionId: duelSubmission.id,
        reviewerId: admin.id,
        decision: ReviewDecision.APPROVED,
        notes: "Approved as a sample 1v1 game for player testing.",
        createdAt: new Date("2026-03-05T14:00:00.000Z"),
      },
    ],
  });

  const [memorySession, quizSession, reactionSession] = await Promise.all([
    prisma.playSession.create({
      data: {
        userId: player.id,
        gameId: memoryGame.id,
        sessionToken: "session-memory-player-001",
        startedAt: new Date("2026-03-11T10:00:00.000Z"),
        endedAt: new Date("2026-03-11T10:02:10.000Z"),
        expectedMaxScore: 1000,
        minDurationSeconds: 45,
        lookAwayEvents: 1,
        faceDetectedRatio: 0.94,
        meta: {
          detector: "mediapipe-face-landmarker",
          warningThreshold: 3,
        },
      },
    }),
    prisma.playSession.create({
      data: {
        userId: player.id,
        gameId: quizGame.id,
        sessionToken: "session-quiz-player-001",
        startedAt: new Date("2026-03-11T11:15:00.000Z"),
        endedAt: new Date("2026-03-11T11:17:05.000Z"),
        expectedMaxScore: 200,
        minDurationSeconds: 60,
        lookAwayEvents: 2,
        faceDetectedRatio: 0.91,
        meta: {
          detector: "mediapipe-face-landmarker",
          calibrated: true,
        },
      },
    }),
    prisma.playSession.create({
      data: {
        userId: creator.id,
        gameId: reactionGame.id,
        sessionToken: "session-reaction-creator-001",
        startedAt: new Date("2026-03-12T13:05:00.000Z"),
        endedAt: new Date("2026-03-12T13:05:18.000Z"),
        expectedMaxScore: 150,
        minDurationSeconds: 20,
        lookAwayEvents: 8,
        faceDetectedRatio: 0.42,
        meta: {
          detector: "mediapipe-face-landmarker",
          warningsShown: 4,
        },
      },
    }),
  ]);

  const [score1, score2, score3, score4] = await Promise.all([
    prisma.score.create({
      data: {
        userId: player.id,
        gameId: memoryGame.id,
        value: 820,
        durationSeconds: 130,
        status: ScoreStatus.ACCEPTED,
        submittedAt: new Date("2026-03-11T10:02:15.000Z"),
        sessionTokenSnapshot: memorySession.sessionToken,
        payloadHash: "hash-memory-accepted-001",
        lookAwayCount: 1,
        faceVisibleRatio: 0.94,
        clientMeta: {
          matchedPairs: 8,
          moves: 21,
          device: "desktop",
        },
      },
    }),
    prisma.score.create({
      data: {
        userId: player.id,
        gameId: quizGame.id,
        value: 140,
        durationSeconds: 125,
        status: ScoreStatus.ACCEPTED,
        submittedAt: new Date("2026-03-11T11:17:10.000Z"),
        sessionTokenSnapshot: quizSession.sessionToken,
        payloadHash: "hash-quiz-accepted-001",
        lookAwayCount: 2,
        faceVisibleRatio: 0.91,
        clientMeta: {
          correctAnswers: 12,
          streak: 4,
        },
      },
    }),
    prisma.score.create({
      data: {
        userId: creator.id,
        gameId: reactionGame.id,
        value: 210,
        durationSeconds: 18,
        status: ScoreStatus.FLAGGED,
        submittedAt: new Date("2026-03-12T13:05:20.000Z"),
        sessionTokenSnapshot: reactionSession.sessionToken,
        payloadHash: "hash-reaction-flagged-001",
        lookAwayCount: 8,
        faceVisibleRatio: 0.42,
        clientMeta: {
          clicksPerSecond: 11.6,
          repeatedSubmissionCount: 3,
        },
      },
    }),
    prisma.score.create({
      data: {
        userId: creator.id,
        gameId: reactionGame.id,
        value: 320,
        durationSeconds: 9,
        status: ScoreStatus.REJECTED,
        submittedAt: new Date("2026-03-12T13:07:00.000Z"),
        sessionTokenSnapshot: "missing-session-token",
        payloadHash: "hash-reaction-rejected-001",
        lookAwayCount: 10,
        faceVisibleRatio: 0.21,
        clientMeta: {
          clicksPerSecond: 35,
          reason: "payload tampering suspected",
        },
      },
    }),
  ]);

  await prisma.cheatFlag.createMany({
    data: [
      {
        scoreId: score3.id,
        userId: creator.id,
        gameId: reactionGame.id,
        reason: "Unrealistic click rate combined with repeated look-away events.",
        severity: CheatSeverity.HIGH,
        createdAt: new Date("2026-03-12T13:05:22.000Z"),
      },
      {
        scoreId: score3.id,
        userId: creator.id,
        gameId: reactionGame.id,
        reason: "Face visible ratio dropped below the acceptable threshold.",
        severity: CheatSeverity.MEDIUM,
        createdAt: new Date("2026-03-12T13:05:23.000Z"),
      },
      {
        scoreId: score4.id,
        userId: creator.id,
        gameId: reactionGame.id,
        reason: "Missing valid play session token and tampered payload hash.",
        severity: CheatSeverity.HIGH,
        createdAt: new Date("2026-03-12T13:07:02.000Z"),
      },
    ],
  });

  console.log("Seed complete");
  console.log({
    admin: "admin@caskill1.local / Password123!",
    creator: "creator@caskill1.local / Password123!",
    player: "player@caskill1.local / Password123!",
    games: [memoryGame.title, quizGame.title, reactionGame.title],
    sessions: [memorySession.sessionToken, quizSession.sessionToken, reactionSession.sessionToken],
  });
}

main()
  .catch(async (error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
