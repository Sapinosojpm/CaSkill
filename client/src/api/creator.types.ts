export type CreatorDashboard = {
  publishedGames: number;
  submissionCounts: Record<string, number>;
  recentSubmissions: CreatorSubmission[];
};

export type CreatorGameSummary = {
  id: string;
  title: string;
  category: string;
  status: string;
  version?: string;
  thumbnailUrl?: string;
  bannerUrl?: string | null;
  buildPath?: string | null;
};

export type CreatorReview = {
  id: string;
  decision: string;
  notes: string | null;
  createdAt: string;
};

export type CreatorSubmission = {
  id: string;
  gameId: string;
  creatorId: string;
  zipFileUrl: string;
  manifestData: Record<string, unknown>;
  status: string;
  reviewerId: string | null;
  reviewNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  game: CreatorGameSummary;
  reviews?: CreatorReview[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type UploadCreatorGameResponse = {
  submission: CreatorSubmission;
  manifest: {
    title: string;
    version: string;
    entryFile: string;
    description: string;
    category: string;
    controls: string;
    scoringRules: string;
  };
  thumbnailUrl: string;
  zipFileUrl: string;
};


