import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
    generatePerformanceReport, getInterviewHistory, getDashboard, getPerformanceReport, downloadPerformanceReport,
} from "../../controller/performance/performance.controller.js";
import { historyQueryValidator } from "../../validators/interview.validator.js";
import { generatePerformanceReportLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/performance/generate", generatePerformanceReportLimiter, authMiddleware, generatePerformanceReport);
router.get("/performance", apiLimiter, authMiddleware, getPerformanceReport);
router.get("/performance/pdf", apiLimiter, authMiddleware, downloadPerformanceReport);
router.get("/history", apiLimiter, authMiddleware, historyQueryValidator, validate, getInterviewHistory);
router.get("/dashboard", apiLimiter, authMiddleware, getDashboard);

export default router;
