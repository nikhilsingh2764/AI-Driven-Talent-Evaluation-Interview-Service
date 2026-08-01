import mongoose from "mongoose";

const interviewSessionSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview"
    },

    currentQuestionIndex: {
        type:Number,
        default:0
    },

    status: {
        type: String,
        enum: ["STARTED", "COMPLETED"],
        default: "STARTED"
    },


}, { timestamps: true });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;