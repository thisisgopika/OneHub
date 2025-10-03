import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://onehub-backend-wqbd.onrender.com",   // backend API
      "/health": "https://onehub-backend-wqbd.onrender.com" // backend health check
    },
  },
});
