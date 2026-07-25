import { body } from "express-validator";

export const uploadResumeValidator = [

    // Check if multer uploaded a file
    body().custom((value, { req }) => {

        if (!req.file) {
            throw new Error("Resume PDF is required");
        }

        return true;


    })

];