import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
    generateInterviewQuestions, startInterviewSession, submitAnswer, getInterviewSession,
    listInterviews, getInterview, getInterviewReport,
} from "../../controller/interview/interview.controller.js";
import {
    createInterviewValidator, startSessionValidator, submitAnswerValidator, sessionIdParam, interviewIdParam,
} from "../../validators/interview.validator.js";
import { interviewQuestionLimiter, startInterviewSessionLimiter, submitAnswerLimiter, apiLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Create an interview (AI generates the questions)
router.post("/interview/generate", interviewQuestionLimiter, authMiddleware, createInterviewValidator, validate, generateInterviewQuestions);
// Keep the old path working
router.post("/generate", interviewQuestionLimiter, authMiddleware, createInterviewValidator, validate, generateInterviewQuestions);

router.get("/interviews", apiLimiter, authMiddleware, listInterviews);
router.get("/interview/:interviewId", apiLimiter, authMiddleware, interviewIdParam, validate, getInterview);

router.post("/session/start", startInterviewSessionLimiter, authMiddleware, startSessionValidator, validate, startInterviewSession);
router.post("/answer", submitAnswerLimiter, authMiddleware, submitAnswerValidator, validate, submitAnswer);
router.get("/session/:sessionId", apiLimiter, authMiddleware, sessionIdParam, validate, getInterviewSession);
router.get("/session/:sessionId/report", apiLimiter, authMiddleware, sessionIdParam, validate, getInterviewReport);

export default router;
