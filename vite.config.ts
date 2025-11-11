import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy /api requests to the backend during development to avoid CORS issues.
    // Adjust the target to your backend URL if different.
    proxy: {
      // forward any request starting with /api to the backend at 127.0.0.1:8000
      // e.g. fetch('/api/accounts/login/') -> http://127.0.0.1:8000/api/accounts/login/
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        // no path rewrite needed since we're proxying /api directly
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
