import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import {logout} from "../../services/auth.service.js"

import useAuthStore from "../../store/auth.store.js";

import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


function Navbar() {

    const navigate = useNavigate();
    const logoutUser = useAuthStore((state) => state.logout);

const handleLogout = async () => {

    try {
        const response = await logout();
        logoutUser();
        toast.success(response.message);
        navigate("/login", { replace: true });

    } catch (error) {
toast.error(
                error.response?.data?.message ||
                "Logout failed"
            );

    }


};




    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    // Stores whether the mobile menu is open
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    return (
        <header className="border-b bg-white shadow-sm">

            {/* Navbar */}

            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}

                <Link
                    to="/"
                    className="text-2xl font-bold text-blue-600"
                >
                    Auth System
                </Link>

                {/* Desktop Navigation */}

                <div className="hidden items-center gap-6 md:flex">  {/* md:flex = Hidden on mobile Visible on medium screens and larger. */}

                    <Link
                        to="/"
                        className="transition hover:text-blue-600"
                    >
                        Home
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/profile"
                                className="transition hover:text-blue-600"
                            >
                                Profile
                            </Link>

                            <button onClick={handleLogout}
                                className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="transition hover:text-blue-600"
                            >
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                            >
                                Signup
                            </Link>
                        </>
                    )}

                </div>

                {/* Mobile Menu Button */}

                <button
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >                                                    {/*md:hidden: Visible only on mobile. Hidden on medium screens and larger. */}
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}    {/* A React component from the lucide-react library. It renders a hamburger (☰) SVG icon. */}
                </button>

            </nav>


            {/* Mobile Menu */}

            {isMenuOpen && (
                <div className="border-t bg-white md:hidden">

                    <div className="flex flex-col gap-4 p-5">

                        <Link
                            to="/"
                            className="hover:text-blue-600"
                        >
                            Home
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="hover:text-blue-600"
                                >
                                    Profile
                                </Link>

                                <button onClick={handleLogout}
                                    className="rounded-lg bg-red-500 px-4 py-2 text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hover:text-blue-600"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
                                >
                                    Signup
                                </Link>
                            </>
                        )}

                    </div>

                </div>

            )
            }


        </header >
    );
}

export default Navbar;