import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, res, next) => {

    const errors = validationResult(req);
    console.log(errors.array());   // 👈 Add this

    if (!errors.isEmpty()) {
        throw new ApiError(400, "Validation Failed", errors.array());
    }

    next();

};

export default validate;

