import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import { analyzeResumeService, getAnalysisService } from "../../service/resume/analysis.service.js";

export const analyzeResume = TryCatch(async (req, res) => {
    const analysis = await analyzeResumeService(req.user._id);
    res.status(200).json(new ApiResponse(200, "Resume analyzed successfully", analysis));
});

export const getAnalysis = TryCatch(async (req, res) => {
    const analysis = await getAnalysisService(req.user._id);
    res.status(200).json(new ApiResponse(200, "Resume analysis fetched successfully", analysis));
});
