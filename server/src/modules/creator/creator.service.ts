import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { put } from "@vercel/blob";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { ensureDir, toPublicUploadPath, uploadRoot } from "../../utils/file-system.js";

const GameStatus = {
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  PUBLISHED: "PUBLISHED",
} as const;

const SubmissionStatus = {
  UPLOADED: "UPLOADED",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

type UploadInput = {
  creatorId: string;
  title: string;
  description: string;
  category: string;
  version: string;
  thumbnailFile: Express.Multer.File;
  bannerFile?: Express.Multer.File;
  zipFile: Express.Multer.File;
};

type ParsedManifest = {
  title: string;
  version: string;
  entryFile: string;
  description: string;
  category: string;
  controls: string;
  scoringRules: string;
};

function normalizeEntryPath(value: string) {
  return value.replaceAll("\\", "/").replace(/^\.?\//, "");
}

function parseManifest(zip: AdmZip) {
  const manifestEntry = zip.getEntry("manifest.json");

  if (!manifestEntry) {
    throw new AppError("ZIP package must include manifest.json", 400);
  }

  let manifest: ParsedManifest;

  try {
    manifest = JSON.parse(zip.readAsText(manifestEntry)) as ParsedManifest;
  } catch {
    throw new AppError("manifest.json is not valid JSON", 400);
  }

  const requiredFields = [
    "title",
    "version",
    "entryFile",
    "description",
    "category",
    "controls",
    "scoringRules",
  ] as const;

  for (const field of requiredFields) {
    if (!manifest[field] || typeof manifest[field] !== "string") {
      throw new AppError(`manifest.json is missing required field "${field}"`, 400);
    }
  }

  return manifest;
}

function validateZipStructure(zipBuffer: Buffer) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip
    .getEntries()
    .map((entry) => entry.entryName.replaceAll("\\", "/"))
    .filter(Boolean);

  const manifest = parseManifest(zip);
  const normalizedEntryFile = normalizeEntryPath(manifest.entryFile);

  const hasReadme = entries.some((entry) => entry.toLowerCase() === "readme.md");
  const hasBuildFolder = entries.some((entry) => entry.startsWith("dist/") || entry.startsWith("build/"));
  const hasEntryFile = entries.includes(normalizedEntryFile);

  if (!hasReadme) {
    throw new AppError("ZIP package must include README.md", 400);
  }

  if (!hasBuildFolder) {
    throw new AppError("ZIP package must include a dist/ or build/ folder", 400);
  }

  if (!hasEntryFile) {
    throw new AppError(`manifest entryFile "${manifest.entryFile}" was not found in the ZIP package`, 400);
  }

  return {
    manifest,
    buildRoot: normalizedEntryFile.startsWith("build/") ? "build" : "dist",
  };
}

function sanitizeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function writeFile(targetPath: string, buffer: Buffer) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, buffer);
}

function buildScopedWhere(creatorId: string, submissionId?: string) {
  return {
    ...(submissionId ? { id: submissionId } : {}),
    OR: [
      { creatorId },
      {
        reviewerId: creatorId,
      },
    ],
  };
}

export async function getCreatorDashboard(creatorId: string) {
  const [submissionCounts, publishedGames, recentSubmissions] = await Promise.all([
    prisma.gameSubmission.groupBy({
      by: ["status"],
      where: { creatorId },
      _count: { _all: true },
    }),
    prisma.game.count({
      where: {
        creatorId,
        status: GameStatus.PUBLISHED,
      },
    }),
    prisma.gameSubmission.findMany({
      where: { creatorId },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        game: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    publishedGames,
    submissionCounts: submissionCounts.reduce(
      (accumulator: Record<string, number>, item: { status: string; _count: { _all: number } }) => {
      accumulator[item.status] = item._count._all;
      return accumulator;
      },
      {},
    ),
    recentSubmissions,
  };
}

export async function uploadCreatorGame(input: UploadInput) {
  if (!input.title || !input.description || !input.category || !input.version) {
    throw new AppError("Title, description, category, and version are required", 400);
  }

  const { manifest, buildRoot } = validateZipStructure(input.zipFile.buffer);

  const submissionSlug = sanitizeFilenamePart(input.title || manifest.title) || "game";
  const suffix = crypto.randomBytes(4).toString("hex");

  const game = await prisma.game.create({
    data: {
      title: input.title,
      description: input.description,
      thumbnailUrl: "",
      category: input.category,
      status: GameStatus.DRAFT,
      creatorId: input.creatorId,
      version: input.version,
      entryFile: normalizeEntryPath(manifest.entryFile),
      manifestData: manifest,
      scoringRules: manifest.scoringRules,
      controls: manifest.controls,
    },
  });

  const submission = await prisma.gameSubmission.create({
    data: {
      gameId: game.id,
      creatorId: input.creatorId,
      zipFileUrl: "",
      manifestData: manifest,
      status: SubmissionStatus.UPLOADED,
    },
  });

  const submissionDir = path.join(uploadRoot, "submissions", submission.id);
  const zipFilename = `${submissionSlug}-${suffix}.zip`;
  const thumbnailExtension = path.extname(input.thumbnailFile.originalname) || ".png";
  const thumbnailFilename = `${submissionSlug}-${suffix}${thumbnailExtension}`;

  await ensureDir(submissionDir);

  const zipAbsolutePath = path.join(uploadRoot, "packages", zipFilename);

  let thumbnailPublicUrl = "";
  let bannerPublicUrl: string | null = null;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const thumbnailBlob = await put(`thumbnails/${thumbnailFilename}`, input.thumbnailFile.buffer, {
        access: "public",
      });
      thumbnailPublicUrl = thumbnailBlob.url;

      if (input.bannerFile) {
        const bannerExtension = path.extname(input.bannerFile.originalname) || ".png";
        const bannerFilename = `${submissionSlug}-${suffix}-banner${bannerExtension}`;
        const bannerBlob = await put(`banners/${bannerFilename}`, input.bannerFile.buffer, {
          access: "public",
        });
        bannerPublicUrl = bannerBlob.url;
      }
    } else {
      throw new Error("Missing BLOB_READ_WRITE_TOKEN, falling back to local.");
    }
  } catch (error) {
    const thumbnailAbsolutePath = path.join(uploadRoot, "thumbnails", thumbnailFilename);
    await writeFile(thumbnailAbsolutePath, input.thumbnailFile.buffer);
    thumbnailPublicUrl = toPublicUploadPath("thumbnails", thumbnailFilename);

    if (input.bannerFile) {
      const bannerExtension = path.extname(input.bannerFile.originalname) || ".png";
      const bannerFilename = `${submissionSlug}-${suffix}-banner${bannerExtension}`;
      const bannerAbsolutePath = path.join(uploadRoot, "thumbnails", bannerFilename);
      await writeFile(bannerAbsolutePath, input.bannerFile.buffer);
      bannerPublicUrl = toPublicUploadPath("thumbnails", bannerFilename);
    }
  }

  await Promise.all([
    writeFile(zipAbsolutePath, input.zipFile.buffer),
    fs.writeFile(
      path.join(submissionDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8",
    ),
  ]);

  const extractedZip = new AdmZip(input.zipFile.buffer);
  extractedZip.extractAllTo(submissionDir, true);

  const zipPublicUrl = toPublicUploadPath("packages", zipFilename);

  const updatedSubmission = await prisma.gameSubmission.update({
    where: { id: submission.id },
    data: {
      zipFileUrl: zipPublicUrl,
    },
    include: {
      game: true,
    },
  });

  await prisma.game.update({
    where: { id: game.id },
    data: {
      thumbnailUrl: thumbnailPublicUrl,
      bannerUrl: bannerPublicUrl,
      packagePath: zipPublicUrl,
      buildPath: toPublicUploadPath("submissions", submission.id, buildRoot),
      manifestData: manifest,
      scoringRules: manifest.scoringRules,
      controls: manifest.controls,
    },
  });

  return {
    submission: updatedSubmission,
    manifest,
    thumbnailUrl: thumbnailPublicUrl,
    zipFileUrl: zipPublicUrl,
  };
}

export async function submitCreatorSubmission(creatorId: string, submissionId: string) {
  const submission = await prisma.gameSubmission.findFirst({
    where: {
      id: submissionId,
      creatorId,
    },
    include: {
      game: true,
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  if (submission.status !== SubmissionStatus.UPLOADED) {
    throw new AppError("Only uploaded submissions can be sent for review", 400);
  }

  const updatedSubmission = await prisma.gameSubmission.update({
    where: { id: submission.id },
    data: {
      status: SubmissionStatus.PENDING_REVIEW,
    },
    include: {
      game: true,
      reviews: true,
    },
  });

  await prisma.game.update({
    where: { id: submission.gameId },
    data: {
      status: GameStatus.IN_REVIEW,
    },
  });

  return updatedSubmission;
}

export async function listCreatorSubmissions(creatorId: string) {
  return prisma.gameSubmission.findMany({
    where: { creatorId },
    orderBy: { submittedAt: "desc" },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          version: true,
          thumbnailUrl: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getCreatorSubmissionById(creatorId: string, submissionId: string) {
  const submission = await prisma.gameSubmission.findFirst({
    where: buildScopedWhere(creatorId, submissionId),
    include: {
      game: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  return submission;
}

export async function deleteCreatorSubmission(creatorId: string, submissionId: string) {
  const submission = await prisma.gameSubmission.findFirst({
    where: { id: submissionId, creatorId },
    include: { game: true },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  await prisma.$transaction([
    prisma.review.deleteMany({ where: { submissionId } }),
    prisma.gameSubmission.delete({ where: { id: submissionId } }),
    prisma.game.delete({ where: { id: submission.gameId } }),
  ]);

  return { success: true };
}
