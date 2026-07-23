import TryCatch from "../middleware/TryCatch.js";
import ApiResponse from "../utils/ApiResponse.js";

import { createBusinessService, getBusinessProfileService, updateBusinessProfileService, deleteBusinessProfileService } from "../service/business.service.js";




export const createBusiness = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const business = await createBusinessService({ userId, businessData: req.body });

    return res.status(201).json(
        new ApiResponse(201, "Business profile created successfully", business)
    )


});


export const getBusinessProfile = TryCatch(async (req, res) => {


});



export const updateBusiness = TryCatch(async (req, res) => {


});



export const deleteBusiness = TryCatch(async (req, res) => {


});

