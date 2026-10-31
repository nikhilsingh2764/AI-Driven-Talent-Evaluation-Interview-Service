import mongoose from "mongoose";

const InterviewReportSchema = new mongoose.Schema({

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


// One report per interview session.
InterviewReportSchema.index({ sessionId: 1 }, { unique: true });
InterviewReportSchema.index({ userId: 1, createdAt: -1 });

const InterviewReport = mongoose.model("InterviewReport", InterviewReportSchema);

export default InterviewReport;