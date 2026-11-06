import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";
import { env } from "../config/env.js";

/**
 * Redis-backed counters when REDIS_URL is set (shared between servers, survive restarts), otherwise in-memory.
 *
 * What counts as "one client":
 *  - default  -> the IP address.
 *  - byUser   -> the signed-in user (put authMiddleware BEFORE the limiter).
 *  - byEmail  -> the email in the request body. Behind Render/Vercel many visitors can share one apparent IP, so a
 *                per-IP login limit would lock innocent users out. Per-email still stops brute-forcing one account.
 */
const make = (prefix, windowMs, limit, message, { byUser = false, byEmail = false, skipSuccessfulRequests = false } = {}) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skip: () => env.rateLimitDisabled,
        passOnStoreError: true, // if Redis is down, let requests through instead of failing every request
        keyGenerator: (req) => {
            if (byUser && req.user) return `u:${req.user._id}`;
            const email = req.body?.email;
            if (byEmail && typeof email === "string" && email.length <= 254) return `e:${email.trim().toLowerCase()}`;
            return ipKeyGenerator(req.ip);
        },
        ...(redis ? { store: new RedisStore({ sendCommand: (...args) => redis.call(...args), prefix: `rl:${prefix}:` }) } : {}),
        message: { success: false, statusCode: 429, message, errors: [] },
    });

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// ----- public auth endpoints -----
// A generous per-IP ceiling for everything public (stops floods without punishing people who share an IP).
export const authFloodLimiter = make("authFlood", 15 * MIN, 300, "Too many requests. Please try again later.");
export const loginLimiter = make("login", 15 * MIN, 10, "Too many failed login attempts for this account. Try again in 15 minutes.", { byEmail: true, skipSuccessfulRequests: true });
export const signupLimiter = make("signup", HOUR, 10, "Too many signup attempts for this email. Try again later.", { byEmail: true });
export const verifyOtpLimiter = make("verifyOtp", 15 * MIN, 20, "Too many OTP attempts. Try again later.", { byEmail: true });
export const resendOtpLimiter = make("resendOtp", 15 * MIN, 5, "Too many code requests. Try again in a few minutes.", { byEmail: true });
export const forgotPasswordLimiter = make("forgotPassword", 15 * MIN, 5, "Too many password reset requests. Try again later.", { byEmail: true });
export const refreshTokenLimiter = make("refreshToken", MIN, 30, "Too many refresh requests.");

// ----- signed-in endpoints (limiters that run after authMiddleware key by user) -----
export const apiLimiter = make("api", 15 * MIN, 300, "Too many requests. Please try again later.", { byUser: true });

export const uploadResumeLimiter = make("uploadResume", HOUR, 10, "Too many resume uploads. Try again in an hour.", { byUser: true });
export const ReplaceResumeLimiter = make("replaceResume", HOUR, 10, "Too many resume replacements. Try again in an hour.", { byUser: true });
export const DeleteResumeLimiter = make("deleteResume", HOUR, 10, "Too many resume deletions. Try again in an hour.", { byUser: true });

// AI-backed endpoints (they cost money)
export const resumeAnalysisLimiter = make("resumeAnalysis", 10 * MIN, 10, "Too many resume analyses. Try again in a few minutes.", { byUser: true });
export const interviewQuestionLimiter = make("interviewQuestions", HOUR, 15, "Too many interview generations. Try again later.", { byUser: true });
export const startInterviewSessionLimiter = make("startSession", HOUR, 30, "Too many interview sessions started. Try again later.", { byUser: true });
export const submitAnswerLimiter = make("submitAnswer", HOUR, 300, "Too many answers submitted. Try again later.", { byUser: true });
export const generatePerformanceReportLimiter = make("performanceReport", 15 * MIN, 10, "Too many performance report requests. Try again later.", { byUser: true });
