// Deterministic stand-in for the LLM. Used when AI_MOCK=true, or when OPENROUTER_API_KEY is not set outside production.
// It lets you exercise every endpoint end to end without an API key. Results are simple heuristics, not real AI.
const SKILLS = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "PostgreSQL", "Python", "Java",
    "Docker", "Kubernetes", "AWS", "Git", "REST", "GraphQL", "Redis", "HTML", "CSS", "Next.js", "Django", "Spring",
];

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

export const mockAI = {
    analysis({ resumeText }) {
        const lower = resumeText.toLowerCase();
        const found = SKILLS.filter((s) => lower.includes(s.toLowerCase()));
        const missing = SKILLS.filter((s) => !found.includes(s)).slice(0, 4);
        const words = resumeText.split(/\s+/).filter(Boolean).length;
        return {
            summary: `[MOCK] Resume with about ${words} words and ${found.length} recognised technical skills.`,
            technicalSkills: found.length ? found : ["General software development"],
            softSkills: ["Communication", "Teamwork"],
            strengths: found.slice(0, 3).map((s) => `Hands-on ${s} experience`),
            weaknesses: ["Few quantified achievements", "Could add more project detail"],
            missingSkills: missing,
            atsScore: Math.min(95, 40 + found.length * 5 + Math.min(20, Math.floor(words / 50))),
            recommendedRoles: found.includes("React") ? ["Frontend Developer", "Full Stack Developer"] : ["Software Engineer", "Backend Developer"],
            improvementSuggestions: ["Quantify results with numbers", "Add links to projects", "Keep to one or two pages"],
        };
    },

    questions({ role, difficulty, skills }) {
        const s = skills.length ? skills : ["your main language"];
        const pick = (i) => s[i % s.length];
        return [
            { question: `[MOCK] Walk me through a project where you used ${pick(0)}.`, category: "Technical" },
            { question: `[MOCK] What are common pitfalls when working with ${pick(1)}, and how do you avoid them?`, category: "Technical" },
            { question: `[MOCK] How would you debug a slow ${pick(2)} application in production?`, category: "Technical" },
            { question: `[MOCK] Explain how you would test code written with ${pick(0)}.`, category: "Technical" },
            { question: `[MOCK] Design a URL shortener suitable for a ${role}. (${difficulty})`, category: "System Design" },
            { question: "[MOCK] How would you scale a service from 1k to 1M users?", category: "System Design" },
            { question: "[MOCK] Tell me about a time you disagreed with a teammate.", category: "Behavioral" },
            { question: "[MOCK] Describe a deadline you almost missed and what you did.", category: "Behavioral" },
            { question: `[MOCK] Why do you want to work as a ${role}?`, category: "HR" },
            { question: "[MOCK] Where do you see yourself in three years?", category: "HR" },
        ];
    },

    interviewReport({ interviewData }) {
        const lengths = interviewData.map((d) => String(d.answer || "").split(/\s+/).filter(Boolean).length);
        const avgWords = avg(lengths);
        const depth = Math.min(95, 35 + avgWords * 2);
        return {
            overallScore: depth,
            technicalScore: Math.max(20, depth - 3),
            communicationScore: Math.min(95, depth + 4),
            problemSolvingScore: Math.max(20, depth - 6),
            confidenceScore: Math.min(95, depth + 2),
            strengths: ["Answered every question", "Clear structure in longer answers", "Relevant experience mentioned"],
            weaknesses: ["Some answers were short", "Few concrete examples", "Limited discussion of trade-offs"],
            feedback: `[MOCK] You answered ${interviewData.length} questions with about ${avgWords} words on average. Longer, example-driven answers score higher.`,
            recommendations: ["Use the STAR method", "Add concrete numbers", "Explain trade-offs", "Practise system design", "Time your answers"],
            interviewReadiness: Math.max(10, depth - 5),
        };
    },

    performance({ performanceData }) {
        const col = (k) => avg(performanceData.map((r) => Number(r[k]) || 0));
        const skills = {
            Technical: col("technicalScore"),
            Communication: col("communicationScore"),
            "Problem Solving": col("problemSolvingScore"),
            Confidence: col("confidenceScore"),
        };
        const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);
        return {
            overallProgress: col("overallScore"),
            technicalProgress: skills.Technical,
            communicationProgress: skills.Communication,
            problemSolvingProgress: skills["Problem Solving"],
            confidenceProgress: skills.Confidence,
            strongestSkill: sorted[0][0],
            weakestSkill: sorted[sorted.length - 1][0],
            improvementAreas: [sorted[sorted.length - 1][0], "Concrete examples"],
            studyPlan: ["Do one mock interview per week", `Focus on ${sorted[sorted.length - 1][0]} for the next two weeks`, "Review feedback after every session"],
            summary: `[MOCK] Across ${performanceData.length} interview(s) your strongest area is ${sorted[0][0]} and the weakest is ${sorted[sorted.length - 1][0]}.`,
            interviewReadiness: col("interviewReadiness"),
        };
    },
};
