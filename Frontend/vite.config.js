import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server forwards /api to the backend, so the browser sees ONE origin:
// cookies just work and no CORS setup is needed. Change the target if your backend runs elsewhere.
const backend = process.env.BACKEND_URL || "http://localhost:5000";
const proxy = { "/api": { target: backend, changeOrigin: true }, "/health": { target: backend, changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 5173, proxy },
});
