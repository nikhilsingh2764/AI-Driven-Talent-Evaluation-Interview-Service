import bcrypt from "bcrypt";
import ApiError from "../../utils/ApiError.js";
import { env } from "../../config/env.js";
import { cache } from "../../config/cache.js";
import userRepository from "../../repository/auth/user.repository.js";
import otpRepository from "../../repository/auth/otp.repository.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import interviewRepository from "../../repository/interview/interview.repository.js";
import sessionRepository from "../../repository/interview/interviewSession.repository.js";
import answerRepository from "../../repository/interview/answer.repository.js";
import reportRepository from "../../repository/interview/interviewReport.repository.js";
import performanceRepository from "../../repository/performance/performance.repository.js";
import { sendEmailSafe } from "../email/email.service.js";
import sendOTPService, { SALT_ROUNDS } from "./otp.service.js";
import { issueTokens } from "../../utils/auth/session.js";
import { hashValue, safeEqual } from "../../utils/auth/generateOTP.js";
import { deleteResumeFile } from "../../utils/upload/storage.js";
import welcomeTemplate from "../../templates/welcome.template.js";

const MAX_OTP_ATTEMPTS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

const publicUser = (u) => ({
    id: u._id,
    username: u.username,
    email: u.email,
    isVerified: u.isVerified,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
});

// Checks an OTP. Wrong guesses are counted and the OTP is burned after MAX_OTP_ATTEMPTS.
const checkOtp = async (otpData, otp) => {
    if (!otpData) throw new ApiError(400, "Invalid OTP");
    if (otpData.expiresAt < new Date()) {
        await otpRepository.deleteById(otpData._id);
        throw new ApiError(400, "OTP has expired. Request a new one");
    }
    if (!safeEqual(otpData.otp, hashValue(otp))) {
        const updated = await otpRepository.incrementAttempts(otpData._id);
        if (updated && updated.attempts >= MAX_OTP_ATTEMPTS) {
            await otpRepository.deleteById(otpData._id);
            throw new ApiError(400, "Too many wrong attempts. Request a new OTP");
        }
        throw new ApiError(400, "Invalid OTP");
    }
};

export const SignupService = async ({ username, email, password }) => {
    username = username.trim();
    email = email.trim().toLowerCase();

    if (await userRepository.emailExist(email)) throw new ApiError(409, "Email already exists");
    if (await userRepository.usernameExist(username)) throw new ApiError(409, "Username already exists");

    const otp = await sendOTPService({ username, email, password, type: "EMAIL_VERIFICATION" });
    return env.exposeOtp ? { email, devOtp: otp } : { email };
};

export const VerifyOTPService = async ({ email, otp }) => {
    email = email.trim().toLowerCase();
    const otpData = await otpRepository.findByEmailAndType(email, "EMAIL_VERIFICATION");
    await checkOtp(otpData, otp);

    // Unique indexes on email/username make a double-click or race fail with 409 instead of creating two users
    const user = await userRepository.create({
        email: otpData.email,
        username: otpData.username,
        password: otpData.password,
        isVerified: true,
    });
    await otpRepository.deleteByEmailAndType(email, "EMAIL_VERIFICATION");

    await sendEmailSafe({ to: user.email, subject: "Welcome!", html: welcomeTemplate(user.username) });
    return publicUser(user); // never return the password hash
};

export const LoginService = async ({ email, password }) => {
    email = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(email);
    if (!user) throw new ApiError(400, "Invalid email or password");
    if (!user.isVerified) throw new ApiError(403, "Please verify your email first");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");

    // A lock that has run out is cleared, so one wrong password afterwards does not instantly re-lock
    if (user.lockUntil && user.lockUntil <= new Date()) {
        await userRepository.resetLoginFailures(user._id);
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
    }
    if (user.lockUntil && user.lockUntil > new Date()) {
        throw new ApiError(423, "Account temporarily locked after too many failed attempts. Try again later");
    }

    if (!(await bcrypt.compare(password, user.password))) {
        await userRepository.registerFailedLogin(user._id, MAX_LOGIN_ATTEMPTS, LOCK_MS);
        throw new ApiError(400, "Invalid email or password");
    }

    if (user.failedLoginAttempts > 0 || user.lockUntil) await userRepository.resetLoginFailures(user._id);

    const { accessToken, refreshToken } = await issueTokens(user);
    return { user: { id: user._id, email: user.email, username: user.username }, accessToken, refreshToken };
};

export const ProfileService = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return publicUser(user);
};

export const LogoutService = async (refreshToken) => {
    if (refreshToken) await refreshTokenRepository.deleteByHash(hashValue(refreshToken));
    return null;
};

export const UpdateProfileService = async (userId, { username }) => {
    username = username.trim();
    if (await userRepository.usernameTakenByOther(username, userId)) throw new ApiError(409, "Username already taken");

    const updated = await userRepository.updateProfile(userId, { username });
    if (!updated) throw new ApiError(404, "User not found");
    return publicUser(updated);
};

export const ForgotPasswordService = async (email) => {
    email = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);

    // Same answer whether or not the email exists, so this endpoint cannot be used to find registered emails
    if (!user || !user.isVerified || !user.isActive) return {};

    const otp = await sendOTPService({ email: user.email, type: "PASSWORD_RESET" });
    return env.exposeOtp ? { devOtp: otp } : {};
};

export const ResetPasswordService = async ({ email, otp, newPassword }) => {
    email = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);
    const otpData = user ? await otpRepository.findByEmailAndType(email, "PASSWORD_RESET") : null;
    await checkOtp(otpData, otp);

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updateProfile(user._id, { password: hashed, failedLoginAttempts: 0, lockUntil: null });
    await otpRepository.deleteByEmailAndType(email, "PASSWORD_RESET");
    await refreshTokenRepository.deleteByUserId(user._id); // log out every device
    return null;
};

export const updatePasswordService = async (id, { oldPassword, newPassword }) => {
    const user = await userRepository.findByIdWithPassword(id);
    if (!user) throw new ApiError(404, "User not found");

    if (!(await bcrypt.compare(oldPassword, user.password))) throw new ApiError(401, "Old password is incorrect");
    if (oldPassword === newPassword) throw new ApiError(400, "New password must be different from the old one");

    await userRepository.updateProfile(id, { password: await bcrypt.hash(newPassword, SALT_ROUNDS) });
    await refreshTokenRepository.deleteByUserId(id); // log out every device
    return null;
};

export const DeactivateAccountService = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    if (!user.isActive) throw new ApiError(400, "Account is already deactivated");

    await userRepository.deactivateAccount(id);
    await refreshTokenRepository.deleteByUserId(id);
    return null;
};

// Deletes the account AND everything that belongs to it (resume file, analysis, interviews, reports).
export const DeleteAccountService = async (id, password) => {
    const user = await userRepository.findByIdWithPassword(id);
    if (!user) throw new ApiError(404, "User not found");
    if (!(await bcrypt.compare(password, user.password))) throw new ApiError(401, "Invalid password");

    const resume = await resumeRepository.findByUserId(id);
    if (resume) await deleteResumeFile(resume);

    await Promise.all([
        resumeRepository.deleteByUserId(id),
        resumeAnalysisRepository.deleteByUserId(id),
        answerRepository.deleteByUserId(id),
        reportRepository.deleteByUserId(id),
        sessionRepository.deleteByUserId(id),
        interviewRepository.deleteByUserId(id),
        performanceRepository.deleteByUserId(id),
        refreshTokenRepository.deleteByUserId(id),
    ]);
    await userRepository.findByIdAndDelete(id);
    await cache.invalidateUser(id);
    return null;
};
