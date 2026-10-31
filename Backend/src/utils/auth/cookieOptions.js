import { env } from "../../config/env.js";

const base = () => ({
    httpOnly: true,
    secure: env.isProd || env.cookieSameSite === "none",
    sameSite: env.cookieSameSite,
});

export const accessTokenOptions = { ...base(), maxAge: 15 * 60 * 1000 };
export const refreshTokenOptions = { ...base(), maxAge: env.refreshTtlMs };

// clearCookie must use the same options (without maxAge) or some browsers keep the cookie.
export const clearOptions = base();
