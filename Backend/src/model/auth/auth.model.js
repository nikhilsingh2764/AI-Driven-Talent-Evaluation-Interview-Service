import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, minlength: 3, maxlength: 30, trim: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false }, // bcrypt hash, so no length rule here
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        // Account lock security
        failedLoginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.password;
                delete ret.__v;
                delete ret.failedLoginAttempts;
                delete ret.lockUntil;
                return ret;
            },
        },
    },
);

const User = mongoose.model("User", authSchema);
export default User;
