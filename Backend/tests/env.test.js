import "./helpers.js";
import test from "node:test";
import assert from "node:assert/strict";

process.env.TRUST_PROXY = "0";
const { toMs, validateEnv, env } = await import("../src/config/env.js");

test("TRUST_PROXY=0 really means 0 (it used to silently become 1)", () => {
    assert.equal(env.trustProxy, 0);
});

test("toMs understands the token-lifetime formats", () => {
    assert.equal(toMs("15m", 1), 15 * 60_000);
    assert.equal(toMs("15d", 1), 15 * 86_400_000);
    assert.equal(toMs("2h", 1), 2 * 3_600_000);
    assert.equal(toMs("30s", 1), 30_000);
    assert.equal(toMs("900", 1), 900_000); // plain number = seconds (same as jsonwebtoken)
    assert.equal(toMs("soon", 123), 123);
    assert.equal(toMs(undefined, 123), 123);
});

test("validateEnv rejects weak or identical secrets in production", () => {
    const saved = { ...process.env };
    try {
        process.env.NODE_ENV = "production";
        process.env.ACCESS_TOKEN_SECRET = "short";
        process.env.REFRESH_TOKEN_SECRET = "another-short";
        assert.throws(validateEnv, /at least 32/);
        process.env.ACCESS_TOKEN_SECRET = "change-me-access-secret-change-me-access";
        process.env.REFRESH_TOKEN_SECRET = "x".repeat(40);
        assert.throws(validateEnv, /at least 32/);
        process.env.ACCESS_TOKEN_SECRET = "a".repeat(40);
        process.env.REFRESH_TOKEN_SECRET = "a".repeat(40);
        assert.throws(validateEnv, /different/);
        process.env.REFRESH_TOKEN_SECRET = "b".repeat(40);
        assert.doesNotThrow(validateEnv);
    } finally {
        Object.assign(process.env, saved);
    }
});
