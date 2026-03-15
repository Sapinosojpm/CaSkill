import { API_BASE_URL, api, getStoredToken } from "./api";
import type {
  GameItem,
  LeaderboardEntry,
  MatchmakingStatus,
  OpenMatchQueuesResponse,
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

export async function findMatchmaking(gameId: string, stakePoints: number, targetQueueEntryId?: string) {
  const response = await api.post<MatchmakingStatus>("/sessions/matchmaking/find", { gameId, stakePoints, targetQueueEntryId });
  return response.data;
}

export async function fetchOpenMatchQueues(gameId: string) {
  const response = await api.get<OpenMatchQueuesResponse>(`/sessions/matchmaking/${gameId}/open`);
  return response.data;
}

export async function fetchMatchmakingStatus(gameId: string, stakePoints?: number) {
  const response = await api.get<MatchmakingStatus>(`/sessions/matchmaking/${gameId}`, {
    params: stakePoints ? { stakePoints } : undefined,
  });
  return response.data;
}

export async function cancelMatchmaking(queueEntryId: string) {
  const response = await api.post<MatchmakingStatus>("/sessions/matchmaking/cancel", { queueEntryId });
  return response.data;
}

export async function leaveActiveMatchmaking(gameId?: string, options?: { keepalive?: boolean }) {
  if (options?.keepalive) {
    const token = getStoredToken();
    if (!token) return { cleared: 0 };

    const response = await fetch(`${API_BASE_URL}/sessions/matchmaking/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gameId ? { gameId } : {}),
      keepalive: true,
    });

    return response.json();
  }

  const response = await api.post<{ cleared: number }>("/sessions/matchmaking/leave", gameId ? { gameId } : {});
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


