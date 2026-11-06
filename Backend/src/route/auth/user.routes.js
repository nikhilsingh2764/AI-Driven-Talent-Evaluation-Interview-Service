import express from "express";
import {
    Signup, DeactivateAccount, ForgotPassword, ResetPassword, VerifyOTP, ResendOTP,
    DeleteAccount, Login, Profile, Logout, UpdateProfile, UpdatePassword,
} from "../../controller/auth/user.controller.js";
import {
    signupValidator, verifyOtpValidator, resendOtpValidator, LoginValidator, forgotPasswordValidator,
    resetPasswordValidator, updateProfileValidator, changePasswordValidator, deleteAccountValidator,
} from "../../validators/auth.validator.js";
import validate from "../../middleware/validate.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
    apiLimiter, authFloodLimiter, forgotPasswordLimiter, verifyOtpLimiter, resendOtpLimiter, signupLimiter, loginLimiter,
} from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

// ----- public (per-IP flood ceiling + a per-email limiter on each endpoint) -----
router.post("/signup", authFloodLimiter, signupLimiter, signupValidator, validate, Signup);
router.post("/verify-otp", authFloodLimiter, verifyOtpLimiter, verifyOtpValidator, validate, VerifyOTP);
router.post("/resend-otp", authFloodLimiter, resendOtpLimiter, resendOtpValidator, validate, ResendOTP);
router.post("/login", authFloodLimiter, loginLimiter, LoginValidator, validate, Login);
router.post("/logout", Logout); // works even with an expired access token, so a client can always sign out
router.post("/forgot-password", authFloodLimiter, forgotPasswordLimiter, forgotPasswordValidator, validate, ForgotPassword);
router.post("/reset-password", authFloodLimiter, verifyOtpLimiter, resetPasswordValidator, validate, ResetPassword);

// ----- signed in (authMiddleware first, so the limiter can count per user instead of per IP) -----
router.get("/profile", authMiddleware, apiLimiter, Profile);
router.patch("/update-profile", authMiddleware, apiLimiter, updateProfileValidator, validate, UpdateProfile);
router.patch("/change-password", authMiddleware, apiLimiter, changePasswordValidator, validate, UpdatePassword);
router.patch("/deactivate-account", authMiddleware, apiLimiter, DeactivateAccount);
router.delete("/delete-account", authMiddleware, apiLimiter, deleteAccountValidator, validate, DeleteAccount);

export default router;
