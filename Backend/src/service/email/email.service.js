import nodemailer from "nodemailer";
import ApiError from "../../utils/ApiError.js";
import { brevoConfigured, emailConfigured } from "../../config/env.js";

let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        const port = Number(process.env.EMAIL_PORT) || 587;
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port,
            secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });
    }
    return transporter;
};

const FROM_NAME = () => process.env.EMAIL_FROM_NAME || "AI Interview Service";

// HTTPS (port 443) email via Brevo: works where SMTP ports are blocked (Render free plan).
// EMAIL_FROM must be a sender you verified in Brevo.
const sendViaBrevo = async ({ to, subject, html }) => {
    const res = await fetch(process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: FROM_NAME(), email: process.env.EMAIL_FROM }, to: [{ email: to }], subject, htmlContent: html }),
        signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
    console.log("EMAIL SENT via Brevo to", to);
};

// Throws ApiError(500) if sending fails. When SMTP is not configured (local dev) it logs the email instead of sending.
const sendEmail = async ({ to, subject, html, devNote }) => {
    if (!emailConfigured()) {
        console.log(`\n[EMAIL not configured: dev mode] To: ${to} | Subject: ${subject}${devNote ? ` | ${devNote}` : ""}\n`);
        return;
    }
    try {
        if (brevoConfigured()) return await sendViaBrevo({ to, subject, html });
        const info = await getTransporter().sendMail({
            from: `"${FROM_NAME()}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("EMAIL SENT:", info.messageId);
    } catch (error) {
        console.error("Email error:", error.message);
        throw new ApiError(500, "Failed to send email");
    }
};

// For non-critical emails (welcome): a failure is logged but never fails the request.
export const sendEmailSafe = async (options) => {
    try {
        await sendEmail(options);
    } catch {
        /* already logged */
    }
};

export default sendEmail;
