import ApiError from "../../utils/ApiError.js";
import { cache } from "../../config/cache.js";
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";
import { saveResumeFile, deleteResumeFile } from "../../utils/upload/storage.js";
import { extractTextFromPDF } from "../../utils/pdf/extractText.js";

// Never send the (long) extracted text back in list/detail responses unless asked for.
const view = (resume) => {
    const o = resume.toObject ? resume.toObject() : resume;
    const { extractedText, ...rest } = o;
    return { ...rest, textLength: extractedText ? extractedText.length : 0 };
};

export const uploadResumeService = async (userId, file) => {
    if (!file) throw new ApiError(400, "Resume file is required");
    if (await resumeRepository.findByUserId(userId)) {
        throw new ApiError(409, "You already have a resume. Use replace (PATCH /resume) or delete it first");
    }

    // Read the text first: if the PDF is unusable we never store a file for it
    const extractedText = await extractTextFromPDF(file.buffer);
    const saved = await saveResumeFile(file.buffer);

    try {
        const resume = await resumeRepository.create({
            userId,
            fileName: file.originalname,
            resumeUrl: saved.url,
            storage: saved.storage,
            publicId: saved.publicId,
            extractedText,
        });
        await cache.invalidateUser(userId);
        return view(resume);
    } catch (error) {
        await deleteResumeFile(saved); // do not leave an orphan file behind
        throw error;
    }
};

export const getResumeService = async (userId) => {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) throw new ApiError(404, "Resume not found");
    return view(resume);
};

export const getResumeFileInfoService = async (userId) => {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) throw new ApiError(404, "Resume not found");
    return resume;
};

export const replaceResumeSerivce = async (userId, file) => {
    if (!file) throw new ApiError(400, "New resume file is required");
    const oldResume = await resumeRepository.findByUserId(userId);
    if (!oldResume) throw new ApiError(404, "Resume not found");

    // Upload the new file first and delete the old one only after everything worked
    const extractedText = await extractTextFromPDF(file.buffer);
    const saved = await saveResumeFile(file.buffer);

    let updated;
    try {
        updated = await resumeRepository.updateByUserId(userId, {
            fileName: file.originalname,
            resumeUrl: saved.url,
            storage: saved.storage,
            publicId: saved.publicId,
            extractedText,
        });
    } catch (error) {
        await deleteResumeFile(saved);
        throw error;
    }

    await deleteResumeFile(oldResume);
    // The old analysis describes the old resume, so remove it. The user must analyse again.
    await resumeAnalysisRepository.deleteByUserId(userId);
    await cache.invalidateUser(userId);
    return view(updated);
};

export const deleteResumeService = async (userId) => {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) throw new ApiError(404, "Resume not found");

    await deleteResumeFile(resume);
    await resumeRepository.deleteByUserId(userId);
    await resumeAnalysisRepository.deleteByUserId(userId);
    await cache.invalidateUser(userId);
    return null;
};
