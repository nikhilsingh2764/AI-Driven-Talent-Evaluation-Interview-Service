import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js"

import {
    createInterviewService, startInterviewSessionService, submitAnswerService,
    generateInterviewReportService, getInterviewSessionService
} from "../../service/interview/interview.service.js";





// Generate Interview Questions
export const generateInterviewQuestions = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const { role, experience, difficulty } = req.body;

    const Interview = await createInterviewService({
        userId,
        role,
        experience,
        difficulty
    })


    res.status(201).json(
        new ApiResponse(201, "Interview questions generated successfully", Interview)
    )

});



// Start Interview Session
export const startInterviewSession = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const { interviewId } = req.body;

    const session = await startInterviewSessionService({ userId, interviewId });

    res.status(201).json(
        new ApiResponse(201, "Interview session started successfully", session)
    )

});

// Submit Answer
export const submitAnswer = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const { sessionId, answerText } = req.body;

    const answer = await submitAnswerService({ userId, sessionId, answer: answerText });

    res.status(201).json(
        new ApiResponse(200, "Answer submitted successfully", answer)
    )


});


// Get Current Interview Session
export const getInterviewSession = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await getInterviewSessionService({
        userId,
        sessionId
    });

    res.status(200).json(
        new ApiResponse(
            200,
            "Interview session fetched successfully",
            session
        )
    );

});







