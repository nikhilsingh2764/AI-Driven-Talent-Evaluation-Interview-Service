import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError.js";
import { hashValue } from "../../utils/auth/generateOTP.js";
import { issueTokens } from "../../utils/auth/session.js";
import userRepository from "../../repository/auth/user.repository.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";

// Exchanges a valid refresh token for a new access + refresh pair (rotation: the old one stops working).
const RefreshTokenService = async (refreshToken) => {
    if (!refreshToken) throw new ApiError(401, "Refresh token is missing");

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }

    const stored = await refreshTokenRepository.findByHash(hashValue(refreshToken));
    if (!stored) throw new ApiError(401, "Refresh token expired or revoked");

    const user = await userRepository.findById(decoded.id);
    if (!user) throw new ApiError(401, "User not found");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");

    // deleteOne reports how many rows it removed, so two parallel refreshes cannot both succeed
    const removed = await refreshTokenRepository.deleteByHash(hashValue(refreshToken));
    if (removed.deletedCount === 0) throw new ApiError(401, "Refresh token already used");

    return issueTokens(user);
};

export default RefreshTokenService;
