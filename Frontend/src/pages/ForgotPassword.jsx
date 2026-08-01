import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import {
    forgotPassword,
    resetPassword,
} from "../services/auth.service";

import { forgotPasswordSchema } from "../validation/auth.schema";

function ForgotPassword() {

    const navigate = useNavigate();

    const [otpSent, setOtpSent] = useState(false);
    const [email, setEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
            otp: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data) => {

        try {

            // STEP 1 → Send OTP

            if (!otpSent) {

                const response = await forgotPassword({
                    email: data.email,
                });

                toast.success(response.message);

                setEmail(data.email);
                setOtpSent(true);

                return;
            }

            // STEP 2 → Reset Password

            const response = await resetPassword({
                email,
                otp: data.otp,
                newPassword: data.newPassword,
            });

            toast.success(response.message);

            navigate("/login");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );

        }

    };

    return (

        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-10">

            <Card
                title="Forgot Password"
                subtitle={
                    otpSent
                        ? "Enter OTP and your new password"
                        : "Enter your registered email"
                }
            >

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        disabled={otpSent}
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    {otpSent && (
                        <>
                            <Input
                                label="OTP"
                                placeholder="Enter OTP"
                                maxLength={6}
                                error={errors.otp?.message}
                                {...register("otp")}
                            />

                            <Input
                                type="password"
                                label="New Password"
                                placeholder="Enter new password"
                                error={errors.newPassword?.message}
                                {...register("newPassword")}
                            />

                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm password"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                        </>
                    )}

                    <Button
                        loading={isSubmitting}
                        type="submit"
                    >
                        {otpSent ? "Reset Password" : "Send OTP"}
                    </Button>

                </form>

            </Card>

        </section>

    );

}

export default ForgotPassword;