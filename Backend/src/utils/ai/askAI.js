import { getOpenRouter } from "../../config/openrouter.js";
import { aiMockEnabled } from "../../config/env.js";
import ApiError from "../ApiError.js";
import { parseAIJson } from "./parseAIJson.js";
import { mockAI } from "./mockAI.js";

const MODEL = () => process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free";

let mockNoticeShown = false;

export const askAI = async (prompt) => {
    try {
        const response = await getOpenRouter().chat.completions.create({
            model: MODEL(),
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });
        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new Error("The AI returned an empty response");
        return content;
    } catch (error) {
        throw new ApiError(502, `AI service failed: ${error.message || "unknown error"}`);
    }
};

/**
 * Runs one AI task and returns validated JSON.
 * task: "analysis" | "questions" | "interviewReport" | "performance" (selects the mock)
 * normalize: validates/cleans the parsed JSON (throws if unusable, which triggers one retry)
 */
export const askAIJson = async ({ task, prompt, mockInput, normalize }) => {
    if (aiMockEnabled()) {
        if (!mockNoticeShown) {
            console.warn("AI MOCK MODE: using built-in fake AI. Set OPENROUTER_API_KEY (and AI_MOCK=false) for real results.");
            mockNoticeShown = true;
        }
        return normalize(mockAI[task](mockInput));
    }

    if (!process.env.OPENROUTER_API_KEY) {
        throw new ApiError(503, "AI is not configured on the server (OPENROUTER_API_KEY is missing)");
    }

    let lastError;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
        const raw = await askAI(prompt);
        try {
            return normalize(parseAIJson(raw));
        } catch (error) {
            lastError = error;
            console.warn(`AI "${task}" returned unusable output (attempt ${attempt}): ${error.message}`);
        }
    }
    throw new ApiError(502, `The AI returned an invalid response for "${task}". Please try again. (${lastError?.message})`);
};
