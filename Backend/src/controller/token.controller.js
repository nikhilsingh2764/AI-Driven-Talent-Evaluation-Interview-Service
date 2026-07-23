import TryCatch from "../middleware/TryCatch.js";
import RefreshTokenService from "../service/refreshToken.service.js";
import ApiResponse from "../utils/ApiResponse.js";


export const RefreshToken = TryCatch(async(req,res)=>{


    const refreshToken = req.cookies.refreshToken;

    const {  newAccessToken, newRefreshToken } = await RefreshTokenService(refreshToken);


    res.cookie(
        "accessToken",
        newAccessToken
    );

    res.cookie(
        "refreshToken",
        newRefreshToken
    );



    return res.status(200).json(
        new ApiResponse(
            200,
            "Token refreshed successfully",
            null
        )
    );


});