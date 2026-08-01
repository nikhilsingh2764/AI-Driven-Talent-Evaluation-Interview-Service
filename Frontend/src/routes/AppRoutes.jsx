import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyOTP from "../pages/VerifyOTP";
import ForgotPassword from "../pages/ForgotPassword";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import EditProfile from "../pages/EditProfile";
import ChangePassword from "../pages/changePassword";

function AppRoutes() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Layout Routes */}
                <Route element={<Layout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/signup" element={<Signup />} />

                    <Route path="/verify-otp" element={<VerifyOTP />} />

                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    <Route path="/profile" element={<Profile />} />

                    <Route path="/EditProfile" element={<EditProfile />} />

                    <Route path="/change-password"  element={<ChangePassword />}/>

                </Route>

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRoutes;

//BrowserRouter = Enables client-side routing using the browser's history API.
//Routes = Matches the current URL and renders the correct Route.
//Route = Maps a URL path to a React component.
//path="*" = Catch-all route.