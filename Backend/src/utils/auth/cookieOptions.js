// Access Token Cookie Options
export const accessTokenOptions = {
    httpOnly: true, // JavaScript cannot access cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Protect against CSRF
    maxAge: 15 * 60 * 1000 // 15 minutes
};


// Refresh Token Cookie Options
export const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60 * 1000  // 15 days
};