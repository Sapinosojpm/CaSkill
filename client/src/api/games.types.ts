export type GameItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  status: string;
  creatorId: string;
  version: string;
  entryFile: string;
  manifestData: Record<string, unknown>;
  scoringRules: string | null;
  controls: string | null;
  buildPath?: string | null;
  packagePath?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
  builtInGameKey: string;
};

export type PlayableGame = GameItem & {
  playConfig: {
    builtInGameKey: string;
    antiCheat: {
      requireSession: boolean;
      requireFaceSignals: boolean;
    };
  };
};

export type LeaderboardEntry = {
  id: string;
  value: number;
  durationSeconds: number;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
  };
};

export type StartSessionResponse = {
  session: {
    id: string;
    sessionToken: string;
    gameId: string;
    expectedMaxScore: number | null;
    minDurationSeconds: number | null;
  };
  rules: {
    expectedMaxScore: number;
    minDurationSeconds: number;
  };
};

export type SubmitScoreResponse = {
  score: {
    id: string;
    value: number;
    durationSeconds: number;
    status: string;
    cheatFlags: {
      id: string;
      reason: string;
      severity: string;
    }[];
  };
};

export type MatchmakingStatus = {
  match: {
    queueEntryId: string;
    gameId: string;
    stakePoints: number;
    status: string;
    matchedAt: string | null;
    queuedAt: string;
    opponent: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export type OpenMatchQueue = {
  queueEntryId: string;
  gameId: string;
  stakePoints: number;
  queuedAt: string;
  opponent: {
    id: string;
    name: string;
  };
};

export type OpenMatchQueuesResponse = {
  queues: OpenMatchQueue[];
};


