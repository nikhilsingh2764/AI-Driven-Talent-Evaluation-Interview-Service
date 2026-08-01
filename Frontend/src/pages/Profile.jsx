import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

import useAuthStore from "../store/auth.store";

import {
    getProfile,
    deactivateAccount,
    deleteAccount,
} from "../services/auth.service";


function Profile() {


    const navigate = useNavigate();


    const user = useAuthStore(
        (state) => state.user
    );

    const login = useAuthStore(
        (state) => state.login
    );

    const logout = useAuthStore(
        (state) => state.logout
    );



    const [showDeactivate, setShowDeactivate] = useState(false);

    const [showDelete, setShowDelete] = useState(false);

    const [password, setPassword] = useState("");



    // Get profile data

    useEffect(() => {


        const fetchProfile = async () => {

            try {


                const response = await getProfile();


                login(response.data);


            } catch (error) {


                toast.error(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );


            }

        };


        fetchProfile();


    }, [login]);





    // Deactivate account

    const handleDeactivate = async () => {


        try {


            const response = await deactivateAccount();


            toast.success(response.message);


            logout();


            navigate("/login", {
                replace: true
            });



        } catch (error) {


            toast.error(
                error.response?.data?.message ||
                "Deactivate failed"
            );


        }


    };






    // Delete account

    const handleDelete = async () => {


        try {


            const response = await deleteAccount({
                password
            });


            toast.success(response.message);


            logout();


            navigate("/login", {
                replace: true
            });



        } catch (error) {


            toast.error(
                error.response?.data?.message ||
                "Delete failed"
            );


        }


    };





    if (!user) {

        return (
            <div className="flex justify-center py-20">
                Loading...
            </div>
        );

    }




    return (

        <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-10">


            <Card
                title="My Profile"
                subtitle="Manage your account"
            >


                <div className="space-y-5">



                    <div>
                        <p className="text-sm text-gray-500">
                            Username
                        </p>

                        <p className="font-semibold">
                            {user.username}
                        </p>
                    </div>





                    <div>
                        <p className="text-sm text-gray-500">
                            Email
                        </p>

                        <p className="font-semibold">
                            {user.email}
                        </p>
                    </div>





                    <div>
                        <p className="text-sm text-gray-500">
                            Verification
                        </p>

                        <p className="font-semibold">
                            {
                                user.isVerified
                                ? "Verified"
                                : "Not Verified"
                            }
                        </p>
                    </div>





                    <div>
                        <p className="text-sm text-gray-500">
                            Account Status
                        </p>

                        <p className="font-semibold">
                            {
                                user.isActive
                                ? "Active"
                                : "Inactive"
                            }
                        </p>
                    </div>





                    <div className="flex flex-col gap-3 pt-5">


                        <Button
                            onClick={() =>
                                navigate("/EditProfile")
                            }
                        >
                            Edit Profile
                        </Button>



                        <Button
                            onClick={() =>
                                navigate("/change-password")
                            }
                        >
                            Change Password
                        </Button>





                        <Button
                            onClick={() =>
                                setShowDeactivate(true)
                            }
                        >
                            Deactivate Account
                        </Button>





                        <Button
                            onClick={() =>
                                setShowDelete(true)
                            }
                        >
                            Delete Account
                        </Button>



                    </div>


                </div>



            </Card>







            {/* Deactivate Modal */}


            {
                showDeactivate && (

                    <div className="fixed inset-0 flex items-center justify-center bg-black/50">


                        <div className="rounded-lg bg-white p-6">


                            <h2 className="text-xl font-bold">
                                Deactivate Account
                            </h2>


                            <p className="mt-3">
                                Are you sure you want to deactivate?
                            </p>




                            <div className="mt-5 flex gap-3">


                                <Button
                                    onClick={() =>
                                        setShowDeactivate(false)
                                    }
                                >
                                    Cancel
                                </Button>



                                <Button
                                    onClick={handleDeactivate}
                                >
                                    Confirm
                                </Button>


                            </div>


                        </div>


                    </div>

                )
            }









            {/* Delete Modal */}


            {
                showDelete && (

                    <div className="fixed inset-0 flex items-center justify-center bg-black/50">


                        <div className="rounded-lg bg-white p-6">


                            <h2 className="text-xl font-bold text-red-600">
                                Delete Account
                            </h2>


                            <p className="mt-3">
                                This action cannot be undone.
                            </p>



                            <Input

                                label="Password"

                                type="password"

                                value={password}

                                onChange={(e)=>
                                    setPassword(e.target.value)
                                }

                            />





                            <div className="mt-5 flex gap-3">


                                <Button
                                    onClick={() =>
                                        setShowDelete(false)
                                    }
                                >
                                    Cancel
                                </Button>



                                <Button
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>


                            </div>


                        </div>


                    </div>

                )
            }



        </section>

    );

}



export default Profile;