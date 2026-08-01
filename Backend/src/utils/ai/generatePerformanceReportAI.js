import { askAI } from "./askAI.js";
import ApiError from "../ApiError.js";

export const generatePerformanceReportAI = async ({ performanceData }) => {

    const prompt = `
You are an expert interview coach.

Analyze the candidate's interview history and generate ONE overall performance report.

Interview Reports:
${JSON.stringify(performanceData)}

Rules:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT wrap inside \`\`\`json.
4. Do NOT explain anything.
5. All scores must be between 0 and 100.
6. totalInterviews must equal ${performanceData.length}.

Return exactly this format:

{
  "overallProgress": 82,
  "technicalProgress": 80,
  "communicationProgress": 75,
  "problemSolvingProgress": 85,
  "confidenceProgress": 78,
  "strongestSkill": "Backend Development",
  "weakestSkill": "Communication",
  "improvementAreas": [
    "System Design",
    "Communication"
  ],
  "studyPlan": [
    "Practice DSA daily",
    "Give 3 mock interviews every week"
  ],
  "summary": "Overall performance is improving. Technical skills are strong, but communication and interview confidence need more work.",
  "interviewReadiness": 80,
  "totalInterviews": ${performanceData.length}
}
`;

    const response = await askAI(prompt);

    console.log("========== AI RESPONSE ==========");
    console.log(response);
    console.log("================================");

    try {

        let json = response.trim();

        // Remove markdown if AI still returns it
        if (json.startsWith("```")) {
            json = json
                .replace(/^```json/i, "")
                .replace(/^```/i, "")
                .replace(/```$/, "")
                .trim();
        }

        return JSON.parse(json);

    } catch (error) {

        console.log("JSON Parse Error:", error);
        console.log("Raw AI Response:", response);

        throw new ApiError(
            500,
            "Invalid AI response while generating performance report."
        );

    }

};