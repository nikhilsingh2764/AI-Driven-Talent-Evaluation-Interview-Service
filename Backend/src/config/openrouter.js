import OpenAI from "openai";

// Created on first use: the OpenAI client throws if the key is missing, and that must not crash the whole server at import time.
let client = null;

export const getOpenRouter = () => {
    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
            timeout: 90 * 1000,
            maxRetries: 1,
        });
    }
    return client;
};
