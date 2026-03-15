import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { login, register } from "./auth.service.js";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.status(200).json(result);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});
