import bcrypt from 'bcrypt';
import otpRepository from '../repository/otp.repository.js';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from './email.service.js';
import otpTemplate from '../templates/otp.template.js';
import resetPasswordTemplate from "../templates/resetPassword.template.js";
import UserRepository from '../repository/user.repository.js';

const SALT_ROUNDS = 10;


const sendOTPService = async ({ username=null, email, password=null, type }) => {


    //Hash password

    let hashedPassword = null;

    // Hash password only for signup
    if (type === "EMAIL_VERIFICATION") {
        hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    //generate 6-digit OPT
    const otp = generateOTP();
    console.log("OTP IS:",otp);

    
    //OPT expires in 10 min
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //10 min

    //remove all old opt from this email
    await otpRepository.deleteByEmailAndType(email, type);

    // Save temporary signup data
    await otpRepository.create({
        username,
        email,
        password: hashedPassword,
        otp,
        expiresAt,
        type
    })


    //send to client email

    if (type === "EMAIL_VERIFICATION") {

        await sendEmail({
            to: email,
            subject: "Verify Your Email",
            html: otpTemplate(username, otp)
        });

    } else if (type === "PASSWORD_RESET") {

        await sendEmail({
            to: email,
            subject: "Reset Your Password",
            html: resetPasswordTemplate(otp)
        });

    }



    return null;

};

export default sendOTPService;

//opt+data save in db and opt send to client email next is opt verify

