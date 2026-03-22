import multer from "multer";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

const maxFileSize = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
    files: 2,
  },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === "zipFile" && !file.originalname.toLowerCase().endsWith(".zip")) {
      callback(new AppError("Game package must be a ZIP file", 400));
      return;
    }

    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      callback(new AppError("Thumbnail must be an image file", 400));
      return;
    }

    callback(null, true);
  },
});

export const creatorUploadMiddleware = upload.fields([
  { name: "zipFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);
