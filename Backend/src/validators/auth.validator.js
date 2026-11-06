import { body } from "express-validator";

// Lower-case only. (validator's normalizeEmail() silently strips "+tags" from Gmail addresses, so a user would be
// registered under an address they never typed, and a+1@ / a+2@ would collide.)
const email = () =>
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .bail()
        .isEmail().withMessage("Invalid email address")
        .bail()
        .isLength({ max: 254 }).withMessage("Email is too long")
        .customSanitizer((v) => v.toLowerCase());

const strongPassword = (field, label = "Password") =>
    body(field)
        .isString().withMessage(`${label} is required`)
        .bail()
        .isLength({ min: 8, max: 72 }).withMessage(`${label} must be 8 to 72 characters`)
        .matches(/[A-Z]/).withMessage(`${label} must contain one uppercase letter`)
        .matches(/[a-z]/).withMessage(`${label} must contain one lowercase letter`)
        .matches(/[0-9]/).withMessage(`${label} must contain one number`)
        .matches(/[^A-Za-z0-9]/).withMessage(`${label} must contain one special character`);

const username = () =>
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .bail()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters")
        .matches(/^[A-Za-z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores");

const otp = () =>
    body("otp").trim().notEmpty().withMessage("OTP is required").bail().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric().withMessage("OTP must contain only numbers");

export const signupValidator = [username(), email(), strongPassword("password")];
export const verifyOtpValidator = [email(), otp()];
export const resendOtpValidator = [email()];
// Login only checks that a password was sent. Complexity rules belong to signup, not login.
export const LoginValidator = [email(), body("password").isString().notEmpty().withMessage("Password is required")];
export const forgotPasswordValidator = [email()];
export const resetPasswordValidator = [email(), otp(), strongPassword("newPassword", "New password")];
export const updateProfileValidator = [username()];
export const changePasswordValidator = [
    body("oldPassword").isString().notEmpty().withMessage("Old password is required"),
    strongPassword("newPassword", "New password"),
];
export const deleteAccountValidator = [body("password").isString().notEmpty().withMessage("Password is required")];
