import express from 'express';

import authMiddleware from '../../middleware/auth.middleware.js';


import {

    generatePerformanceReport,
    getInterviewHistory,
    getDashboard,
    getPerformanceReport,
    downloadPerformanceReport

} from '../../controller/performance/performance.controller.js';

import { generatePerformanceReportLimiter } from "../../middleware/rateLimiter.middleware.js"


const router = express.Router();

// Generate Performance Report (AI)
router.post(
    "/performance/generate",
    generatePerformanceReportLimiter,
    authMiddleware,
    generatePerformanceReport
);

// Get Performance Report
router.get(
    "/performance",
    authMiddleware,
    getPerformanceReport
);

// Download Performance PDF
router.get(
    "/performance/pdf",
    authMiddleware,
    downloadPerformanceReport
)

// Interview History
router.get(
    "/history",
    authMiddleware,
    getInterviewHistory
);


// Dashboard
router.get(
    "/dashboard",
    authMiddleware,
    getDashboard
);



export default router;