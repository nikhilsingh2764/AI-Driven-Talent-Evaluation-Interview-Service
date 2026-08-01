import reportRepository from "../../repository/interview/interviewReport.repository.js"
import performanceRepository from "../../repository/performance/performance.repository.js"
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import interviewRepository from "../../repository/interview/interview.repository.js";


import { generatePerformanceReportPDF } from "../../utils/pdf/generatePerformanceReportPDF.js";
import { generatePerformanceReportAI } from "../../utils/ai/generatePerformanceReportAI.js"

import redis from "../../config/redis.js"
import ApiError from "../../utils/ApiError.js";


export const generatePerformanceReportService = async ({ userId }) => {

    // Check if performance report already exists
    let performanceReport =
        await performanceRepository.findByUserId(userId);

    if (performanceReport) {
        return performanceReport;
    }

    // Fetch all interview reports
    const reports = await reportRepository.findByUserId(userId);

    if (!reports.length) {
        throw new ApiError(404, "No interview reports found");
    }

    // Prepare AI input
    const performanceData = reports.map(report => ({
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        problemSolvingScore: report.problemSolvingScore,
        confidenceScore: report.confidenceScore,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        feedback: report.feedback,
        recommendations: report.recommendations,
        interviewReadiness: report.interviewReadiness
    }));

    // Generate performance report using AI
    const performanceReportData =
        await generatePerformanceReportAI({ performanceData });

    if (!performanceReportData) {
        throw new ApiError(500, "Failed to generate performance report");
    }

    // Save report
    performanceReport =
        await performanceRepository.create({
            userId,
            ...performanceReportData
        });

    // Clear cache
    try {

        await redis.del(`Performance:${userId}`);
        await redis.del(`Dashboard:${userId}`);

    } catch (error) {

        console.error("Redis Delete Error:", error);

    }

    return performanceReport;

};

export const downloadPerformanceReportService = async ({ userId }) => {

    const performanceReport =
        await performanceRepository.findByUserId(userId);

    if (!performanceReport) {
        throw new ApiError(404, "Performance report not found");
    }

    const pdfBuffer =
        await generatePerformanceReportPDF(performanceReport);

    return pdfBuffer;
};

export const getPerformanceReportService = async ({ userId }) => {

    const cacheKey = `Performance:${userId}`;

    try {

        const cache = await redis.get(cacheKey);

        if (cache) {
            return JSON.parse(cache);
        }

    } catch (error) {

        console.error("Redis Get Error:", error);

    }

    const performanceReport =
        await performanceRepository.findByUserId(userId);

    if (!performanceReport) {
        throw new ApiError(404, "Performance report not found");
    }

    try {

        await redis.set(
            cacheKey,
            JSON.stringify(performanceReport),
            "EX",
            300
        );

    } catch (error) {

        console.error("Redis Set Error:", error);

    }

    return performanceReport;
};







export const getDashboardService = async ({ userId }) => {

    const cacheKey = `Dashboard:${userId}`

    const cacheDashboard = await redis.get(cacheKey) //if store in redis return 

    if (cacheDashboard) {
        return JSON.parse(cacheDashboard)
    }



    // Get Performance Report
    const performanceReport = await performanceRepository.findByUserId(userId);

    // Get Resume Analysis
    const resumeAnalysis = await resumeAnalysisRepository.findByUserId(userId);

    // Get All Interview Reports
    const interviewReports = await reportRepository.findByUserId(userId);

    // Dashboard Stats
    const totalInterviews = interviewReports.length;

    const averageScore =
        totalInterviews === 0
            ? 0
            : Math.round(
                interviewReports.reduce(
                    (sum, report) => sum + report.overallScore,
                    0
                ) / totalInterviews
            );

    // Progress Chart
    const progressChart = performanceReport
        ? {
            overallProgress: performanceReport.overallProgress,
            technicalProgress: performanceReport.technicalProgress,
            communicationProgress: performanceReport.communicationProgress,
            problemSolvingProgress: performanceReport.problemSolvingProgress,
            confidenceProgress: performanceReport.confidenceProgress
        }
        : null;

    // Interview History
    const interviewHistory = interviewReports.map((report) => ({
        interviewId: report.interviewId,
        overallScore: report.overallScore,
        interviewReadiness: report.interviewReadiness,
        createdAt: report.createdAt
    }));


    const dashboardData = {

        dashboardStats: {
            totalInterviews,
            averageScore,
            overallProgress: performanceReport?.overallProgress ?? 0,
            interviewReadiness: performanceReport?.interviewReadiness ?? 0
        },

        progressChart,

        interviewHistory,

        quickActions: [
            {
                title: "Start Interview",
                route: "/interview"
            },
            {
                title: "Performance Report",
                route: "/performance-report"
            },
            {
                title: "Resume Analysis",
                route: "/resume-analysis"
            },
            {
                title: "Download Performance PDF",
                route: "/performance-report/pdf"
            }
        ],

        resumeAnalysis

    };


    try {
        await redis.set(
            cacheKey,
            JSON.stringify(dashboardData),
            "EX",
            300
        )
    } catch (error) {
        console.log("REDIS ERROR:", error);
        throw error;
    }

    return dashboardData;

};



export const InterviewHistoryService = async ({
    userId,
    page,
    limit,
    search,
    difficulty,
    category,
    sort
}) => {

    console.log("1. Service Started");

    const historyCacheKey =
        `History:${userId}:${page}:${limit}:${search}:${difficulty}:${category}:${sort}`;

    console.log("2. Cache Key:", historyCacheKey);

    const historyCache = await redis.get(historyCacheKey);

    console.log("3. Cache Checked");

    if (historyCache) {
        console.log("4. Returning Cache");
        return JSON.parse(historyCache);
    }

    console.log("5. Fetching From DB");

    const interviewHistory = await reportRepository.findInterviewHistory({
        userId,
        page,
        limit,
        search,
        difficulty,
        category,
        sort
    });

    console.log("6. DB Done");

    try {
        await redis.set(
            historyCacheKey,
            JSON.stringify(interviewHistory),
            "EX",
            300
        );
    } catch (error) {
        console.error(error);
    }

    console.log("7. Returning");

    return interviewHistory;
};
