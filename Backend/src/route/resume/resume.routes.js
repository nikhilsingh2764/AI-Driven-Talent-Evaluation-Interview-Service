import express from "express";
import { uploadResumeLimiter, ReplaceResumeLimiter, DeleteResumeLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import upload from "../../middleware/multer.middleware.js";
import validate from "../../middleware/validate.js";
import { uploadResumeValidator, replaceResumeValidator } from "../../validators/resume.validator.js";
import { uploadResume, fetchResume, replaceResume, deleteResume, downloadResumeFile } from "../../controller/resume/resume.controller.js";

const router = express.Router();

router.post("/resume/upload", authMiddleware, uploadResumeLimiter, upload.single("resume"), uploadResumeValidator, validate, uploadResume);
router.get("/resume", authMiddleware, apiLimiter, fetchResume);
router.get("/resume/file", authMiddleware, apiLimiter, downloadResumeFile);
router.patch("/resume", authMiddleware, ReplaceResumeLimiter, upload.single("resume"), replaceResumeValidator, validate, replaceResume);
router.delete("/resume", authMiddleware, DeleteResumeLimiter, deleteResume);

export default router;
