import mongoose from "mongoose";

const interviewSchema = mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },

    analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResumeAnalysis',
        required: true
    },

    role: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },

    questions: [
        {
            question: {
                type: String,
            },
            category: {
                type: String,
                enum: ["Technical", "Behavioral", "System Design", "HR"],
                default: "Technical"
            }
        }
    ],

    status: {
        type: String,
        enum: ["CREATED", "STARTED", "COMPLETED"],
        default: "CREATED"
    }

}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;