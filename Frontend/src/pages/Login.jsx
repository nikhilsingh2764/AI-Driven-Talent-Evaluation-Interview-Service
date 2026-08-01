import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";

import { useForm } from "react-hook-form"; //Main hook from React Hook Form. Manages form state, validation, submission and errors.
import { zodResolver } from "@hookform/resolvers/zod"; //Connects the Zod validation schema  with React Hook Form. Every submit is validated using LoginSchema.
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { loginSchema } from "../validation/auth.schema";
import { login } from "../services/auth.service";

import useAuthStore from "../store/auth.store";


function Login() {

    const navigate = useNavigate();
    const loginUser = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {

            const response = await login(data);

            loginUser(response.data.user);

            toast.success(response.message);

            navigate("/");

        } catch (error) {

            console.log("Full error:", error);
            console.log("Backend error:", error.response?.data);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                "Something went wrong"
            );

        }
    };



    return (
        <>
            <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-10">

                <Card
                    title="Login"
                    subtitle="Welcome back! Please login to continue."
                >

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register("email")}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />


<div className="flex justify-end">
    <Link
        to="/forgot-password"
        className="text-sm text-blue-600 hover:underline"
    >
        Forgot Password?
    </Link>
</div>



                        <Button
                            type="submit"
                            loading={isSubmitting}
                        >
                            Login
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>

                    </form>

                </Card>

            </section>

        </>);
}

export default Login;
