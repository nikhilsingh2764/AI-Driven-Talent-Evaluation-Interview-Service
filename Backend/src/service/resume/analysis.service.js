import ApiError from "../../utils/ApiError.js";
import { cache } from "../../config/cache.js";
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import { analyzeResumeAI } from "../../utils/ai/aiTasks.js";

export const analyzeResumeService = async (userId) => {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) throw new ApiError(404, "Upload a resume first");
    if (!resume.extractedText) throw new ApiError(422, "This resume has no readable text");

    const analysisData = await analyzeResumeAI(resume.extractedText);

    const analysis = await resumeAnalysisRepository.upsertByUserId(userId, { resumeId: resume._id, ...analysisData });
    await cache.invalidateUser(userId);
    return analysis;
};

export const getAnalysisService = async (userId) => {
    const analysis = await resumeAnalysisRepository.findByUserId(userId);
    if (!analysis) throw new ApiError(404, "No analysis yet. Run the resume analysis first");
    return analysis;
};
