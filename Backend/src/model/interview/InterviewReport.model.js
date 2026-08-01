import mongoose from "mongoose";

const InterviewReportSchema = mongoose.Schema({

    userId: {  //connect to user
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sessionId: {  //connect to interview session
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: true
    },

    interviewId: { //connect to intervew-Question
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true
    },

    overallScore: {
        type: Number,
        required: true
    },

    technicalScore: {
        type: Number,
        required: true

    },

    communicationScore: {
        type: Number,
        required: true

    },

    problemSolvingScore: {
        type: Number,
        required: true

    },

    confidenceScore: {
        type: Number,
        required: true

    },

    strengths: {
        type: [String],
        default: []
    },

    weaknesses: {
        type: [String],
        default: []
    },

    feedback: {
        type: String,
        default: ""
    },

    recommendations: {
        type: [String],
        default: []
    },

    interviewReadiness: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["PENDING", "GENERATED"],
        default: "GENERATED"

    },


}, { timestamps: true });


const InterviewReport = mongoose.model("InterviewReport", InterviewReportSchema);

export default InterviewReport;