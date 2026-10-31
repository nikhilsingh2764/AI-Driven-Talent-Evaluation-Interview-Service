import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import { resumeAnalysisLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";
import { analyzeResume, getAnalysis } from "../../controller/resume/analysis.controller.js";

const router = express.Router();

router.post("/resume/analysis", resumeAnalysisLimiter, authMiddleware, analyzeResume);
router.get("/resume/analysis", apiLimiter, authMiddleware, getAnalysis);

export default router;
