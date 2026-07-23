import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


// Creates a reusable Axios instance. prevent repeating baseURL, headers and configuration in every API-call
////Sends cookies automatically with every request.
//// Sets default HTTP headers for every request. //saying to backend we are sending JSON


// ==============================
// Response Interceptor
// ==============================

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // Access token expired
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {

                // Create new access token
                await api.post("/refresh-token");

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {

                // Refresh token expired
                localStorage.clear();
                sessionStorage.clear();

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;