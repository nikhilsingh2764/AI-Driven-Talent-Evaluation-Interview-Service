import express from "express";
import {
    Signup, DeactivateAccount, ForgotPassword, ResetPassword, VerifyOTP,
    DeleteAccount, Login, Profile, Logout, UpdateProfile, UpdatePassword,
} from "../../controller/auth/user.controller.js";
import {
    signupValidator, verifyOtpValidator, LoginValidator, forgotPasswordValidator,
    resetPasswordValidator, updateProfileValidator, changePasswordValidator, deleteAccountValidator,
} from "../../validators/auth.validator.js";
import validate from "../../middleware/validate.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import { apiLimiter, forgotPasswordLimiter, verifyOtpLimiter, signupLimiter, loginLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/signup", signupLimiter, signupValidator, validate, Signup);
router.post("/verify-otp", verifyOtpLimiter, verifyOtpValidator, validate, VerifyOTP);
router.post("/login", loginLimiter, LoginValidator, validate, Login);
router.post("/logout", Logout); // works even with an expired access token, so a client can always sign out
router.get("/profile", apiLimiter, authMiddleware, Profile);
router.patch("/update-profile", apiLimiter, authMiddleware, updateProfileValidator, validate, UpdateProfile);
router.patch("/change-password", apiLimiter, authMiddleware, changePasswordValidator, validate, UpdatePassword);
router.patch("/deactivate-account", apiLimiter, authMiddleware, DeactivateAccount);
router.delete("/delete-account", apiLimiter, authMiddleware, deleteAccountValidator, validate, DeleteAccount);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidator, validate, ForgotPassword);
router.post("/reset-password", verifyOtpLimiter, resetPasswordValidator, validate, ResetPassword);

export default router;
