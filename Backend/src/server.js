import { env, validateEnv } from "./config/env.js";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { storageProvider } from "./utils/upload/storage.js";
import { emailConfigured, emailMode, aiMockEnabled, cloudinaryConfigured } from "./config/env.js";

const start = async () => {
    try {
        validateEnv();
        await connectDB();

        const server = app.listen(env.port, () => {
            console.log(`Server running at http://localhost:${env.port}`);
            console.log(`Storage: ${storageProvider()} | Email: ${emailMode()} | AI: ${aiMockEnabled() ? "MOCK" : "OpenRouter"}`);
            if (env.isProd) {
                if (!emailConfigured()) console.warn("WARNING: no email provider configured. Signup OTP emails will NOT be delivered (set BREVO_API_KEY + EMAIL_FROM, or SMTP).");
                if (!cloudinaryConfigured()) console.warn("WARNING: Cloudinary not configured. Resumes are saved on local disk, which most hosts (Render) delete on every restart or deploy.");
                if (!process.env.OPENROUTER_API_KEY) console.warn("WARNING: OPENROUTER_API_KEY missing. AI endpoints will return 503.");
            }
        });

        const shutdown = (signal) => {
            console.log(`${signal} received, shutting down...`);
            server.close(async () => {
                await mongoose.connection.close();
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000).unref();
        };
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1); // a crashed start must not look like a running server
    }
};

process.on("unhandledRejection", (reason) => console.error("Unhandled promise rejection:", reason));

start();
