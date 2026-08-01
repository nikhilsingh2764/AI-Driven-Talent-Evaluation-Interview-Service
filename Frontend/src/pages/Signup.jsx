import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";

import { useForm } from "react-hook-form"; //Main hook from React Hook Form. Manages form state, validation, submission and errors.
import { zodResolver } from "@hookform/resolvers/zod"; //Connects the Zod validation schema  with React Hook Form. Every submit is validated using signupSchema.
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { signupSchema } from "../validation/auth.schema"; //validation schema
import { signup } from "../services/auth.service";


function Signup() {

    const navigate = useNavigate();

    const {

        register, // Registers an input with React Hook Form. Tracks its value automatically and automatically supplies: name,ref,onChange,onBlur
        handleSubmit, // Validates the form. Calls onSubmit() only if validation passes.
        formState: { errors, isSubmitting } //errors:Contains validation errors for each field.
        //isSubmitting: / Boolean provided by React Hook Form. true=while form submission is running false =  after submission completes

    } = useForm({
        resolver: zodResolver(signupSchema),

        defaultValues: { // Sets the initial values of all form fields.

            username: "",

            email: "",

            password: ""

        }

    });


    const onSubmit = async (data) => {
        try {
            const response = await signup(data);

            toast.success(response.message)
            console.log(response);

            sessionStorage.setItem("verifyEmail", response.data.email); //so if we refresh verify-otp page email state remains not vanish

            navigate("/verify-otp");


        } catch (error) {

            console.log("Full error:", error);
            console.log(error.response);
            console.log("Backend error:", error.response?.data);
            console.log(error.response?.data?.errors?.[0]?.msg);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.message ||
                "Something went wrong"
            );
        }
    };


    return (
        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-10">

            <Card
                title="Create Account"
                subtitle="Create your account to continue"
            >

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

                    <Input
                        label="Username"
                        autoComplete="username"
                        placeholder="Enter username"
                        error={errors.username?.message}
                        {...register("username")}
                    />

                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                        placeholder="Enter email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register("password")}
                        placeholder="Enter password"
                    />

                    <Button type="submit" loading={isSubmitting}>
                        Create Account
                    </Button>

                </form>

            </Card>
        </section>
    );
}

export default Signup;

//loading: Custom prop passed to the Button component.  Shows a spinner and disables the button
// Spread operator (...)Expands the object returned by register() into individual props for the Input component.

//HTML attribute: Helps browsers autofill inputs and works with password managers.