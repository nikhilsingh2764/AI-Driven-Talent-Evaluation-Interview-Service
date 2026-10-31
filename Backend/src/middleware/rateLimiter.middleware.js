import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";
import { env } from "../config/env.js";

// Uses Redis (shared between servers, survives restarts) when REDIS_URL is set, otherwise in-memory counters.
const make = (prefix, windowMs, max, message) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        skip: () => env.rateLimitDisabled,
        passOnStoreError: true, // if Redis is down, let requests through instead of failing every request
        ...(redis ? { store: new RedisStore({ sendCommand: (...args) => redis.call(...args), prefix: `rl:${prefix}:` }) } : {}),
        message: { success: false, statusCode: 429, message, errors: [] },
    });

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

export const loginLimiter = make("login", MIN, 15, "Too many login attempts. Try again after 1 minute.");
export const signupLimiter = make("signup", HOUR, 30, "Too many signup attempts. Try again later.");
export const verifyOtpLimiter = make("verifyOtp", 15 * MIN, 20, "Too many OTP attempts. Try again later.");
export const forgotPasswordLimiter = make("forgotPassword", 15 * MIN, 5, "Too many password reset requests. Try again later.");
export const refreshTokenLimiter = make("refreshToken", MIN, 30, "Too many refresh requests.");
export const apiLimiter = make("api", 15 * MIN, 300, "Too many requests. Please try again later.");

export const uploadResumeLimiter = make("uploadResume", HOUR, 10, "Too many resume uploads. Try again in an hour.");
export const ReplaceResumeLimiter = make("replaceResume", HOUR, 10, "Too many resume replacements. Try again in an hour.");
export const DeleteResumeLimiter = make("deleteResume", HOUR, 10, "Too many resume deletions. Try again in an hour.");

// AI-backed endpoints (they cost money)
export const resumeAnalysisLimiter = make("resumeAnalysis", 10 * MIN, 10, "Too many resume analyses. Try again in a few minutes.");
export const interviewQuestionLimiter = make("interviewQuestions", HOUR, 15, "Too many interview generations. Try again later.");
export const startInterviewSessionLimiter = make("startSession", HOUR, 30, "Too many interview sessions started. Try again later.");
export const submitAnswerLimiter = make("submitAnswer", HOUR, 300, "Too many answers submitted. Try again later.");
export const generatePerformanceReportLimiter = make("performanceReport", 15 * MIN, 10, "Too many performance report requests. Try again later.");
