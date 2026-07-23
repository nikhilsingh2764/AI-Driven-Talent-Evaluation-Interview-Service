import express from 'express';
import { Signup, DeactivateAccount, ForgotPassword, ResetPassword, VerifyOTP, DeleteAccount, Login, Profile, Logout, UpdateProfile, UpdatePassword } from '../controller/user.controller.js';
import { signupValidator, verifyOtpValidator, LoginValidator } from '../validators/auth.validator.js';
import validate from '../middleware/validate.js';
import authMiddleware from '../middleware/auth.middleware.js';

import { apiLimiter, forgotPasswordLimiter, verifyOtpLimiter, signupLimiter, loginLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();


router.post('/Signup', signupLimiter, signupValidator, validate, Signup)

router.post('/verify-otp', verifyOtpLimiter, verifyOtpValidator, validate, VerifyOTP)

router.post('/Login', loginLimiter, LoginValidator, validate, Login)

router.get('/Profile', apiLimiter, authMiddleware, Profile)

router.post('/Logout', authMiddleware, Logout)

router.patch('/Update-Profile', apiLimiter, authMiddleware, UpdateProfile)

router.patch('/change-password', apiLimiter, authMiddleware, UpdatePassword)

router.patch('/deactivate-account', apiLimiter, authMiddleware, DeactivateAccount)

router.delete('/delete-account', apiLimiter, authMiddleware, DeleteAccount)

router.post("/forgot-password", forgotPasswordLimiter, ForgotPassword);

router.post("/reset-password", verifyOtpLimiter, ResetPassword);


export default router;
































