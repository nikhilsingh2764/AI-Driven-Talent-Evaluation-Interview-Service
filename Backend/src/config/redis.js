// Optional Redis client. If REDIS_URL is not set the app runs fine: cache and rate limits use process memory instead.
import "./env.js";
import Redis from "ioredis";

let redis = null;

if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });
    let warned = false;
    redis.on("connect", () => console.log("Redis connected"));
    redis.on("error", (err) => {
        if (!warned) {
            console.warn("Redis error (falling back to no-cache until it recovers):", err.message);
            warned = true;
        }
    });
    redis.on("ready", () => {
        warned = false;
    });
} else {
    console.log("REDIS_URL not set: using in-memory cache and rate limiting.");
}

export default redis;
