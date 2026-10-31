import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
    createInterviewService, listInterviewsService, getInterviewService,
    startInterviewSessionService, submitAnswerService, getInterviewSessionService,
    getInterviewReportService,
} from "../../service/interview/interview.service.js";

export const generateInterviewQuestions = TryCatch(async (req, res) => {
    const { role, experience, difficulty } = req.body;
    const interview = await createInterviewService({ userId: req.user._id, role, experience, difficulty });
    res.status(201).json(new ApiResponse(201, "Interview questions generated successfully", interview));
});

export const listInterviews = TryCatch(async (req, res) => {
    const data = await listInterviewsService(req.user._id);
    res.status(200).json(new ApiResponse(200, "Interviews fetched successfully", data));
});

export const getInterview = TryCatch(async (req, res) => {
    const data = await getInterviewService({ userId: req.user._id, interviewId: req.params.interviewId });
    res.status(200).json(new ApiResponse(200, "Interview fetched successfully", data));
});

export const startInterviewSession = TryCatch(async (req, res) => {
    const data = await startInterviewSessionService({ userId: req.user._id, interviewId: req.body.interviewId });
    const status = data.resumed ? 200 : 201;
    res.status(status).json(new ApiResponse(status, data.resumed ? "Interview session resumed" : "Interview session started successfully", data));
});

export const submitAnswer = TryCatch(async (req, res) => {
    const { sessionId, answerText } = req.body;
    const data = await submitAnswerService({ userId: req.user._id, sessionId, answerText });
    res.status(200).json(new ApiResponse(200, data.completed ? "Interview completed" : "Answer submitted successfully", data));
});

export const getInterviewSession = TryCatch(async (req, res) => {
    const data = await getInterviewSessionService({ userId: req.user._id, sessionId: req.params.sessionId });
    res.status(200).json(new ApiResponse(200, "Interview session fetched successfully", data));
});

export const getInterviewReport = TryCatch(async (req, res) => {
    const report = await getInterviewReportService({ userId: req.user._id, sessionId: req.params.sessionId });
    res.status(200).json(new ApiResponse(200, "Interview report fetched successfully", report));
});
