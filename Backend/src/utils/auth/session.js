import generateToken from "./generateToken.js";
import { hashValue } from "./generateOTP.js";
import { env } from "../../config/env.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";

// Creates an access + refresh token pair and stores the refresh token (hashed) so it can be revoked.
export const issueTokens = async (user) => {
    const accessToken = generateToken(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        env.accessExpiresIn,
    );
    const refreshToken = generateToken({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, env.refreshExpiresIn);

    await refreshTokenRepository.create({
        userId: user._id,
        tokenHash: hashValue(refreshToken),
        expiresAt: new Date(Date.now() + env.refreshTtlMs),
    });

    return { accessToken, refreshToken };
};
