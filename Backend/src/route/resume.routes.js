import express from 'express';

import { uploadResumeLimiter, ReplaceResumeLimiter, DeleteResumeLimiter } from '../middleware/rateLimiter.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';
import { uploadResumeValidator } from '../validators/resume.validator.js';
import validate from '../middleware/validate.js';
import { uploadResume, fetchResume, replaceResume, deleteResume } from '../controller/resume.controller.js';


const router = express.Router();


router.post(
    "/upload",
    uploadResumeLimiter,
    authMiddleware,
    upload.single('resume'),
    (req, res, next) => {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        next();
    },
    uploadResumeValidator,
    validate,
    uploadResume
);

router.get(
    "/resume",
    authMiddleware,
    fetchResume
);



router.patch(
    "/resume",
    ReplaceResumeLimiter,
    authMiddleware,
    upload.single("resume"),
    uploadResumeValidator,
    validate,
    replaceResume
);


router.delete(
    "/resume",
    DeleteResumeLimiter,
    authMiddleware,
    deleteResume
);

export default router;