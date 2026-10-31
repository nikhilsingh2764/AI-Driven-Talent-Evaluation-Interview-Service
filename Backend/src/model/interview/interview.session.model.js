import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({

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

// Only one STARTED session per interview, enforced by the database (blocks two simultaneous "start" requests).
interviewSessionSchema.index({ interviewId: 1 }, { unique: true, partialFilterExpression: { status: "STARTED" } });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;