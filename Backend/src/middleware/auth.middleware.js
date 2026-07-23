import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import UserRepository from "../repository/user.repository.js";
import TryCatch from "./TryCatch.js";

const authMiddleware = TryCatch(async (req, res, next) => {

    //get token from cookies
    const accessToken = req.cookies.accessToken;


    //check token exists
    if (!accessToken) {
        throw new ApiError(401, "Access token is missing");
    }

    //verify JWT
    const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
    )
    console.log(decoded);

    //find latest user in DB
    const user = await UserRepository.findById(decoded.id);

    console.log(user);

    
    if (!user) {
        throw new ApiError(401, "user not found");
    }

    //check user is active
    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated");
    }

    // Store authenticated user for next middleware/controller
    req.user = user;
    next();

});

export default authMiddleware;




































