// Tiny cache with one API. Uses Redis when configured, otherwise a TTL map in memory. Cache failures never break a request.
import redis from "./redis.js";

const mem = new Map(); // key -> { value: jsonString, exp: ms }

const memSweep = () => {
    const now = Date.now();
    for (const [k, v] of mem) if (v.exp <= now) mem.delete(k);
};
setInterval(memSweep, 60 * 1000).unref();

export const cache = {
    async get(key) {
        try {
            if (redis) {
                const raw = await redis.get(key);
                return raw ? JSON.parse(raw) : null;
            }
            const hit = mem.get(key);
            if (!hit) return null;
            if (hit.exp <= Date.now()) {
                mem.delete(key);
                return null;
            }
            return JSON.parse(hit.value);
        } catch {
            return null;
        }
    },

    async set(key, value, ttlSeconds = 300) {
        try {
            const raw = JSON.stringify(value);
            if (redis) await redis.set(key, raw, "EX", ttlSeconds);
            else mem.set(key, { value: raw, exp: Date.now() + ttlSeconds * 1000 });
        } catch {
            /* ignore */
        }
    },

    async del(...keys) {
        try {
            if (redis) {
                if (keys.length) await redis.del(...keys);
            } else keys.forEach((k) => mem.delete(k));
        } catch {
            /* ignore */
        }
    },

    async delByPrefix(prefix) {
        try {
            if (redis) {
                let cursor = "0";
                do {
                    const [next, found] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
                    cursor = next;
                    if (found.length) await redis.del(...found);
                } while (cursor !== "0");
            } else {
                for (const k of mem.keys()) if (k.startsWith(prefix)) mem.delete(k);
            }
        } catch {
            /* ignore */
        }
    },

    // Everything cached for one user (dashboard, performance, history) in one call.
    invalidateUser(userId) {
        return this.delByPrefix(`u:${userId}:`);
    },
};

export const userKey = (userId, ...parts) => `u:${userId}:${parts.join(":")}`;
