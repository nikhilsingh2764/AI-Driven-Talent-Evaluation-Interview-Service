import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

import useAuthStore from "../store/auth.store";
import { updateProfile } from "../services/auth.service";


function EditProfile() {

    const navigate = useNavigate();

    const user = useAuthStore(
        (state) => state.user
    );

    const login = useAuthStore(
        (state) => state.login
    );


    const [username, setUsername] = useState(
        user?.username || ""
    );


    const [loading, setLoading] = useState(false);



    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setLoading(true);


            const response = await updateProfile({
                username
            });


            toast.success(response.message);


            login(response.data);


            navigate("/profile");


        } catch (error) {


            toast.error(
                error.response?.data?.message ||
                "Profile update failed"
            );


        } finally {

            setLoading(false);

        }

    };



    return (

        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4">


            <Card
                title="Edit Profile"
                subtitle="Update your username"
            >


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >


                    <Input

                        label="Username"

                        value={username}

                        onChange={(e)=>
                            setUsername(e.target.value)
                        }

                    />



                    <Button
                        type="submit"
                        loading={loading}
                    >
                        Save Changes
                    </Button>


                </form>


            </Card>


        </section>

    );

}


export default EditProfile;