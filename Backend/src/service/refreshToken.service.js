import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import UserRepository from "../repository/user.repository.js";
import generateToken from "../utils/generateToken.js";
import refreshTokenRepository from "../repository/refreshToken.repository.js";


const RefreshTokenService = async (refreshToken) => {


    // Check refresh token exists
    if (!refreshToken) {
        throw new ApiError(
            401,
            "Refresh token is missing"
        );
    }


    // Verify refresh token
    let decoded;

    try {

        decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

    } catch(error){

        throw new ApiError(
            401,
            "Invalid refresh token"
        );

    }



    // Check token exists in database

    const storedToken =
        await refreshTokenRepository.findByToken(
            refreshToken
        );


    if(!storedToken){

        throw new ApiError(
            401,
            "Refresh token expired or revoked"
        );

    }



    // Find user

    const user =
        await UserRepository.findById(decoded.id);



    if (!user) {

        throw new ApiError(
            401,
            "User not found"
        );

    }



    // Check active account

    if (!user.isActive) {

        throw new ApiError(
            403,
            "Account is deactivated"
        );

    }



    // Delete old refresh token

    await refreshTokenRepository.deleteByToken(
        refreshToken
    );



    // Generate new access token

    const newAccessToken =
        generateToken(
            {
                id:user._id,
                email:user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRES_IN
        );




    // Generate new refresh token

    const newRefreshToken =
        generateToken(
            {
                id:user._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            process.env.REFRESH_TOKEN_EXPIRES_IN
        );




    // Save new refresh token

    await refreshTokenRepository.create({

        userId:user._id,

        token:newRefreshToken,

        expiresAt:new Date(
            Date.now() +
            15 * 24 * 60 * 60 * 1000
        )

    });



    return {

        newAccessToken,

        newRefreshToken

    };


};


export default RefreshTokenService;