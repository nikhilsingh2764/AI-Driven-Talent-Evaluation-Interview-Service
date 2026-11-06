/**
 * `npm run test:e2e` - boots the REAL server against a throw-away MongoDB database and runs the whole API test.
 *   Phase 1: rate limiting OFF, every endpoint exercised (scripts/e2e.mjs)
 *   Phase 2: rate limiting ON, checks that one person's failed logins cannot lock out others (scripts/e2e-ratelimit.mjs)
 * Needs MongoDB running locally (Redis is optional: set E2E_REDIS_URL to include it).
 * Override the database with E2E_MONGODB_URI. It is DROPPED at the start, so never point it at real data.
 */
import { spawn } from "node:child_process";
import mongoose from "mongoose";

const MONGODB_URI = process.env.E2E_MONGODB_URI || "mongodb://127.0.0.1:27017/ai_interview_e2e";
const PORT = 5057;

await mongoose.connect(MONGODB_URI);
await mongoose.connection.dropDatabase();
await mongoose.disconnect();

const serverEnv = (extra) => ({
    ...process.env,
    NODE_ENV: "development",
    PORT: String(PORT),
    MONGODB_URI,
    ACCESS_TOKEN_SECRET: "e2e-access-secret-e2e-access-secret",
    REFRESH_TOKEN_SECRET: "e2e-refresh-secret-e2e-refresh-secret",
    CLIENT_URL: "http://localhost:5173",
    EXPOSE_OTP_IN_RESPONSE: "true",
    AI_MOCK: "true",
    OPENROUTER_API_KEY: "",
    REDIS_URL: process.env.E2E_REDIS_URL || "",
    BREVO_API_KEY: "",
    EMAIL_HOST: "",
    CLOUDINARY_CLOUD_NAME: "",
    ...extra,
});

const startServer = async (extra) => {
    const child = spawn("node", ["src/server.js"], { env: serverEnv(extra) });
    let log = "";
    child.stdout.on("data", (d) => (log += d));
    child.stderr.on("data", (d) => (log += d));
    for (let i = 0; i < 60; i++) {
        try {
            if ((await fetch(`http://127.0.0.1:${PORT}/health`)).ok) return { child, log: () => log };
        } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 500));
    }
    child.kill();
    throw new Error(`server did not start:\n${log}`);
};

const stop = (child) =>
    new Promise((resolve) => {
        child.once("exit", resolve);
        child.kill("SIGTERM");
        setTimeout(resolve, 3000);
    });

const runScript = (file, extraEnv = {}) =>
    new Promise((resolve) => {
        const p = spawn("node", [file], { stdio: "inherit", env: { ...process.env, BASE_URL: `http://127.0.0.1:${PORT}`, MONGODB_URI, ...extraEnv } });
        p.on("exit", (code) => resolve(code));
    });

let failed = false;
for (const [title, file, extra] of [
    ["Phase 1: full API (rate limiting off)", "scripts/e2e.mjs", { RATE_LIMIT_DISABLED: "true" }],
    ["Phase 2: rate limiting on", "scripts/e2e-ratelimit.mjs", { RATE_LIMIT_DISABLED: "false" }],
]) {
    console.log(`\n══════ ${title} ══════`);
    const { child, log } = await startServer(extra);
    const code = await runScript(file);
    await stop(child);
    if (code !== 0) {
        failed = true;
        console.log("\n--- last server log lines ---\n" + log().split("\n").slice(-20).join("\n"));
        break;
    }
}
process.exit(failed ? 1 : 0);
