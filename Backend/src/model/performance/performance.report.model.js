import mongoose from "mongoose";

const PerformanceReportSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    overallProgress: {
        type: Number,
        required: true
    },

    technicalProgress: {
        type: Number,
        required: true
    },

    communicationProgress: {
        type: Number,
        required: true
    },

    problemSolvingProgress: {
        type: Number,
        required: true
    },

    confidenceProgress: {
        type: Number,
        required: true
    },

    strongestSkill: {
        type: String,
        default: ""
    },

    weakestSkill: {
        type: String,
        default: ""
    },

    improvementAreas: {
        type: [String],
        default: []
    },

    studyPlan: {
        type: [String],
        default: []
    },

    summary: {
        type: String,
        default: ""
    },

    interviewReadiness: {
        type: Number,
        required: true
    },

    totalInterviews: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["GENERATED"],
        default: "GENERATED"
    }

}, { timestamps: true });

const PerformanceReport = mongoose.model( "PerformanceReport",PerformanceReportSchema);

export default PerformanceReport;