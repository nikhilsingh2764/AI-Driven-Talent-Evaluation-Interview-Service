import ApiError from "../../utils/ApiError.js";
import redis from "../../config/redis.js"


import interviewRepository from "../../repository/interview/interview.repository.js"
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import sessionRepository from "../../repository/interview/interviewSession.repository.js"

import answerRepository from "../../repository/interview/answer.repository.js";
import reportRepository from "../../repository/interview/interviewReport.repository.js"

import { generateQuestionsAI } from "../../utils/ai/generateQuestionsAI.js"
import { generateInterviewReportAI } from "../../utils/ai/generateInterviewReportAI.js";


export const createInterviewService = async ({ userId, role, experience, difficulty }) => {

    const resume = await resumeRepository.findByUserId(userId);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }


    const resumeId = resume._id;
    const resumeText = resume.extractedText;

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    const analysis = await resumeAnalysisRepository.findByResumeId(resumeId);


    if (!analysis) {
        throw new ApiError(404, "Resume analysis not completed");
    }

    const questions = await generateQuestionsAI({
        resumeText,
        analysis,
        role,
        experience,
        difficulty
    });


    const interview = await interviewRepository.create({
        userId,
        resumeId,
        analysisId: analysis._id,
        role,
        experience,
        difficulty,
        questions
    })

    return interview;

}

export const startInterviewSessionService = async ({ userId, interviewId }) => {

    const interview = await interviewRepository.findByIdAndUserId(interviewId, userId);

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    const activeSession = await sessionRepository.findActiveSession(interviewId);

    if (activeSession) {
        throw new ApiError(409, "An active interview session already exists");
    }


    const session = await sessionRepository.create({
        userId,
        interviewId,
        currentQuestionIndex: 0,
    })

    return session;


}

export const submitAnswerService = async ({ userId, sessionId, answer }) => {

    // Find session
    const session = await sessionRepository.findSessionByIdAndOwner(
        sessionId,
        userId
    );

    if (!session) {
        throw new ApiError(404, "Interview session not found");
    }

    // Find interview
    const interview = await interviewRepository.findById(session.interviewId);

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    // Already completed
    if (session.status === "COMPLETED") {

        let report = await reportRepository.findBySessionId(sessionId);

        if (!report || report.length === 0) {

            report = await generateInterviewReportService({
                userId,
                sessionId
            });

        } else {

            report = report[0];

        }

        return {
            completed: true,
            report
        };
    }

    const currentQuestionIndex = session.currentQuestionIndex;

    if (currentQuestionIndex >= interview.questions.length) {
        throw new ApiError(400, "Interview already completed");
    }

    const question = interview.questions[currentQuestionIndex];

    // Save answer
    const savedAnswer = await answerRepository.create({
        userId,
        sessionId,
        interviewId: interview._id,
        questionIndex: currentQuestionIndex,
        question: question.question,
        category: question.category,
        answerText: answer
    });

    const nextQuestionIndex = currentQuestionIndex + 1;

    session.currentQuestionIndex = nextQuestionIndex;

    // Last question
    if (nextQuestionIndex >= interview.questions.length) {

        session.status = "COMPLETED";
        interview.status = "COMPLETED";

        await sessionRepository.save(session);
        await interviewRepository.save(interview);

        const report = await generateInterviewReportService({
            userId,
            sessionId
        });

        try {

            await redis.del(`Dashboard:${userId}`);

            const keys = await redis.keys(`History:${userId}:*`);

            if (keys.length) {
                await redis.del(keys);
            }

        } catch (err) {
            console.log(err);
        }

        return {
            completed: true,
            answer: savedAnswer,
            report
        };
    }

    await sessionRepository.save(session);

    return {
        completed: false,
        answer: savedAnswer,
        nextQuestion: interview.questions[nextQuestionIndex]
    };
};



export const generateInterviewReportService = async ({ userId, sessionId }) => {

    const answers = await answerRepository.findBySessionId(sessionId);

    if (!answers.length) {
        throw new ApiError(404, "No interview answers found");
    }

    const interviewData = answers.map(answer => ({
        question: answer.question,
        answer: answer.answerText,
        category: answer.category
    }));

    const report = await generateInterviewReportAI({
        interviewData
    });

    console.log("AI REPORT:", report);

    if (!report) {
        throw new ApiError(500, "AI failed to generate report");
    }

    const storedReport = await reportRepository.create({

        userId,
        sessionId,
        interviewId: answers[0].interviewId,

        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        problemSolvingScore: report.problemSolvingScore,
        confidenceScore: report.confidenceScore,

        strengths: report.strengths || [],
        weaknesses: report.weaknesses || [],
        feedback: report.feedback || "",

        recommendations: report.recommendations || [],

        interviewReadiness: report.interviewReadiness,

        status: "GENERATED"

    });

    console.log("REPORT SAVED:", storedReport);

    return storedReport;
};



export const getInterviewSessionService = async ({ userId, sessionId }) => {

    const session = await sessionRepository.findSessionByIdAndOwner(
        sessionId,
        userId
    );

    if (!session) {
        throw new ApiError(404, "Interview session not found");
    }

    const interview = await interviewRepository.findById(
        session.interviewId
    );

    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }

    const currentQuestion =
        interview.questions[session.currentQuestionIndex] || null;

    return {
        session,
        currentQuestion
    };

};