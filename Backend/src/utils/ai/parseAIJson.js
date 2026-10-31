// LLMs often wrap JSON in ```json fences or add a sentence before/after it. This pulls the JSON out safely.
export const parseAIJson = (text) => {
    if (typeof text !== "string" || !text.trim()) throw new Error("Empty AI response");
    let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
        return JSON.parse(t);
    } catch {
        const firstObj = t.indexOf("{");
        const firstArr = t.indexOf("[");
        const start = firstArr !== -1 && (firstObj === -1 || firstArr < firstObj) ? firstArr : firstObj;
        const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
        if (start === -1 || end <= start) throw new Error("No JSON found in AI response");
        return JSON.parse(t.slice(start, end + 1));
    }
};

// ---- normalizers: never trust the model's shape or numbers ----
export const clampInt = (value, min = 0, max = 100, fallback = 0) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export const stringList = (value, max = 12) =>
    (Array.isArray(value) ? value : typeof value === "string" ? [value] : [])
        .map((v) => String(v ?? "").trim())
        .filter(Boolean)
        .slice(0, max);

export const text = (value, max = 4000) => String(value ?? "").trim().slice(0, max);

export const CATEGORIES = ["Technical", "Behavioral", "System Design", "HR"];

export const normalizeAnalysis = (raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Analysis is not an object");
    const summary = text(raw.summary, 2000);
    if (!summary) throw new Error("Analysis has no summary");
    return {
        summary,
        technicalSkills: stringList(raw.technicalSkills, 40),
        softSkills: stringList(raw.softSkills, 20),
        strengths: stringList(raw.strengths),
        weaknesses: stringList(raw.weaknesses),
        missingSkills: stringList(raw.missingSkills),
        recommendedRoles: stringList(raw.recommendedRoles, 8),
        improvementSuggestions: stringList(raw.improvementSuggestions),
        atsScore: clampInt(raw.atsScore),
    };
};

export const normalizeQuestions = (raw) => {
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : null;
    if (!list) throw new Error("Questions are not a list");
    const questions = list
        .map((q) => ({
            question: text(typeof q === "string" ? q : q?.question, 600),
            category: CATEGORIES.find((c) => c.toLowerCase() === String(q?.category ?? "").toLowerCase()) || "Technical",
        }))
        .filter((q) => q.question)
        .slice(0, 10);
    if (questions.length < 5) throw new Error("Too few questions returned");
    return questions;
};

export const normalizeInterviewReport = (raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Report is not an object");
    const technicalScore = clampInt(raw.technicalScore);
    const communicationScore = clampInt(raw.communicationScore);
    const problemSolvingScore = clampInt(raw.problemSolvingScore);
    const confidenceScore = clampInt(raw.confidenceScore);
    const average = Math.round((technicalScore + communicationScore + problemSolvingScore + confidenceScore) / 4);
    return {
        overallScore: clampInt(raw.overallScore, 0, 100, average),
        technicalScore,
        communicationScore,
        problemSolvingScore,
        confidenceScore,
        strengths: stringList(raw.strengths, 8),
        weaknesses: stringList(raw.weaknesses, 8),
        feedback: text(raw.feedback, 4000),
        recommendations: stringList(raw.recommendations, 12),
        interviewReadiness: clampInt(raw.interviewReadiness, 0, 100, average),
    };
};

export const normalizePerformance = (raw, totalInterviews) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Performance report is not an object");
    return {
        overallProgress: clampInt(raw.overallProgress),
        technicalProgress: clampInt(raw.technicalProgress),
        communicationProgress: clampInt(raw.communicationProgress),
        problemSolvingProgress: clampInt(raw.problemSolvingProgress),
        confidenceProgress: clampInt(raw.confidenceProgress),
        strongestSkill: text(raw.strongestSkill, 200),
        weakestSkill: text(raw.weakestSkill, 200),
        improvementAreas: stringList(raw.improvementAreas),
        studyPlan: stringList(raw.studyPlan, 15),
        summary: text(raw.summary, 3000),
        interviewReadiness: clampInt(raw.interviewReadiness),
        totalInterviews, // always the real count, never the model's guess
    };
};
