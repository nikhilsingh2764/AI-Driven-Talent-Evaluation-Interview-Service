import { z } from "zod";


export const signupSchema = z.object({


    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters"),

    email: z
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password cannot exceed 50 characters")

});



export const verifyOtpSchema = z.object({
    otp: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),
});


export const loginSchema = z.object({

    email: z
        .email("Invalid email address")
        .trim()
        .min(1, "Email is required"),

    password: z
        .string()
        .min(1, "Password is required"),

});


export const forgotPasswordSchema = z
    .object({

        email: z
            .email("Invalid email address")
            .trim()
            .min(1, "Email is required"),

        otp: z
            .string()
            .trim()
            .optional(),

        newPassword: z
            .string()
            .optional(),

        confirmPassword: z
            .string()
            .optional(),

    })
    .refine(
        (data) => {

            // Don't validate password fields
            // before OTP step

            if (!data.newPassword && !data.confirmPassword) {
                return true;
            }

            return data.newPassword === data.confirmPassword;

        },
        {
            path: ["confirmPassword"],
            message: "Passwords do not match",
        }
    );
