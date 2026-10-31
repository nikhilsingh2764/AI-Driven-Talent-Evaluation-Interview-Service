import crypto from "node:crypto";

// Cryptographically secure 6-digit OTP (Math.random is predictable).
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export const hashValue = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export const safeEqual = (a, b) => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export default generateOTP;
