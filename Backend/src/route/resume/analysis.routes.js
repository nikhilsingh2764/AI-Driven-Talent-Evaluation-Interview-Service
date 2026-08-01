import express from 'express';

import authMiddleware from '../../middleware/auth.middleware.js';
import { resumeAnalysisLimiter } from '../../middleware/rateLimiter.middleware.js';

import { analyzeResume } from '../../controller/resume/analysis.controller.js';



const router = express.Router();


router.post(
    "/resume/analysis",
    resumeAnalysisLimiter,
    authMiddleware,
    analyzeResume
);



export default router;