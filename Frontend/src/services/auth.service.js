import api from "../api/axios";

// ==========================
// Signup
// ==========================

export const signup = async (data) => {

    const response = await api.post(
        "/Signup",
        data
    );

    return response.data;

};


// ==========================
// Verify Signup OTP
// ==========================

export const verifyOtp = async (data) => {

    const response = await api.post(
        "/verify-otp",
        data
    );

    return response.data;

};


// ==========================
// Login
// ==========================

export const login = async (data) => {

    const response = await api.post(
        "/Login",
        data
    );

    return response.data;

};


// ==========================
// Logout
// ==========================

export const logout = async () => {

    const response = await api.post(
        "/Logout"
    );

    return response.data;

};


// ==========================
// Forgot Password (Send OTP)
// ==========================

export const forgotPassword = async (data) => {

    const response = await api.post(
        "/forgot-password",
        data
    );

    return response.data;

};


// ==========================
// Reset Password
// ==========================

export const resetPassword = async (data) => {

    const response = await api.post(
        "/reset-password",
        data
    );

    return response.data;

};


// ==========================
// show profile
// ==========================

export const getProfile = async () => {

    const response = await api.get(
        "/Profile",
    );

    return response.data;

};

// ==========================
// Deactivate Account
// ==========================

export const deactivateAccount = async () => {
    const response = await api.patch(
        "/deactivate-account",
    );

    return response.data;
};


// ==========================
// Delete Account
// ==========================

export const deleteAccount = async (data) => {
    const response = await api.delete(
        "/delete-account",
        {
            data
        }
    );

    return response.data;
};




export const changePassword = async (data) => {

    const response = await api.patch(
        "/change-password",
        data

    );

    return response.data;
};




export const updateProfile = async (data) => {
    const response = await api.patch(
        "/Update-Profile",
        data
    );

    return response.data;
};
