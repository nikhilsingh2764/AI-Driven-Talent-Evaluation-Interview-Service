// Loads .env once and exposes validated settings. Import this FIRST (server.js does).
import "dotenv/config";

const required = ["MONGODB_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];

export const validateEnv = () => {
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`,
        );
    }
    if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different values.");
    }
};

const isProd = process.env.NODE_ENV === "production";

export const env = {
    isProd,
    port: Number(process.env.PORT) || 5000,
    clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "15d",
    refreshTtlMs: 15 * 24 * 60 * 60 * 1000,
    // sameSite "lax" works for localhost dev and a same-site deploy. Use "none" (needs HTTPS) for a cross-site frontend.
    cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
    // Dev helper: put the OTP in the API response so you can test without an SMTP account. Never honoured in production.
    exposeOtp: !isProd && process.env.EXPOSE_OTP_IN_RESPONSE === "true",
    rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === "true",
    // How many reverse proxies sit in front of the app (Render = 1; Vercel rewrite + Render = 2). Used for the real client IP.
    trustProxy: Number(process.env.TRUST_PROXY) || 1,
};

// Two ways to send email: an HTTPS API (Brevo, works on hosts that block SMTP such as Render free) or classic SMTP.
export const brevoConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
export const smtpConfigured = () => Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
export const emailConfigured = () => brevoConfigured() || smtpConfigured();
export const emailMode = () => (brevoConfigured() ? "Brevo API" : smtpConfigured() ? "SMTP" : "console (dev)");
export const cloudinaryConfigured = () =>
    Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
export const aiMockEnabled = () =>
    process.env.AI_MOCK === "true" || (!process.env.OPENROUTER_API_KEY && !isProd);
