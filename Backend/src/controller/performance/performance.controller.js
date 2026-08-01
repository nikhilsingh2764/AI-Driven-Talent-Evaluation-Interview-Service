import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
    generatePerformanceReportService, downloadPerformanceReportService,
    getDashboardService, InterviewHistoryService, getPerformanceReportService
} from "../../service/performance/ performance.service.js"




// Generate Performance Report
export const generatePerformanceReport = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const performanceReport = await generatePerformanceReportService({ userId });

    res.status(201).json(
        new ApiResponse(201, "Performance Report generate Successfully", performanceReport)
    )

});



// Download Performance Report PDF
export const downloadPerformanceReport = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const pdfBuffer = await downloadPerformanceReportService({ userId });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=performance-report.pdf"
    );

    res.send(pdfBuffer);

});



export const getPerformanceReport = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const performanceReport = await getPerformanceReportService({ userId });

    res.status(200).json(
        new ApiResponse(
            200,
            "Performance report fetched successfully",
            performanceReport
        )
    );

});



// Get Dashboard
export const getDashboard = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const dashboardData = await getDashboardService({ userId })

    res.status(200).json(
        new ApiResponse(200, "Dashboard data fetch successfully", dashboardData)
    )


});




//show history
export const getInterviewHistory = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        page = 1,
        limit = 10,
        search = "",
        difficulty,
        category,
        sort = "latest"
    } = req.query;


    const history = await InterviewHistoryService({
        userId,
        page: Number(page),
        limit: Number(limit),
        search,
        difficulty,
        category,
        sort
    });

    res.status(200).json(
        new ApiResponse(
            200,
            "Interview history fetched successfully",
            history
        )
    );
});