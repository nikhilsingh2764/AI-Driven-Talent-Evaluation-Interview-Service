import ApiError from "../../utils/ApiError.js";
import { cache } from "../../config/cache.js";
import interviewRepository from "../../repository/interview/interview.repository.js";
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import sessionRepository from "../../repository/interview/interviewSession.repository.js";
import answerRepository from "../../repository/interview/answer.repository.js";
import reportRepository from "../../repository/interview/interviewReport.repository.js";
import { generateQuestionsAI, generateInterviewReportAI } from "../../utils/ai/aiTasks.js";

const total = (interview) => interview.questions.length;

export const createInterviewService = async ({ userId, role, experience, difficulty = "Medium" }) => {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) throw new ApiError(404, "Upload a resume first");

    const analysis = await resumeAnalysisRepository.findByUserId(userId);
    if (!analysis) throw new ApiError(404, "Analyse your resume first");
    if (String(analysis.resumeId) !== String(resume._id)) {
        throw new ApiError(409, "Your resume changed since the last analysis. Run the analysis again");
    }

    const questions = await generateQuestionsAI({
        resumeText: resume.extractedText,
        analysis: analysis.toObject(),
        role,
        experience,
        difficulty,
    });

    return interviewRepository.create({
        userId,
        resumeId: resume._id,
        analysisId: analysis._id,
        role: role.trim(),
        experience: experience.trim(),
        difficulty,
        questions,
    });
};

// All of the user's interviews, each with its latest session and report ids so a client can link to them.
export const listInterviewsService = async (userId) => {
    const interviews = await interviewRepository.findByUserId(userId);
    if (!interviews.length) return [];
    const ids = interviews.map((i) => i._id);
    const [sessions, reports] = await Promise.all([
        sessionRepository.findByInterviewIds(ids),
        reportRepository.findByInterviewIds(ids),
    ]);
    const latestSession = new Map(); // sessions are sorted oldest first, so the last write wins
    sessions.forEach((s) => latestSession.set(String(s.interviewId), s));
    const reportByInterview = new Map();
    reports.forEach((r) => reportByInterview.set(String(r.interviewId), r));

    return interviews.map((i) => {
        const s = latestSession.get(String(i._id));
        const r = reportByInterview.get(String(i._id));
        return {
            id: i._id,
            role: i.role,
            experience: i.experience,
            difficulty: i.difficulty,
            status: i.status,
            totalQuestions: total(i),
            createdAt: i.createdAt,
            sessionId: s?._id ?? null,
            sessionStatus: s?.status ?? null,
            answered: s?.currentQuestionIndex ?? 0,
            overallScore: r?.overallScore ?? null,
        };
    });
};

export const getInterviewService = async ({ userId, interviewId }) => {
    const interview = await interviewRepository.findByIdAndUserId(interviewId, userId);
    if (!interview) throw new ApiError(404, "Interview not found");
    const session = await sessionRepository.findLatestByInterviewId(interview._id);
    const report = session ? await reportRepository.findOneBySessionId(session._id) : null;
    return { interview, session, report };
};

export const startInterviewSessionService = async ({ userId, interviewId }) => {
    const interview = await interviewRepository.findByIdAndUserId(interviewId, userId);
    if (!interview) throw new ApiError(404, "Interview not found");
    if (interview.status === "COMPLETED") throw new ApiError(409, "This interview is already completed. Create a new one to practise again");

    // One active session per interview: a reload resumes it instead of failing
    const active = await sessionRepository.findActiveSession(interview._id);
    if (active) {
        return {
            session: active,
            currentQuestion: interview.questions[active.currentQuestionIndex] || null,
            totalQuestions: total(interview),
            resumed: true,
        };
    }

    let session;
    try {
        session = await sessionRepository.create({ userId, interviewId: interview._id, currentQuestionIndex: 0 });
    } catch (error) {
        if (error.code === 11000) {
            // Another request started it a moment ago: return that one
            const other = await sessionRepository.findActiveSession(interview._id);
            if (other) return { session: other, currentQuestion: interview.questions[other.currentQuestionIndex] || null, totalQuestions: total(interview), resumed: true };
        }
        throw error;
    }
    if (interview.status !== "STARTED") {
        interview.status = "STARTED";
        await interviewRepository.save(interview);
    }
    return { session, currentQuestion: interview.questions[0] || null, totalQuestions: total(interview), resumed: false };
};

export const getInterviewSessionService = async ({ userId, sessionId }) => {
    const session = await sessionRepository.findSessionByIdAndOwner(sessionId, userId);
    if (!session) throw new ApiError(404, "Interview session not found");
    const interview = await interviewRepository.findById(session.interviewId);
    if (!interview) throw new ApiError(404, "Interview not found");

    return {
        session,
        currentQuestion: session.status === "COMPLETED" ? null : interview.questions[session.currentQuestionIndex] || null,
        totalQuestions: total(interview),
        role: interview.role,
        difficulty: interview.difficulty,
    };
};

// Builds the report from the saved answers and stores it (once per session).
const buildReport = async ({ userId, sessionId }) => {
    const existing = await reportRepository.findOneBySessionId(sessionId);
    if (existing) return existing;

    const answers = await answerRepository.findBySessionId(sessionId);
    if (!answers.length) throw new ApiError(404, "No interview answers found");

    const report = await generateInterviewReportAI({
        interviewData: answers.map((a) => ({ question: a.question, category: a.category, answer: a.answerText })),
    });

    try {
        const stored = await reportRepository.create({
            userId,
            sessionId,
            interviewId: answers[0].interviewId,
            ...report,
            status: "GENERATED",
        });
        await cache.invalidateUser(userId);
        return stored;
    } catch (error) {
        // Two requests generated at the same moment: the unique index keeps one, return it
        if (error.code === 11000) return reportRepository.findOneBySessionId(sessionId);
        throw error;
    }
};

export const submitAnswerService = async ({ userId, sessionId, answerText }) => {
    const session = await sessionRepository.findSessionByIdAndOwner(sessionId, userId);
    if (!session) throw new ApiError(404, "Interview session not found");
    const interview = await interviewRepository.findById(session.interviewId);
    if (!interview) throw new ApiError(404, "Interview not found");

    if (session.status === "COMPLETED") {
        throw new ApiError(409, "This interview session is already completed. Fetch the report instead");
    }

    const index = session.currentQuestionIndex;
    const question = interview.questions[index];
    if (!question) throw new ApiError(400, "There is no question left to answer");

    // The unique (sessionId, questionIndex) index makes a double submit fail here instead of saving twice
    let savedAnswer;
    try {
        savedAnswer = await answerRepository.create({
            userId,
            sessionId: session._id,
            interviewId: interview._id,
            questionIndex: index,
            question: question.question,
            category: question.category,
            answerText: answerText.trim(),
        });
    } catch (error) {
        if (error.code === 11000) throw new ApiError(409, "This question was already answered");
        throw error;
    }

    const isLast = index + 1 >= total(interview);
    const advanced = await sessionRepository.advanceIfAt(session._id, userId, index, isLast ? "COMPLETED" : "STARTED");
    if (!advanced) throw new ApiError(409, "The session changed while saving. Reload and try again");

    if (!isLast) {
        return {
            completed: false,
            answer: savedAnswer,
            nextQuestion: interview.questions[index + 1],
            progress: { answered: index + 1, total: total(interview) },
        };
    }

    await interviewRepository.updateStatus(interview._id, "COMPLETED");

    // The answers are saved. If the AI fails now, the report can be requested again later, so do not lose the user's work.
    let report = null;
    let reportError = null;
    try {
        report = await buildReport({ userId, sessionId: session._id });
    } catch (error) {
        console.error("Interview report generation failed:", error.message);
        reportError = error.message;
    }
    await cache.invalidateUser(userId);

    return {
        completed: true,
        answer: savedAnswer,
        report,
        reportError,
        progress: { answered: total(interview), total: total(interview) },
    };
};

// Returns the report for a finished session, generating it now if an earlier attempt failed.
export const getInterviewReportService = async ({ userId, sessionId }) => {
    const session = await sessionRepository.findSessionByIdAndOwner(sessionId, userId);
    if (!session) throw new ApiError(404, "Interview session not found");
    if (session.status !== "COMPLETED") throw new ApiError(409, "Finish all questions to get the report");
    return buildReport({ userId, sessionId: session._id });
};
