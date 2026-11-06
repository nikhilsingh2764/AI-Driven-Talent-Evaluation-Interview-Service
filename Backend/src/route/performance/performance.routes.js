import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
    generatePerformanceReport, getInterviewHistory, getDashboard, getPerformanceReport, downloadPerformanceReport,
} from "../../controller/performance/performance.controller.js";
import { historyQueryValidator } from "../../validators/interview.validator.js";
import { generatePerformanceReportLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/performance/generate", authMiddleware, generatePerformanceReportLimiter, generatePerformanceReport);
router.get("/performance", authMiddleware, apiLimiter, getPerformanceReport);
router.get("/performance/pdf", authMiddleware, apiLimiter, downloadPerformanceReport);
router.get("/history", authMiddleware, apiLimiter, historyQueryValidator, validate, getInterviewHistory);
router.get("/dashboard", authMiddleware, apiLimiter, getDashboard);

export default router;
