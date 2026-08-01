import cloudinary from "../../config/cloudinary.js"; //import cloudnary instance 
import axios from "axios";
import streamifier from "streamifier";


//Multer memoryStorage() gives us a pdf Buffer.
// Cloudinary upload_stream() needs a Readable Stream.
// streamifier converts Buffer → Readable Stream.


// Upload PDF to Cloudinary
export const uploadToCloudinary = async (buffer) => {

    // file is req.file from Multer.
    return new Promise((resolve, reject) => {
        // Cloudinary upload is callback-based.
        // We wrap it in a Promise so we can use async/await.

        const uploadStream = cloudinary.uploader.upload_stream(

            {
                folder: "ai-interview/resumes",
                resource_type: "raw" // PDF, DOCX, ZIP, etc.
            },

            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result);

            }

        );


        // Convert Buffer → Stream-> Cloudinary
        streamifier
            .createReadStream(buffer)
            .pipe(uploadStream);

    });

};



// download PDF form Cloudinary
export const downloadPdfFromCloudinary = async (url) => {

    // Download file as Buffer
    const response = await axios.get(url, {
        responseType: "arraybuffer"
    });

    // Return PDF Buffer
    return Buffer.from(response.data); //convert binary-data into buffer and return

};

export const deleteFromCloudinary = async (publicId) => {

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw"
    })

    return result;


};