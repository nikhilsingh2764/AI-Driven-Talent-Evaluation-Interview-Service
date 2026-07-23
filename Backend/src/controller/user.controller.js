import TryCatch from "../middleware/TryCatch.js";
import ApiResponse from "../utils/ApiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookieOptions.js";


import { SignupService, LoginService, ProfileService, LogoutService, VerifyOTPService, 
UpdateProfileService, ForgotPasswordService, ResetPasswordService,
updatePasswordService, DeactivateAccountService, DeleteAccountService } from "../service/auth.service.js";



export const Signup = TryCatch(async (req, res) => {

    const data = await SignupService(req.body);

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                'OTP sent successfully',
                data
            )
        );

});


export const VerifyOTP = TryCatch(async (req, res) => {

    const data = await VerifyOTPService(req.body);

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                'Account created successfully',
                data
            )
        );

});



export const Login = TryCatch(async (req, res) => {

    const { user, accessToken, refreshToken } = await LoginService(req.body);

    //store tokens in res cookie

    res.cookie("accessToken", accessToken, accessTokenOptions);

    res.cookie("refreshToken", refreshToken, refreshTokenOptions);


    return res.status(200).json(
        new ApiResponse(200, "Login Successful", user)
    );

});



export const Profile = TryCatch(async (req, res) => {

    //get userId from auth middleware
    const userId = req.user._id;


    //send userId to ProfileService
    const user = await ProfileService(userId);

    //send success response
    res.status(200).json(
        new ApiResponse(200, "Profile fetched successfully", user)
    );

});



export const Logout = TryCatch(async (req, res) => {

    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    // Remove refresh token from database
    await LogoutService(refreshToken);


    //clear access and refresh token from cookies
    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);


    return res.status(200).json(
        new ApiResponse(200, "Logout successful")
    );


});



export const UpdateProfile = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const user = await UpdateProfileService(userId, req.body)

    return res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", user)
    );


});


export const UpdatePassword = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const result = await updatePasswordService(userId, req.body);


    return res.status(200).json(
        200,
        "password changed successfully",
        result
    )



});




export const DeactivateAccount = TryCatch(async (req, res) => {

    const userId = req.user._id;


    await DeactivateAccountService(userId);

    // Logout user
    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Account deactivated successfully",
            null
        )
    );

});



export const DeleteAccount = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const { password } = req.body;

    await DeleteAccountService(userId, password);

    // Logout user
    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);

    return res.status(200).json(
        new ApiResponse(
            200,
            "Account deleted successfully",
            null
        )
    );


});


export const ForgotPassword = TryCatch(async (req, res) => {

    const { email } = req.body;

    await ForgotPasswordService(email);

    return res.status(200).json(
        new ApiResponse(200, "Password reset OTP sent successfully", null)
    );



});


export const ResetPassword = TryCatch(async (req, res) => {

    const { email, otp, newPassword } = req.body;

    await ResetPasswordService({email, otp, newPassword})

    return res.status(200).json(
        new ApiResponse(200,"Password reset successfully",null)
    )

});
