import { askAI } from "../../utils/ai/askAI.js"
import ApiError from "../../utils/ApiError.js";

import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";


import { generateResumeAnalysisPrompt } from "../../utils/ai/resumePrompt.js";

import redis from "../../config/redis.js"



export const analyzeResumeService = async (userId) => {

  const resume = await resumeRepository.findByUserId(userId);

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  const extractedText = resume.extractedText;
  const resumeId = resume._id;

  const prompt = await generateResumeAnalysisPrompt(extractedText);

  const aiResponse = await askAI(prompt);

  const analysisData = JSON.parse(aiResponse) //convert JSON TO obj


  //check exist or not
  const existingAnalysis = await resumeAnalysisRepository.findByUserId(userId);

  let analysis;

  const analysisPayload = {
    resumeId,
    summary: analysisData.summary,
    technicalSkills: analysisData.technicalSkills,
    softSkills: analysisData.softSkills,
    strengths: analysisData.strengths,
    weaknesses: analysisData.weaknesses,
    missingSkills: analysisData.missingSkills,
    recommendedRoles: analysisData.recommendedRoles,
    improvementSuggestions: analysisData.improvementSuggestions,
    atsScore: analysisData.atsScore,
  };

  if (existingAnalysis) {

    analysis = await resumeAnalysisRepository.updateByUserId(
      userId,
      analysisPayload
    );

  } else {

    analysis = await resumeAnalysisRepository.create({
      userId,
      ...analysisPayload
    });

  }


  try {

    await redis.del(`Dashboard:${userId}`);

  } catch (error) {

    console.error("Redis Delete Error:", error);

  }


  return analysis;

};

