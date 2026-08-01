import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import { analyzeResumeService } from "../../service/resume/analysis.service.js";



export const analyzeResume = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const analysis  = await analyzeResumeService(userId);

    res.status(200).json(
        new ApiResponse(200, "Resume analyzed successfully", analysis )
    );

});