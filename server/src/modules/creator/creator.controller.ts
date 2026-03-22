import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import {
  getCreatorDashboard,
  getCreatorSubmissionById,
  listCreatorSubmissions,
  submitCreatorSubmission,
  uploadCreatorGame,
  deleteCreatorSubmission,
} from "./creator.service.js";

function getUploadFiles(req: Request) {
  const files = req.files as
    | {
        zipFile?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
        banner?: Express.Multer.File[];
      }
    | undefined;

  const zipFile = files?.zipFile?.[0];
  const thumbnailFile = files?.thumbnail?.[0];
  const bannerFile = files?.banner?.[0];

  if (!zipFile || !thumbnailFile) {
    throw new AppError("Both ZIP package and thumbnail are required", 400);
  }

  return {
    zipFile,
    thumbnailFile,
    bannerFile,
  };
}

export const getCreatorDashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCreatorDashboard(req.user!.id);
  res.status(200).json(data);
});

export const uploadCreatorGameHandler = asyncHandler(async (req: Request, res: Response) => {
  const { zipFile, thumbnailFile, bannerFile } = getUploadFiles(req);

  const result = await uploadCreatorGame({
    creatorId: req.user!.id,
    title: String(req.body.title ?? "").trim(),
    description: String(req.body.description ?? "").trim(),
    category: String(req.body.category ?? "").trim(),
    version: String(req.body.version ?? "").trim(),
    thumbnailFile,
    bannerFile,
    zipFile,
  });

  res.status(201).json(result);
});

export const submitCreatorSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await submitCreatorSubmission(req.user!.id, req.body.submissionId);
  res.status(200).json({ submission: result });
});

export const listCreatorSubmissionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await listCreatorSubmissions(req.user!.id);
  res.status(200).json({ submissions });
});

export const getCreatorSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = await getCreatorSubmissionById(req.user!.id, submissionId);
  res.status(200).json({ submission });
});

export const deleteCreatorSubmissionHandler = asyncHandler(async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await deleteCreatorSubmission(req.user!.id, submissionId);
  res.status(200).json(result);
});
