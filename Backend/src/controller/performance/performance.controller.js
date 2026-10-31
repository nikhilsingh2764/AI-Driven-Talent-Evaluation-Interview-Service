import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
    generatePerformanceReportService, downloadPerformanceReportService,
    getDashboardService, InterviewHistoryService, getPerformanceReportService,
} from "../../service/performance/performance.service.js";

export const generatePerformanceReport = TryCatch(async (req, res) => {
    const report = await generatePerformanceReportService({ userId: req.user._id });
    res.status(200).json(new ApiResponse(200, "Performance report generated successfully", report));
});

export const downloadPerformanceReport = TryCatch(async (req, res) => {
    const pdf = await downloadPerformanceReportService({ userId: req.user._id, username: req.user.username });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=performance-report.pdf");
    res.send(pdf);
});

export const getPerformanceReport = TryCatch(async (req, res) => {
    const report = await getPerformanceReportService({ userId: req.user._id });
    res.status(200).json(new ApiResponse(200, "Performance report fetched successfully", report));
});

export const getDashboard = TryCatch(async (req, res) => {
    const data = await getDashboardService({ userId: req.user._id });
    res.status(200).json(new ApiResponse(200, "Dashboard data fetched successfully", data));
});

export const getInterviewHistory = TryCatch(async (req, res) => {
    const { page, limit, search, difficulty, category, sort } = req.query; // validated + converted by historyQueryValidator
    const history = await InterviewHistoryService({ userId: req.user._id, page, limit, search, difficulty, category, sort });
    res.status(200).json(new ApiResponse(200, "Interview history fetched successfully", history));
});
