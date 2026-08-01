export const generateResumeAnalysisPrompt = (extractedText) => {

    return `
You are an expert resume analyzer.

Analyze the following resume and return ONLY valid JSON.
Do not add markdown or explanations.

Resume:
${extractedText}

Return this exact JSON structure:

{
  "summary": "short professional summary",

  "technicalSkills": [
    "skill1",
    "skill2"
  ],

  "softSkills": [
    "skill1",
    "skill2"
  ],

  "strengths": [
    "strength1",
    "strength2"
  ],

  "weaknesses": [
    "weakness1",
    "weakness2"
  ],

  "missingSkills": [
    "skill1",
    "skill2"
  ],

  "atsScore": 0,

  "recommendedRoles": [
    "role1",
    "role2"
  ],

  "improvementSuggestions": [
    "suggestion1",
    "suggestion2"
  ]
}

Rules:
- atsScore must be between 0 and 100.
- technicalSkills should contain only technical skills.
- Keep suggestions practical.
- Return JSON only.
`;
};