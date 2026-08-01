import express from 'express';

import { uploadResumeLimiter, ReplaceResumeLimiter, DeleteResumeLimiter } from '../../middleware/rateLimiter.middleware.js';
import authMiddleware from "../../middleware/auth.middleware.js"
import upload from '../../middleware/multer.middleware.js';
import validate from '../../middleware/validate.js';

import { uploadResumeValidator, replaceResumeValidator } from '../../validators/resume.validator.js';

import { uploadResume, fetchResume, replaceResume, deleteResume } from '../../controller/resume/resume.controller.js';


const router = express.Router();


router.post(
    "/resume/upload",
    uploadResumeLimiter,
    authMiddleware,
    upload.single('resume'),
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
    replaceResumeValidator,
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