import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({

    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true //only one resume per user
    },

    fileName: {
        type: String,
        required: true
    },

    resumeUrl: {
        type: String,
        required: true
    },

    publicId: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        default: null
    }


}, { timestamps: true });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;

























