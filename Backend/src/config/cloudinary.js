import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// v2 is the current API version of cloudnary used in Node.js applications.
console.log("Cloudinary config loaded");


// Configure Cloudinary
cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    // Your Cloudinary account name.

    api_key: process.env.CLOUDINARY_API_KEY,
    // Public API key used to identify your account.

    api_secret: process.env.CLOUDINARY_API_SECRET,
    // Secret key used to authenticate requests.
    // Never expose this on the frontend.

});


// Debug only
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);


// Export configured Cloudinary instance
export default cloudinary;