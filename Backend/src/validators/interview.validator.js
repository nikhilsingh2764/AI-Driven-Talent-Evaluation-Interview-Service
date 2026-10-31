import { body, param, query } from "express-validator";

export const createInterviewValidator = [
    body("role").isString().trim().isLength({ min: 2, max: 100 }).withMessage("Role is required (2 to 100 characters)"),
    body("experience").isString().trim().isLength({ min: 1, max: 100 }).withMessage("Experience is required (for example: Fresher, 2 years)"),
    body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty must be Easy, Medium or Hard"),
];

export const startSessionValidator = [body("interviewId").isMongoId().withMessage("A valid interviewId is required")];

export const submitAnswerValidator = [
    body("sessionId").isMongoId().withMessage("A valid sessionId is required"),
    body("answerText").isString().trim().isLength({ min: 1, max: 5000 }).withMessage("Answer is required (max 5000 characters)"),
];

export const sessionIdParam = [param("sessionId").isMongoId().withMessage("Invalid sessionId")];
export const interviewIdParam = [param("interviewId").isMongoId().withMessage("Invalid interviewId")];

export const historyQueryValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be 1 or more").toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50").toInt(),
    query("sort").optional().isIn(["latest", "oldest", "highest-score", "lowest-score"]).withMessage("Invalid sort"),
    query("difficulty").optional({ values: "falsy" }).isIn(["Easy", "Medium", "Hard"]).withMessage("Invalid difficulty"),
    query("category").optional({ values: "falsy" }).isIn(["Technical", "Behavioral", "System Design", "HR"]).withMessage("Invalid category"),
];
