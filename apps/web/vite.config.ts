import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // API is called cross-origin (see `VITE_API_ORIGIN` + CORS on `apps/api`).
});
