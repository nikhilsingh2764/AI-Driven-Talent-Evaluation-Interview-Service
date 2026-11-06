import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const target = env.VITE_PROXY_TARGET || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Proxying keeps the browser on ONE origin in development, so the API's HttpOnly cookies work
      // with the default SameSite=Lax and no CORS setup. "/api/docs" (Swagger UI) is proxied too.
      proxy: {
        "/api": { target, changeOrigin: false },
        "^/health$": { target, changeOrigin: false },
      },
    },
    build: {
      rollupOptions: {
        output: { manualChunks: { charts: ["recharts"], react: ["react", "react-dom", "react-router-dom"] } },
      },
    },
  };
});
