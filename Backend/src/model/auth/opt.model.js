import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            default: null,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            default: null,
            select: false
        },

        otp: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Automatically delete expired OTPs
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;