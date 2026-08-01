import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";

import {

    generateInterviewQuestions,
    startInterviewSession,
    submitAnswer,
    getInterviewSession,

} from "../../controller/interview/interview.controller.js";

import {
    interviewQuestionLimiter,
    startInterviewSessionLimiter,
    submitAnswerLimiter
} from "../../middleware/rateLimiter.middleware.js";


const router = express.Router();



// Generate interview questions
router.post(
    "/generate",
    interviewQuestionLimiter,
    authMiddleware,
    generateInterviewQuestions
);

// Start interview session
router.post(
    "/session/start",
    startInterviewSessionLimiter,
    authMiddleware,
    startInterviewSession
);

// Submit answer
router.post(
    "/answer",
    submitAnswerLimiter,
    authMiddleware,
    submitAnswer
);

// Get current interview session
router.get(
    "/session/:sessionId",
    authMiddleware,
    getInterviewSession
);




export default router;