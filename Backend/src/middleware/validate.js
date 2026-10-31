import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

// Turns express-validator failures into one 400 with a readable message plus the details.
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const list = errors.array().map((e) => ({ field: e.path, message: e.msg }));
        throw new ApiError(400, list[0].message, list);
    }
    next();
};

export default validate;
