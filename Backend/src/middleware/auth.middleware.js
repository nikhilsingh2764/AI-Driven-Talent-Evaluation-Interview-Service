import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import userRepository from "../repository/auth/user.repository.js";
import TryCatch from "./TryCatch.js";

const authMiddleware = TryCatch(async (req, res, next) => {

    console.log("===== AUTH START =====");

    console.log("Cookies:", req.cookies);
    console.log("Header Cookie:", req.headers.cookie);


    const accessToken = req.cookies.accessToken;

    console.log("Access Token:", accessToken);


    if (!accessToken) {
        throw new ApiError(401, "Access token is missing");
    }


    const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    );

    console.log("Decoded JWT:", decoded);


    const user = await userRepository.findById(decoded.id);

    console.log("Database User:", user);


    if (!user) {
        throw new ApiError(401, "user not found");
    }


    req.user = user;

    next();

});

export default authMiddleware;




































