import { askAI } from "./askAI.js";
import ApiError from "../ApiError.js";


export const generateInterviewReportAI = async ({ interviewData }) => {

const prompt=`
You are a Senior Technical Interviewer with over 15 years of experience interviewing software engineers.

You will receive an interview consisting of multiple question-answer pairs.

Interview Data:

${JSON.stringify(interviewData)}

Your task is to evaluate the candidate's COMPLETE interview performance.

Evaluate the candidate based on:

1. Technical Knowledge
2. Communication Skills
3. Problem Solving Ability
4. Confidence
5. Overall Interview Performance

Instructions:

- Evaluate the interview as a whole.
- Do not score each answer separately.
- Give honest and realistic scores.
- Do not inflate scores.
- Consider correctness, depth of knowledge, clarity, confidence, and communication.
- Strengths and weaknesses should summarize the complete interview.
- Recommendations should be practical and actionable.

Return ONLY valid JSON.

Return this exact format:

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "problemSolvingScore": 0,
  "confidenceScore": 0,
  "strengths": [],
  "weaknesses": [],
  "feedback": "",
  "recommendations": [],
  "interviewReadiness": 0,
  "status": "GENERATED"
}

Rules:

- overallScore must be an integer between 0 and 100.
- technicalScore must be an integer between 0 and 100.
- communicationScore must be an integer between 0 and 100.
- problemSolvingScore must be an integer between 0 and 100.
- confidenceScore must be an integer between 0 and 100.
- interviewReadiness must be an integer between 0 and 100.
- strengths must contain 3 to 6 concise points.
- weaknesses must contain 3 to 6 concise points.
- recommendations must contain 5 to 10 actionable points.
- feedback should be around 150–250 words.
- status must always be "GENERATED".
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT wrap the JSON in code fences.
- Do NOT include explanations or extra text.
`;

    const response = await askAI(prompt)

    try {

        return JSON.parse(response);

    } catch (error) {

        throw new ApiError(
            500,
            "Invalid AI response while generating report."
        );

    }

}