import { env } from "../config/env.js";

// Last middleware: converts any error into a consistent JSON response.
const errorMiddleware = (err, req, res, _next) => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Something went wrong";
    let errors = err.errors || [];

    if (err.name === "MulterError") {
        statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        message = err.code === "LIMIT_FILE_SIZE" ? "File too large. Maximum size is 5 MB" : `Upload error: ${err.message}`;
    } else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
        message = field ? `${field} already exists` : "Duplicate value";
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path || "id"}`;
    } else if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
        message = errors[0]?.message || "Validation failed";
    } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Invalid or expired token";
    } else if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Request body is not valid JSON";
    } else if (err.type === "entity.too.large") {
        statusCode = 413;
        message = "Request body too large";
    }

    if (statusCode >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
        if (env.isProd) message = "Internal server error"; // do not leak internals
    }

    return res.status(statusCode).json({ success: false, statusCode, message, errors });
};

export default errorMiddleware;
