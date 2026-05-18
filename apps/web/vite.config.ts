import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  // API is called cross-origin (see `VITE_API_ORIGIN` + CORS on `apps/api`).
});
