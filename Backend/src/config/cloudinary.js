import { v2 as cloudinary } from "cloudinary";
import "./env.js";

// Credentials are read from the environment. Nothing is logged.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
