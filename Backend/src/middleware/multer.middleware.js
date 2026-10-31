import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Files are kept in memory only long enough to read the text and hand them to storage.
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname);
        return isPdf ? cb(null, true) : cb(new ApiError(400, "Only PDF files are allowed"), false);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export default upload;
