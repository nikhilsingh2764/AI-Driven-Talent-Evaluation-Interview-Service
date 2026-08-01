import mongoose from "mongoose";


const ResumeAnalysisSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        unique: true,

    },

    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
        required: true,
    },

    summary: {
        type: String,
        required: true,
    },

    technicalSkills: {
        type: [String],
        default: []
    },

    softSkills: {
        type: [String],
        default: []
    },

    strengths: {
        type: [String],
        default: []
    },

    weaknesses: {
        type: [String],
        default: []
    },

    missingSkills: {
        type: [String],
        default: []
    },

    atsScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },

    recommendedRoles: {
        type: [String],
        default: []
    },

    improvementSuggestions: {
        type: [String],
        default: []
    },


}, { timestamps: true });

const ResumeAnalysis = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema)

export default ResumeAnalysis;