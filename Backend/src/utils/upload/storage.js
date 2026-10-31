// Resume file storage. Uses Cloudinary when its three env vars are set, otherwise saves to Backend/uploads/resumes.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import streamifier from "streamifier";
import { cloudinaryConfigured } from "../../config/env.js";
import cloudinary from "../../config/cloudinary.js";

const LOCAL_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "uploads", "resumes");

export const storageProvider = () => (cloudinaryConfigured() ? "cloudinary" : "local");

const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ai-interview/resumes", resource_type: "raw" },
            (error, result) => (error ? reject(error) : resolve(result)),
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });

/** Saves the PDF and returns { storage, url, publicId }. */
export const saveResumeFile = async (buffer) => {
    if (cloudinaryConfigured()) {
        const result = await uploadToCloudinary(buffer);
        return { storage: "cloudinary", url: result.secure_url, publicId: result.public_id };
    }
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    const publicId = `${crypto.randomUUID()}.pdf`;
    await fs.writeFile(path.join(LOCAL_DIR, publicId), buffer);
    // Local files are not public: they are served through the authenticated GET /resume/file endpoint.
    return { storage: "local", url: "/api/v1/resume/file", publicId };
};

/** Best-effort delete: a leftover file must never fail the request. */
export const deleteResumeFile = async ({ storage, publicId }) => {
    try {
        if (storage === "cloudinary") {
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        } else {
            await fs.unlink(path.join(LOCAL_DIR, path.basename(publicId)));
        }
    } catch (error) {
        console.warn(`Could not delete resume file ${publicId}: ${error.message}`);
    }
};

export const localResumePath = (publicId) => path.join(LOCAL_DIR, path.basename(publicId));
