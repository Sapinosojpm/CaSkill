import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";

const GameStatus = {
  PUBLISHED: "PUBLISHED",
} as const;

function withBuiltInGameKey(title: string) {
  if (title === "Memory Match") return "memory-match";
  if (title === "Quiz Game") return "quiz-game";
  if (title === "Reaction Clicker") return "reaction-clicker";
  if (title === "Reaction Duel") return "reaction-duel";
  return "uploaded-game";
}

export async function listPublicGames() {
  const games = await prisma.game.findMany({
    where: { status: GameStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { id: true, name: true } } },
  });

  return games.map((game: typeof games[number]) => ({
    ...game,
    builtInGameKey: withBuiltInGameKey(game.title),
  }));
}

export async function getPublicGameById(gameId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, status: GameStatus.PUBLISHED },
    include: { creator: { select: { id: true, name: true } } },
  });

  if (!game) {
    throw new AppError("Game not found", 404);
  }

  return {
    ...game,
    builtInGameKey: withBuiltInGameKey(game.title),
  };
}

export async function getPlayableGameById(gameId: string) {
  const game = await getPublicGameById(gameId);

  return {
    ...game,
    playConfig: {
      builtInGameKey: game.builtInGameKey,
      antiCheat: {
        requireSession: true,
        requireFaceSignals: true,
      },
    },
  };
}
