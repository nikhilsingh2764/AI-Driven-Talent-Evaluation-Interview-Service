import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
    generateInterviewQuestions, startInterviewSession, submitAnswer, getInterviewSession,
    listInterviews, getInterview, getInterviewReport, deleteInterview,
} from "../../controller/interview/interview.controller.js";
import {
    createInterviewValidator, startSessionValidator, submitAnswerValidator, sessionIdParam, interviewIdParam,
} from "../../validators/interview.validator.js";
import { interviewQuestionLimiter, startInterviewSessionLimiter, submitAnswerLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

// authMiddleware runs first on every route so the limiters count per user, not per IP.

// Create an interview (AI generates the questions)
router.post("/interview/generate", authMiddleware, interviewQuestionLimiter, createInterviewValidator, validate, generateInterviewQuestions);
// Keep the old path working
router.post("/generate", authMiddleware, interviewQuestionLimiter, createInterviewValidator, validate, generateInterviewQuestions);

router.get("/interviews", authMiddleware, apiLimiter, listInterviews);
router.get("/interview/:interviewId", authMiddleware, apiLimiter, interviewIdParam, validate, getInterview);
router.delete("/interview/:interviewId", authMiddleware, apiLimiter, interviewIdParam, validate, deleteInterview);

router.post("/session/start", authMiddleware, startInterviewSessionLimiter, startSessionValidator, validate, startInterviewSession);
router.post("/answer", authMiddleware, submitAnswerLimiter, submitAnswerValidator, validate, submitAnswer);
router.get("/session/:sessionId", authMiddleware, apiLimiter, sessionIdParam, validate, getInterviewSession);
router.get("/session/:sessionId/report", authMiddleware, apiLimiter, sessionIdParam, validate, getInterviewReport);

export default router;
