import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sessionId: { // Connects Answer → InterviewSession
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: true
    },

    interviewId: { // Connects Answer → Interview question 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true
    },

    questionIndex: {
        type: Number,
        required: true
    },

    question: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ["Technical", "Behavioral", "System Design", "HR"],
        required: true
    },

    answerText: {
        type: String,
        default: ""
    },

    audioUrl: {
        type: String,
        default: ""

    },

    videoUrl: {
        type: String,
        default: ""

    },

    transcript: {
        type: String,
        default: ""
    },


}, { timestamps: true });

// One answer per question per session. This also blocks a double submit from saving the same answer twice.
AnswerSchema.index({ sessionId: 1, questionIndex: 1 }, { unique: true });

const Answer = mongoose.model("Answer", AnswerSchema);

export default Answer;