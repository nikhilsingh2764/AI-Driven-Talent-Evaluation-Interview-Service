import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import userRepository from "../repository/auth/user.repository.js";
import TryCatch from "./TryCatch.js";

// Accepts the token from the HttpOnly cookie (browser) or an "Authorization: Bearer <token>" header (Postman, scripts).
const getToken = (req) => {
    if (req.cookies?.accessToken) return req.cookies.accessToken;
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.slice(7) : null;
};

const authMiddleware = TryCatch(async (req, res, next) => {
    const token = getToken(req);
    if (!token) throw new ApiError(401, "Access token is missing");

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        // An expired or bad token is the client's problem (401), not a server crash (500)
        throw new ApiError(401, error.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token");
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) throw new ApiError(401, "User not found");
    if (!user.isActive) throw new ApiError(403, "Account is deactivated");
    if (!user.isVerified) throw new ApiError(403, "Email is not verified");

    req.user = user;
    next();
});

export default authMiddleware;
