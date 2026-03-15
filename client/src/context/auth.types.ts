export type AppRole = "PLAYER" | "CREATOR" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  pointsBalance: number;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Extract<AppRole, "PLAYER" | "CREATOR">;
};


