import { PDFParse } from "pdf-parse";
import ApiError from "../ApiError.js";

export const looksLikePdf = (buffer) => Buffer.isBuffer(buffer) && buffer.subarray(0, 5).toString("latin1") === "%PDF-";

/** Reads the text of a PDF straight from memory (no need to download it back from storage). */
export const extractTextFromPDF = async (buffer) => {
    if (!looksLikePdf(buffer)) throw new ApiError(400, "The uploaded file is not a valid PDF");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
        const result = await parser.getText();
        const text = (result.text || "").replace(/\s+\n/g, "\n").trim();
        if (text.length < 30) {
            throw new ApiError(422, "No readable text found in this PDF. It may be a scanned image. Upload a text-based PDF.");
        }
        return text.slice(0, 50000);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(422, "Could not read this PDF. It may be corrupted or password protected.");
    } finally {
        await parser.destroy().catch(() => {});
    }
};
