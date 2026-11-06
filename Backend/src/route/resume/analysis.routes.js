import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { resumeAnalysisLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";
import { analyzeResume, getAnalysis } from "../../controller/resume/analysis.controller.js";

const router = express.Router();

router.post("/resume/analysis", authMiddleware, resumeAnalysisLimiter, analyzeResume);
router.get("/resume/analysis", authMiddleware, apiLimiter, getAnalysis);

export default router;
