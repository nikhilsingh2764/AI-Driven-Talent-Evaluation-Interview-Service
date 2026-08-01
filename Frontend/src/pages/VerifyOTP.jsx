import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import { verifyOtpSchema } from "../validation/auth.schema";
import { verifyOtp } from "../services/auth.service.js";


import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";





function VerifyOTP() {

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            otp: "",
        },
    });

    const email = sessionStorage.getItem("verifyEmail");

    const onSubmit = async (data) => {

        try {

            const response = await verifyOtp({
                email,
                otp: data.otp
            });

            toast.success(response.message);
            console.log(response);

            sessionStorage.removeItem("verifyEmail");

            navigate("/Login");

        } catch (error) {

            console.log("Full error:", error);

            console.log("Backend error:", error.response?.data);
            console.log(error.response?.data?.message)

            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        }


    };




    return (
        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-10">
            <Card
                title="ackVerify OTP"
                subtitle={`Enter the OTP sent to ${email}`}
            >
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <Input
                        label="OTP"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        autoComplete="one-time-code"
                        error={errors.otp?.message}
                        {...register("otp")}
                    />

                    <Button
                        type="submit"
                        loading={isSubmitting}
                    >
                        Verify OTP
                    </Button>
                </form>
            </Card>
        </section>
    );
}


export default VerifyOTP;
