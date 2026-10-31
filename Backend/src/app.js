import { env } from "./config/env.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import errorHandler from "./middleware/error.middleware.js";
import ApiError from "./utils/ApiError.js";

import userRouter from "./route/auth/user.routes.js";
import tokenRoutes from "./route/auth/token.routes.js";
import resumeRoutes from "./route/resume/resume.routes.js";
import analysisRouters from "./route/resume/analysis.routes.js";
import interviewRouters from "./route/interview/interview.routes.js";
import performanceRouters from "./route/performance/performance.routes.js";

const app = express();

app.set("trust proxy", env.trustProxy); // real client IP (rate limiting) behind reverse proxies; set TRUST_PROXY to the number of proxies
app.use(helmet());

app.use(
    cors({
        origin: (origin, cb) => {
            // No Origin header = curl / Postman / same-origin requests
            if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
            return cb(new ApiError(403, `Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
// Express 5 leaves req.body undefined when a request has no body; controllers expect an object.
app.use((req, res, next) => {
    req.body ??= {};
    next();
});

if (process.env.NODE_ENV !== "test") app.use(morgan(env.isProd ? "combined" : "dev"));

app.get("/health", (req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ success: dbUp, status: dbUp ? "ok" : "database unavailable", uptime: process.uptime() });
});

const API = "/api/v1";
// API answers are per-user. Tell browsers and CDNs (Vercel can cache proxied responses) never to store them.
app.use(API, (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});
app.use(API, userRouter);
app.use(API, tokenRoutes);
app.use(API, resumeRoutes);
app.use(API, analysisRouters);
app.use(API, interviewRouters);
app.use(API, performanceRouters);

app.use((req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)));
app.use(errorHandler); // always last

export default app;
