import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import { changePassword } from "../services/auth.service";


function ChangePassword() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        oldPassword: "",
        newPassword: "",
        confirmPassword: ""

    });


    const [loading, setLoading] = useState(false);



    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };




    const handleSubmit = async (e) => {

        e.preventDefault();


        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {

            toast.error(
                "Passwords do not match"
            );

            return;

        }



        try {

            setLoading(true);


            const response = await changePassword({

                oldPassword: formData.oldPassword,

                newPassword: formData.newPassword

            });



            toast.success(response.message|| "password change successfluuy");


            navigate("/profile");



        } catch (error) {


            toast.error(

                error.response?.data?.message ||
                "Password change failed"

            );


        } finally {

            setLoading(false);

        }


    };




    return (

        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4">


            <Card

                title="Change Password"

                subtitle="Update your account password"

            >


                <form

                    onSubmit={handleSubmit}

                    className="space-y-5"

                >


                    <Input

                        label="Current Password"

                        type="password"

                        name="oldPassword"

                        value={formData.oldPassword}

                        onChange={handleChange}

                    />



                    <Input

                        label="New Password"

                        type="password"

                        name="newPassword"

                        value={formData.newPassword}

                        onChange={handleChange}

                    />



                    <Input

                        label="Confirm Password"

                        type="password"

                        name="confirmPassword"

                        value={formData.confirmPassword}

                        onChange={handleChange}

                    />



                    <Button

                        type="submit"

                        loading={loading}

                    >

                        Change Password

                    </Button>



                </form>


            </Card>


        </section>

    );

}


export default ChangePassword;