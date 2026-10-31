import TryCatch from "../../middleware/TryCatch.js";
import RefreshTokenService from "../../service/auth/refreshToken.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../../utils/auth/cookieOptions.js";

export const RefreshToken = TryCatch(async (req, res) => {
    const { accessToken, refreshToken } = await RefreshTokenService(req.cookies?.refreshToken);
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    return res.status(200).json(new ApiResponse(200, "Token refreshed successfully", null));
});
