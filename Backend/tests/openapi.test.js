import "./helpers.js";
import test from "node:test";
import assert from "node:assert/strict";
import SwaggerParser from "@apidevtools/swagger-parser";
import { specPath } from "../src/docs/swagger.js";

test("openapi.yaml is a valid OpenAPI 3 document that covers the whole API", async () => {
    const api = await SwaggerParser.validate(specPath);
    const documented = Object.keys(api.paths);
    for (const path of [
        "/signup", "/verify-otp", "/resend-otp", "/login", "/refresh-token", "/logout", "/forgot-password", "/reset-password",
        "/profile", "/update-profile", "/change-password", "/deactivate-account", "/delete-account",
        "/resume/upload", "/resume", "/resume/file", "/resume/analysis",
        "/interview/generate", "/interviews", "/interview/{interviewId}", "/session/start", "/answer",
        "/session/{sessionId}", "/session/{sessionId}/report",
        "/performance/generate", "/performance", "/performance/pdf", "/history", "/dashboard", "/health",
    ]) {
        assert.ok(documented.includes(path), `missing in openapi.yaml: ${path}`);
    }
});
