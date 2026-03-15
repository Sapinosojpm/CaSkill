import type { CreatorSubmission } from "./creator.types";

export type AdminDashboard = {
  pendingSubmissions: number;
  publishedGames: number;
  cheatFlags: number;
  recentSubmissions: CreatorSubmission[];
};

export type CheatFlagItem = {
  id: string;
  reason: string;
  severity: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  game: { id: string; title: string; category: string };
  score: {
    id: string;
    value: number;
    durationSeconds: number;
    status: string;
  };
};


