import ApiError from "../../utils/ApiError.js";
import { cache, userKey } from "../../config/cache.js";
import reportRepository from "../../repository/interview/interviewReport.repository.js";
import performanceRepository from "../../repository/performance/performance.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import interviewRepository from "../../repository/interview/interview.repository.js";
import { generatePerformanceReportPDF } from "../../utils/pdf/generatePerformanceReportPDF.js";
import { generatePerformanceReportAI } from "../../utils/ai/aiTasks.js";
import { escapeRegex } from "../../utils/escapeHtml.js";

const TTL = 300;

export const generatePerformanceReportService = async ({ userId }) => {
    const reports = await reportRepository.findByUserId(userId); // oldest first
    if (!reports.length) throw new ApiError(404, "Complete at least one interview first");

    // Nothing new since the last report: reuse it instead of paying for another AI call
    const existing = await performanceRepository.findByUserId(userId);
    if (existing && existing.totalInterviews === reports.length) return existing;

    const data = await generatePerformanceReportAI({
        performanceData: reports.map((r) => ({
            overallScore: r.overallScore,
            technicalScore: r.technicalScore,
            communicationScore: r.communicationScore,
            problemSolvingScore: r.problemSolvingScore,
            confidenceScore: r.confidenceScore,
            strengths: r.strengths,
            weaknesses: r.weaknesses,
            interviewReadiness: r.interviewReadiness,
        })),
    });

    const saved = await performanceRepository.upsertByUserId(userId, { ...data, status: "GENERATED" });
    await cache.invalidateUser(userId);
    return saved;
};

export const getPerformanceReportService = async ({ userId }) => {
    const key = userKey(userId, "performance");
    const hit = await cache.get(key);
    if (hit) return hit;

    const report = await performanceRepository.findByUserId(userId);
    if (!report) throw new ApiError(404, "No performance report yet. Generate it first");
    await cache.set(key, report, TTL);
    return report;
};

export const downloadPerformanceReportService = async ({ userId, username }) => {
    const report = await performanceRepository.findByUserId(userId);
    if (!report) throw new ApiError(404, "No performance report yet. Generate it first");
    return generatePerformanceReportPDF(report, username);
};

export const getDashboardService = async ({ userId }) => {
    const key = userKey(userId, "dashboard");
    const hit = await cache.get(key);
    if (hit) return hit;

    const [performanceReport, resumeAnalysis, reports] = await Promise.all([
        performanceRepository.findByUserId(userId),
        resumeAnalysisRepository.findByUserId(userId),
        reportRepository.findByUserId(userId),
    ]);

    const interviews = await interviewRepository.findByUserId(userId);
    const roleById = new Map(interviews.map((i) => [String(i._id), i]));

    const totalInterviews = reports.length;
    const averageScore = totalInterviews ? Math.round(reports.reduce((s, r) => s + r.overallScore, 0) / totalInterviews) : 0;

    const dashboard = {
        dashboardStats: {
            totalInterviews,
            averageScore,
            overallProgress: performanceReport?.overallProgress ?? 0,
            interviewReadiness: performanceReport?.interviewReadiness ?? 0,
        },
        progressChart: performanceReport
            ? {
                  overallProgress: performanceReport.overallProgress,
                  technicalProgress: performanceReport.technicalProgress,
                  communicationProgress: performanceReport.communicationProgress,
                  problemSolvingProgress: performanceReport.problemSolvingProgress,
                  confidenceProgress: performanceReport.confidenceProgress,
              }
            : null,
        interviewHistory: reports.map((r) => {
            const i = roleById.get(String(r.interviewId));
            return {
                interviewId: r.interviewId,
                sessionId: r.sessionId,
                role: i?.role ?? null,
                difficulty: i?.difficulty ?? null,
                overallScore: r.overallScore,
                interviewReadiness: r.interviewReadiness,
                createdAt: r.createdAt,
            };
        }),
        quickActions: [
            { title: "Start Interview", route: "/interview" },
            { title: "Performance Report", route: "/performance-report" },
            { title: "Resume Analysis", route: "/resume-analysis" },
            { title: "Download Performance PDF", route: "/performance-report/pdf" },
        ],
        resumeAnalysis,
        performanceReportOutdated: Boolean(performanceReport && performanceReport.totalInterviews !== totalInterviews),
    };

    await cache.set(key, dashboard, TTL);
    return dashboard;
};

export const InterviewHistoryService = async ({ userId, page = 1, limit = 10, search, difficulty, category, sort = "latest" }) => {
    const key = userKey(userId, "history", page, limit, search || "", difficulty || "", category || "", sort);
    const hit = await cache.get(key);
    if (hit) return hit;

    // Role / difficulty / category live on the interview, so find the matching interviews first
    let interviewIds;
    const filter = {};
    if (search) filter.role = { $regex: escapeRegex(search), $options: "i" };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter["questions.category"] = category;
    if (Object.keys(filter).length) {
        const matching = await interviewRepository.findByUserId(userId, filter);
        interviewIds = matching.map((i) => i._id);
    }

    const { items, total } = interviewIds && !interviewIds.length
        ? { items: [], total: 0 }
        : await reportRepository.findInterviewHistory({ userId, page, limit, sort, interviewIds });

    const result = {
        items: items.map((r) => ({
            reportId: r._id,
            interviewId: r.interviewId?._id ?? r.interviewId,
            sessionId: r.sessionId,
            role: r.interviewId?.role ?? null,
            experience: r.interviewId?.experience ?? null,
            difficulty: r.interviewId?.difficulty ?? null,
            overallScore: r.overallScore,
            interviewReadiness: r.interviewReadiness,
            createdAt: r.createdAt,
        })),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };

    await cache.set(key, result, TTL);
    return result;
};
