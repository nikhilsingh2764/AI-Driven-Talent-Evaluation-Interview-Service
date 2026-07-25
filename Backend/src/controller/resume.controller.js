import ApiResponse from "../utils/ApiResponse.js";
import TryCatch from "../middleware/TryCatch.js";

import { uploadResumeService, getResumeService, replaceResumeSerivce, deleteResumeService } from "../service/resume.service.js";





export const uploadResume = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const file = req.file;

    const fileData = await uploadResumeService(userId, file);


    res.status(200).json(
        new ApiResponse(200, "Resume uploaded successfully", fileData)
    )


});


export const fetchResume = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const resume = await getResumeService(userId);

    res.status(200).json(
        new ApiResponse(200, "Resume fetch successfully", resume)
    )

});


export const replaceResume = TryCatch(async (req, res) => {

    const userId = req.user._id;
    const file = req.file;

    const fileData = await replaceResumeSerivce(userId, file);

    res.status(200).json(
        new ApiResponse(200, "Resume replace successfully", fileData)
    )

});

export const deleteResume = TryCatch(async (req, res) => {

    const userId = req.user._id;

    await deleteResumeService(userId);

    res.status(200).json(
        new ApiResponse(200, "Resume deleted successfully", null)
    )

});


