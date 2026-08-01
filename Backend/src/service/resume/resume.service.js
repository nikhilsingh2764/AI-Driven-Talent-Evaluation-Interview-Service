import ApiError from "../../utils/ApiError.js"
import resumeRepository from "../../repository/resume/resume.repository.js";
import resumeAnalysisRepository from "../../repository/resume/resumeAnalysis.repository.js";

import redis from "../../config/redis.js"

import { uploadToCloudinary, downloadPdfFromCloudinary, deleteFromCloudinary } from "../../utils/upload/cloudinaryUpload.js"
import { extractTextFromPDF } from "../../utils/pdf.js"


export const uploadResumeService = async (userId, file) => {

    if (!file) {
        throw new ApiError(400, "Resume file is required");
    }

    const uploadedFile = await uploadToCloudinary(file.buffer);

    if (!uploadedFile) {
        throw new ApiError(500, "Failed to upload resume");
    }

    // Download PDF from Cloudinary
    const pdfBuffer = await downloadPdfFromCloudinary(uploadedFile.secure_url);
    console.log("Downloaded");


    //extract text from pdf
    const extractedText = await extractTextFromPDF(pdfBuffer);
    console.log("Extracted");

    if (!extractedText) {
        throw new ApiError(500, "Failed to extract resume text")
    }

    const resume = await resumeRepository.create({
        userId,
        fileName: file.originalname,
        resumeUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        extractedText
    })

    return resume;

};



export const getResumeService = async (userId) => {

    const resume = await resumeRepository.findByUserId(userId);

    if (!resume) {
        throw new ApiError(404, "Resume not found")
    }

    return resume

};


export const replaceResumeSerivce = async (userId, file) => {

    //find resume from db
    const oldResume = await resumeRepository.findByUserId(userId);

    if (!oldResume) {
        throw new ApiError(404, "Resume not found");
    }

    //delete old pdf from Cloudinary
    await deleteFromCloudinary(oldResume.publicId)

    //Upload new PDF to Cloudinary
    const newUploaded = await uploadToCloudinary(file.buffer);

    if (!newUploaded) {
        throw new ApiError(500, "Failed to upload resume");
    }

    //download pdf from Cloudinary
    const pdfBuffer = await downloadPdfFromCloudinary(newUploaded.secure_url);

    if (!pdfBuffer) {
        throw new ApiError(500, "Failed to download resume");
    }

    //extract text from pdf
    const extractedText = await extractTextFromPDF(pdfBuffer);

    const updatedData = {
        userId,
        fileName: file.originalname,
        resumeUrl: newUploaded.secure_url,
        publicId: newUploaded.public_id,
        extractedText
    }

    const updatedResume = await resumeRepository.updateByUserId(userId, updatedData);


    return updatedResume;




};


export const deleteResumeService = async (userId) => {

    const resume = await resumeRepository.findByUserId(userId);

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    //delete in Cloudinary using publicId
    await deleteFromCloudinary(resume.publicId);

    //delete resume from db
    await resumeRepository.deleteByUserId(userId);

    // Delete resume analysis
    await resumeAnalysisRepository.deleteByUserId(userId);



    try {
        await redis.del(`Dashboard:${userId}`);
    } catch (error) {
        console.error("Redis Delete Error:", error);
    }

    return null


};