export type AppUserRole = "PLAYER" | "CREATOR" | "ADMIN";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  pointsBalance: number;
  createdAt: Date;
};
