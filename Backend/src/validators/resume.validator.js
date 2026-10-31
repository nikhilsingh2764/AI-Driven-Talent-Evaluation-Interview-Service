import { body } from "express-validator";

const needFile = (message) => body().custom((value, { req }) => {
    if (!req.file) throw new Error(message);
    return true;
});

export const uploadResumeValidator = [needFile("Resume PDF is required (form field name: resume)")];
export const replaceResumeValidator = [needFile("New resume PDF is required (form field name: resume)")];
