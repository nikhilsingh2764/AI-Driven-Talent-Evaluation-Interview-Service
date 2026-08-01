import { askAI } from "./askAI.js";
import ApiError from "../ApiError.js";

export const generateQuestionsAI = async ({ resumeText, analysis, role, experience, difficulty }) => {

    const prompt = `
You are an expert technical interviewer.

Generate exactly 10 interview questions.

Candidate Details:

Role: ${role}
Experience: ${experience}
Difficulty: ${difficulty}

Resume:
${resumeText}

Resume Analysis:
${JSON.stringify(analysis)}

Rules:

1. Return ONLY valid JSON.
2. No explanation.
3. No markdown.
4. Questions must be based on the resume.
5. Categories allowed:
   - Technical
   - Behavioral
   - System Design
   - HR

Format:

[
  {
    "question":"Explain JWT Authentication.",
    "category":"Technical"
  }
]
`;

    const response = await askAI(prompt);

    console.log("AI Response:");
    console.log(response);


    try {

        return JSON.parse(response);

    } catch (error) {

        throw new ApiError(
            500,
            "Invalid AI response while generating interview questions."
        );

    }

};