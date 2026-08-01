import ApiError from '../../utils/ApiError.js';
import bcrypt from 'bcrypt';
import redis from '../../config/redis.js';

import userRepository from '../../repository/auth/user.repository.js';
import otpRepository from "../../repository/auth/otp.repository.js";
import refreshTokenRepository from "../../repository/auth/refreshToken.repository.js";

import sendEmail from '../email/email.service.js';
import sendOTPService from "../auth/otp.service.js";

import generateToken from "../../utils/auth/generateToken.js";

import welcomeTemplate from "../../templates/welcome.template.js";


const SALT_ROUNDS = 10;


export const SignupService = async (userdata) => {

    let { username, email, password } = userdata;


    username = username.trim();
    email = email.trim().toLowerCase();


    const emailExist = await userRepository.emailExist(email);


    if (emailExist) {
        throw new ApiError(
            409,
            "Email already exists"
        );
    }


    const usernameExist = await userRepository.usernameExist(username);


    if (usernameExist) {
        throw new ApiError(
            409,
            "Username already exists"
        );
    }


    await sendOTPService({
        username,
        email,
        password,
        type: "EMAIL_VERIFICATION"
    });


    return {
        email
    };

};




export const VerifyOTPService = async ({ email, otp }) => {



    //find old record
    const otpData = await otpRepository.findByEmail(email);

    if (!otpData) {
        throw new ApiError(400, 'Invalid OTP');
    }

    //check opt expiry
    if (otpData.expiresAt < new Date()) {

        await otpRepository.deleteById(otpData._id);
        throw new ApiError(400, "OTP has expired");

    }

    //verify otp
    if (otpData.otp !== otp) {
        throw new ApiError(400, 'Invalid OTP');
    }

    // create user
    const user = await userRepository.create({
        email: otpData.email,
        username: otpData.username,
        password: otpData.password,
        isVerified: true
    })


    //remove all opt record form db after successful verification
    await otpRepository.deleteById(otpData._id);

    //send welcome email
    await sendEmail({
        to: user.email,
        subject: "successful verification",
        html: welcomeTemplate(user.username)
    });

    return user;

};


export const LoginService = async (userdata) => {

    let { email, password } = userdata;


    // Sanitize email
    email = email.trim().toLowerCase();


    // Find user
    const user = await userRepository.findByEmail(email);


    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }



    // Check email verification

    if (!user.isVerified) {

        throw new ApiError(
            400,
            "Please verify your email"
        );

    }



    // Check account active

    if (!user.isActive) {

        throw new ApiError(
            400,
            "Account is deactivated"
        );

    }



    // Check account lock

    if (
        user.lockUntil &&
        user.lockUntil > new Date()
    ) {

        throw new ApiError(
            403,
            "Account temporarily locked. Try again later"
        );

    }



    // Compare password

    const isPasswordMatch =
        await bcrypt.compare(
            password,
            user.password
        );



    // Wrong password

    if (!isPasswordMatch) {


        user.failedLoginAttempts += 1;



        // Lock account after 5 failed attempts

        if (user.failedLoginAttempts >= 5) {


            user.lockUntil =
                new Date(
                    Date.now() + 15 * 60 * 1000
                );


        }



        await userRepository.updateProfile(
            user._id,
            {
                failedLoginAttempts:
                    user.failedLoginAttempts,

                lockUntil:
                    user.lockUntil
            }
        );



        throw new ApiError(
            400,
            "Invalid email or password"
        );

    }




    // Successful login
    // Reset failed attempts


    if (
        user.failedLoginAttempts > 0 ||
        user.lockUntil
    ) {


        await userRepository.updateProfile(
            user._id,
            {
                failedLoginAttempts: 0,
                lockUntil: null
            }
        );

    }




    // Generate Access Token

    const accessToken = generateToken(

        {
            id: user._id,
            email: user.email
        },

        process.env.ACCESS_TOKEN_SECRET,

        process.env.ACCESS_TOKEN_EXPIRES_IN

    );




    // Generate Refresh Token

    const refreshToken = generateToken(

        {
            id: user._id
        },

        process.env.REFRESH_TOKEN_SECRET,

        process.env.REFRESH_TOKEN_EXPIRES_IN

    );

    console.log(accessToken)
    console.log("refreshToken :", refreshToken)

    await refreshTokenRepository.create({

        userId: user._id,

        token: refreshToken,

        expiresAt: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        )

    });



    return {

        user: {

            email: user.email,

            username: user.username,

            id: user._id

        },


        accessToken,

        refreshToken

    };


};




export const ProfileService = async (userId) => {

    console.log("Profile userId:", userId);

    const cacheKey = `profile:${userId}`;

    let cacheProfile = null;

    try {
        cacheProfile = await redis.get(cacheKey);
        console.log("Redis data:", cacheProfile);
    } catch(error){
        console.log("Redis error:", error.message);
    }


    const user = await userRepository.findById(userId);

    console.log("User from DB:", user);


    if(!user){
        throw new ApiError(404,"User not found");
    }


    return user;
};


export const LogoutService = async (refreshToken) => {


    // Remove refresh token from database
    if (refreshToken) {

        await refreshTokenRepository.deleteByToken(
            refreshToken
        );

    }


    return null;

};



export const UpdateProfileService = async (userId, data) => {

    const { username } = data;


    // Check username exists
    if (username) {

        const existingUser = await userRepository.findByUsername(userId, username);

        if (existingUser) {
            throw new ApiError(400, "User already exist")
        }

    }


    // Update profile
    const updatedUser = await userRepository.updateProfile(
        userId,
        {
            username
        }
    );


    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    await redis.del(`profile:${userId}`);

    // Return safe user data
    return {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
    };

};



export const ForgotPasswordService = async (email) => {

    // Sanitize email
    email = email.trim().toLowerCase();

    //check user exists
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    //remove old password reset history from db
    await otpRepository.deleteByEmailAndType(email, "PASSWORD_RESET");


    // Send new OTP
    await sendOTPService({  //is a service take data and send otp and save otp data in otp-db
        email: user.email,
        type: "PASSWORD_RESET"
    });

    return null;




}




export const ResetPasswordService = async ({ email, otp, newPassword }) => {


    // Validate input
    if (!email || !otp || !newPassword) {
        throw new ApiError(
            400,
            "Email, OTP and new password are required"
        );
    }

    // Sanitize email
    email = email.trim().toLowerCase();

    // Find user
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new ApiError(404, "User not found");
    }


    //find Otp
    const otpdata = await otpRepository.findByEmailAndType(email, "PASSWORD_RESET")


    if (!otpdata) {
        throw new ApiError(400, "Invalid OTP");
    }

    console.log("DB OTP:", otpdata.otp);

    // Check expiry
    if (otpdata.expiresAt < new Date()) {
        await otpRepository.deleteById(otpdata._id);
        throw new ApiError(400, "OTP has expired");
    }

    //OPT verify
    if (otpdata.otp !== otp) {
        throw new ApiError(400, "Invalid  OTP");
    }


    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);



    //update password
    await userRepository.updateProfile(
        user._id,
        {
            password: hashedNewPassword
        }
    );

    // Delete OTP after successful reset
    await otpRepository.deleteById(otpdata._id);

    return null;

}




export const updatePasswordService = async (id, data) => {

    const { oldPassword, newPassword } = data;

    if (!newPassword || !oldPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    //Find user with password
    const user = await userRepository.findByIdWithPassword(id)

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    //compare old password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect");

    }

    //hash new password

    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    //update password in DB
    await userRepository.updateProfile(id, { password: newHashedPassword })

    return null;

};




export const DeactivateAccountService = async (id) => {

    //check user exist
    const user = await userRepository.findById(id);

    if (!user) {
        throw new ApiError(404, "User not exist")
    }

    console.log("accoynt is", user.isActive);

    //check already de-activate
    if (!user.isActive) {
        throw new ApiError(400, "Account is already deactivated");
    }

    //De-Activate account
    await userRepository.deactivateAccount(id);

    return null;

}




export const DeleteAccountService = async (id, password) => {

    // Check password is provided
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    //find user exist
    const user = await userRepository.findByIdWithPassword(id);

    if (!user) {
        throw new ApiError(400, "user not found")
    }


    // Verify password 
    const isPasswordCorrect = await bcrypt.compare(password, user.password);


    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }


    //delete account
    await userRepository.findByIdAndDelete(id);

    //return null;


};


//note pass {} when multiple parameters are there
