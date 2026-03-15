import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  approveSubmission,
  deleteSubmissionGame,
  getAdminDashboard,
  getAdminSubmissionById,
  listAdminSubmissions,
  listCheatFlags,
  rejectSubmission,
  suspendSubmissionGame,
} from "./admin.service.js";

export const getAdminDashboardHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(await getAdminDashboard());
});

export const listAdminSubmissionsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ submissions: await listAdminSubmissions() });
});

export const getAdminSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  res.status(200).json({ submission: await getAdminSubmissionById(submissionId) });
});

export const approveSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = await approveSubmission(submissionId, req.user!.id, req.body.notes);
  res.status(200).json({ submission });
});

export const rejectSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = await rejectSubmission(submissionId, req.user!.id, req.body.notes);
  res.status(200).json({ submission });
});

export const suspendSubmissionGameHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = await suspendSubmissionGame(submissionId, req.user!.id, req.body.notes);
  res.status(200).json({ submission });
});

export const deleteSubmissionGameHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await deleteSubmissionGame(submissionId, req.user!.id, req.body.notes);
  res.status(200).json(result);
});

export const listCheatFlagsHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ cheatFlags: await listCheatFlags() });
});
