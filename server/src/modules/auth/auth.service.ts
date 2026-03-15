import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import type { AppUserRole, SafeUser } from "../../types/auth.js";
import { AppError } from "../../utils/app-error.js";
import { signAccessToken } from "../../utils/auth.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: AppUserRole;
};

type LoginInput = {
  email: string;
  password: string;
};

function toSafeUser(user: SafeUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    token: signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as AppUserRole,
    }),
    user: toSafeUser({
      ...user,
      role: user.role as AppUserRole,
    }),
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    token: signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as AppUserRole,
    }),
    user: toSafeUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AppUserRole,
      createdAt: user.createdAt,
    }),
  };
}
