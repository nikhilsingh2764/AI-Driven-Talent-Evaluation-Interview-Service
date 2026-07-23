import { create } from "zustand";

const useAuthStore = create((set) => ({  //create: Creates a global Zustand store.

    // Logged in user
    user: null,  //Stores the logged-in user's information.

    // Login status
    isAuthenticated: false,  //Indicates whether the user is logged in or not.

    // Loading state
    loading: false, //Tracks API request state.

    // Save user after login
    login: (userData) =>   //Updates the store after a successful login.
        set({
            user: userData,
            isAuthenticated: true,
        }),

    // Clear user after logout
    
    logout: () => // Clears the store after logout.
        set({
            user: null,
            isAuthenticated: false,
        }),

    // Loading state
    setLoading: (status) => //Updates the loading state.
        set({
            loading: status,
        }),

}));

export default useAuthStore;