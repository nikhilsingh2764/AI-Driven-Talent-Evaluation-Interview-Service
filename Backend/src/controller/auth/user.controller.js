import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
    SignupService, LoginService, ProfileService, LogoutService, VerifyOTPService,
    UpdateProfileService, ForgotPasswordService, ResetPasswordService,
    updatePasswordService, DeactivateAccountService, DeleteAccountService,
} from "../../service/auth/auth.service.js";
import { accessTokenOptions, refreshTokenOptions, clearOptions } from "../../utils/auth/cookieOptions.js";

const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
};

export const Signup = TryCatch(async (req, res) => {
    const data = await SignupService(req.body);
    return res.status(201).json(new ApiResponse(201, "OTP sent to your email", data));
});

export const VerifyOTP = TryCatch(async (req, res) => {
    const data = await VerifyOTPService(req.body);
    return res.status(201).json(new ApiResponse(201, "Account created successfully", data));
});

export const Login = TryCatch(async (req, res) => {
    const { user, accessToken, refreshToken } = await LoginService(req.body);
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    return res.status(200).json(new ApiResponse(200, "Login successful", user));
});

export const Profile = TryCatch(async (req, res) => {
    const user = await ProfileService(req.user._id);
    return res.status(200).json(new ApiResponse(200, "Profile fetched successfully", user));
});

export const Logout = TryCatch(async (req, res) => {
    await LogoutService(req.cookies?.refreshToken);
    clearAuthCookies(res);
    return res.status(200).json(new ApiResponse(200, "Logout successful"));
});

export const UpdateProfile = TryCatch(async (req, res) => {
    const user = await UpdateProfileService(req.user._id, req.body);
    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", user));
});

export const UpdatePassword = TryCatch(async (req, res) => {
    await updatePasswordService(req.user._id, req.body);
    clearAuthCookies(res); // all sessions were revoked, so the user logs in again with the new password
    return res.status(200).json(new ApiResponse(200, "Password changed. Please log in again", null));
});

export const DeactivateAccount = TryCatch(async (req, res) => {
    await DeactivateAccountService(req.user._id);
    clearAuthCookies(res);
    return res.status(200).json(new ApiResponse(200, "Account deactivated successfully", null));
});

export const DeleteAccount = TryCatch(async (req, res) => {
    await DeleteAccountService(req.user._id, req.body.password);
    clearAuthCookies(res);
    return res.status(200).json(new ApiResponse(200, "Account deleted successfully", null));
});

export const ForgotPassword = TryCatch(async (req, res) => {
    const data = await ForgotPasswordService(req.body.email);
    return res.status(200).json(new ApiResponse(200, "If that email is registered, a reset OTP has been sent", data));
});

export const ResetPassword = TryCatch(async (req, res) => {
    await ResetPasswordService(req.body);
    return res.status(200).json(new ApiResponse(200, "Password reset successfully. You can log in now", null));
});
