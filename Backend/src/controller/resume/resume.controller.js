import fs from "node:fs";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import TryCatch from "../../middleware/TryCatch.js";
import {
    uploadResumeService, getResumeService, getResumeFileInfoService,
    replaceResumeSerivce, deleteResumeService,
} from "../../service/resume/resume.service.js";
import { localResumePath } from "../../utils/upload/storage.js";

export const uploadResume = TryCatch(async (req, res) => {
    const data = await uploadResumeService(req.user._id, req.file);
    res.status(201).json(new ApiResponse(201, "Resume uploaded successfully", data));
});

export const fetchResume = TryCatch(async (req, res) => {
    const resume = await getResumeService(req.user._id);
    res.status(200).json(new ApiResponse(200, "Resume fetched successfully", resume));
});

export const replaceResume = TryCatch(async (req, res) => {
    const data = await replaceResumeSerivce(req.user._id, req.file);
    res.status(200).json(new ApiResponse(200, "Resume replaced successfully. Run the analysis again", data));
});

export const deleteResume = TryCatch(async (req, res) => {
    await deleteResumeService(req.user._id);
    res.status(200).json(new ApiResponse(200, "Resume deleted successfully", null));
});

// Downloads the user's own resume. Cloudinary files redirect to their URL, local files are streamed (only the owner can reach them).
export const downloadResumeFile = TryCatch(async (req, res) => {
    const resume = await getResumeFileInfoService(req.user._id);
    if (resume.storage === "cloudinary") return res.redirect(resume.resumeUrl);

    const filePath = localResumePath(resume.publicId);
    if (!fs.existsSync(filePath)) throw new ApiError(404, "Resume file is missing on the server");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(resume.fileName)}"`);
    fs.createReadStream(filePath).pipe(res);
});
