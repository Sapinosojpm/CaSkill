import { api } from "./api";
import type {
  GameItem,
  LeaderboardEntry,
  MatchmakingStatus,
  PlayableGame,
  StartSessionResponse,
  SubmitScoreResponse,
} from "./games.types";

export async function fetchGames() {
  const response = await api.get<{ games: GameItem[] }>("/games");
  return response.data.games;
}

export async function fetchGame(gameId: string) {
  const response = await api.get<{ game: GameItem }>(`/games/${gameId}`);
  return response.data.game;
}

export async function fetchPlayableGame(gameId: string) {
  const response = await api.get<{ game: PlayableGame }>(`/games/${gameId}/play`);
  return response.data.game;
}

export async function fetchLeaderboard(gameId: string) {
  const response = await api.get<{ leaderboard: LeaderboardEntry[] }>(`/scores/leaderboards/${gameId}`);
  return response.data.leaderboard;
}

export async function startGameSession(gameId: string) {
  const response = await api.post<StartSessionResponse>("/sessions/start", { gameId });
  return response.data;
}

export async function findMatchmaking(gameId: string, stakePoints: number) {
  const response = await api.post<MatchmakingStatus>("/sessions/matchmaking/find", { gameId, stakePoints });
  return response.data;
}

export async function fetchMatchmakingStatus(gameId: string, stakePoints: number) {
  const response = await api.get<MatchmakingStatus>(`/sessions/matchmaking/${gameId}`, {
    params: { stakePoints },
  });
  return response.data;
}

export async function cancelMatchmaking(queueEntryId: string) {
  const response = await api.post<MatchmakingStatus>("/sessions/matchmaking/cancel", { queueEntryId });
  return response.data;
}

export async function endGameSession(input: {
  sessionToken: string;
  lookAwayEvents?: number;
  faceDetectedRatio?: number;
}) {
  const response = await api.post("/sessions/end", input);
  return response.data;
}

export async function submitGameScore(input: {
  gameId: string;
  value: number;
  durationSeconds: number;
  sessionToken: string;
  lookAwayCount?: number;
  faceVisibleRatio?: number;
  clientMeta?: Record<string, unknown>;
}) {
  const response = await api.post<SubmitScoreResponse>("/scores/submit", input);
  return response.data.score;
}


