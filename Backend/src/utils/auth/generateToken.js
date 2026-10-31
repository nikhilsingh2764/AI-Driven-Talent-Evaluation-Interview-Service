import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// jwtid makes every token unique. Without it, two tokens for the same user issued in the same second are identical,
// which would make refresh-token rotation (and revoking one token) impossible.
const generateToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn, jwtid: crypto.randomUUID() });

export default generateToken;
