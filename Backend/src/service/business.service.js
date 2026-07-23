import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import businessRepository from "../repository/business.repository.js";



export const createBusinessService = async ({ businessData, userId }) => {


    const existedBusiness = await businessRepository.existsByUserId(userId);

    if (existedBusiness) {
        throw new ApiError(409, "Business profile already exists.")
    }

    businessData.userId = userId; //add userId to the businessData

    const BusinessProfile = await businessRepository.create(businessData);


    if (!BusinessProfile) {
        throw new ApiError(500, "Failed to create business profile.")
    }

    return BusinessProfile;


};



export const getBusinessProfileService = async ({ userId }) => {

}

export const updateBusinessProfileService = async ({ newBusinessData, userId }) => {

}

export const deleteBusinessProfileService = async ({ userId }) => {

}