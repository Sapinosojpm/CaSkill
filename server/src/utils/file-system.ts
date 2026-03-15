import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

export const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function ensureUploadDirectories() {
  await Promise.all([
    ensureDir(uploadRoot),
    ensureDir(path.join(uploadRoot, "thumbnails")),
    ensureDir(path.join(uploadRoot, "packages")),
    ensureDir(path.join(uploadRoot, "submissions")),
  ]);
}

export function toPublicUploadPath(...segments: string[]) {
  return `/uploads/${segments.join("/")}`;
}
