import bcrypt from "bcrypt";
import generateOTP, { hashValue } from "../../utils/auth/generateOTP.js";
import sendEmail from "../email/email.service.js";
import otpTemplate from "../../templates/otp.template.js";
import resetPasswordTemplate from "../../templates/resetPassword.template.js";
import otpRepository from "../../repository/auth/otp.repository.js";

export const SALT_ROUNDS = 10;
export const OTP_TTL_MS = 10 * 60 * 1000;

// Creates and emails an OTP. Returns the plain code only so callers can expose it in dev mode.
const sendOTPService = async ({ username = null, email, password = null, type }) => {
    // Only signup carries a password (stored hashed until the OTP is verified)
    const hashedPassword = type === "EMAIL_VERIFICATION" ? await bcrypt.hash(password, SALT_ROUNDS) : null;

    const otp = generateOTP();

    // One active OTP per email + type
    await otpRepository.deleteByEmailAndType(email, type);
    await otpRepository.create({
        username,
        email,
        password: hashedPassword,
        otp: hashValue(otp),
        type,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    const devNote = `OTP: ${otp}`; // only printed when SMTP is not configured
    if (type === "EMAIL_VERIFICATION") {
        await sendEmail({ to: email, subject: "Verify Your Email", html: otpTemplate(username, otp), devNote });
    } else {
        await sendEmail({ to: email, subject: "Reset Your Password", html: resetPasswordTemplate(otp), devNote });
    }
    return otp;
};

export default sendOTPService;
