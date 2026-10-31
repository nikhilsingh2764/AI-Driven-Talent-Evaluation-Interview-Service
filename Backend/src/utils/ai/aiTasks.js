import { askAIJson } from "./askAI.js";
import {
    normalizeAnalysis, normalizeQuestions, normalizeInterviewReport, normalizePerformance,
} from "./parseAIJson.js";
import { resumeAnalysisPrompt, questionsPrompt, interviewReportPrompt, performancePrompt } from "./prompts.js";

export const analyzeResumeAI = (resumeText) =>
    askAIJson({
        task: "analysis",
        prompt: resumeAnalysisPrompt(resumeText),
        mockInput: { resumeText },
        normalize: normalizeAnalysis,
    });

export const generateQuestionsAI = ({ resumeText, analysis, role, experience, difficulty }) =>
    askAIJson({
        task: "questions",
        prompt: questionsPrompt({ resumeText, analysis, role, experience, difficulty }),
        mockInput: { role, difficulty, skills: analysis.technicalSkills || [] },
        normalize: normalizeQuestions,
    });

export const generateInterviewReportAI = ({ interviewData }) =>
    askAIJson({
        task: "interviewReport",
        prompt: interviewReportPrompt(interviewData),
        mockInput: { interviewData },
        normalize: normalizeInterviewReport,
    });

export const generatePerformanceReportAI = ({ performanceData }) =>
    askAIJson({
        task: "performance",
        prompt: performancePrompt(performanceData),
        mockInput: { performanceData },
        normalize: (raw) => normalizePerformance(raw, performanceData.length),
    });
