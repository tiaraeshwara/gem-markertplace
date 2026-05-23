import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const allowedDocTypes = ["application/pdf", "image/jpeg", "image/png"];

  const fieldName = file.fieldname;

  if (fieldName === "certificate") {
    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Certificate must be PDF or image"));
    }
  } else {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Images must be JPEG, PNG, WEBP, or GIF"));
    }
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10MB, 10 files
});

export const uploadCertificate = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 }, // 20MB, 1 file
});

export const uploadMixed = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 11 },
});
