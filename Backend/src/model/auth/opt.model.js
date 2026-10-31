import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        username: { type: String, default: null, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        password: { type: String, default: null, select: false }, // bcrypt hash of the signup password
        otp: { type: String, required: true }, // sha256 of the code, never the plain code
        type: { type: String, enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"], required: true },
        attempts: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired OTPs
otpSchema.index({ email: 1, type: 1 });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
