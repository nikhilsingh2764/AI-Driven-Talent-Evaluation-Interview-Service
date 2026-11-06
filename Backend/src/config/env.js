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
    // In production a guessable secret lets anyone forge login tokens, so refuse to start with a weak one.
    if (process.env.NODE_ENV === "production") {
        const weak = [process.env.ACCESS_TOKEN_SECRET, process.env.REFRESH_TOKEN_SECRET].some(
            (v) => v.length < 32 || /^change-me/i.test(v),
        );
        if (weak) {
            throw new Error(
                "ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET must be random strings of at least 32 characters in production. " +
                    "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
            );
        }
    }
};

const isProd = process.env.NODE_ENV === "production";

/** "15m" | "2h" | "15d" | "30s" | 900 (seconds)  ->  milliseconds. Falls back when the value is unusable. */
export const toMs = (value, fallbackMs) => {
    const match = /^(\d+)\s*([smhd])?$/i.exec(String(value ?? "").trim());
    if (!match) return fallbackMs;
    const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[(match[2] || "s").toLowerCase()];
    return Number(match[1]) * unit;
};

export const env = {
    isProd,
    port: Number(process.env.PORT) || 5000,
    clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "15d",
    // Cookie / DB lifetimes are derived from the same env values as the JWT expiry, so they can never disagree.
    accessTtlMs: toMs(process.env.ACCESS_TOKEN_EXPIRES_IN, 15 * 60 * 1000),
    refreshTtlMs: toMs(process.env.REFRESH_TOKEN_EXPIRES_IN, 15 * 24 * 60 * 60 * 1000),
    swaggerEnabled: process.env.SWAGGER_ENABLED !== "false",
    // sameSite "lax" works for localhost dev and a same-site deploy. Use "none" (needs HTTPS) for a cross-site frontend.
    cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
    // Dev helper: put the OTP in the API response so you can test without an SMTP account. Never honoured in production.
    exposeOtp: !isProd && process.env.EXPOSE_OTP_IN_RESPONSE === "true",
    rateLimitDisabled: process.env.RATE_LIMIT_DISABLED === "true",
    // How many reverse proxies sit in front of the app (Render = 1; Vercel rewrite + Render = 2). Used for the real client IP.
    // 0 is a valid value (no proxy), so only fall back to 1 when the variable is unset or not a number
    trustProxy: process.env.TRUST_PROXY?.trim() && Number.isInteger(Number(process.env.TRUST_PROXY)) ? Number(process.env.TRUST_PROXY) : 1,
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
