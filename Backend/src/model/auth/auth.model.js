import mongoose from "mongoose";


const authSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
        trim: true,
        unique: true,

    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    // Account lock security

    failedLoginAttempts: {
        type: Number,
        default: 0
    },


    lockUntil: {
        type: Date,
        default: null
    }

}, { timestamps: true })




const User = mongoose.model('User', authSchema);

export default User;






