import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@app": "/src/app",
      "@pages": "/src/pages",
      "@shared": "/src/shared",
      "@modules": "/src/modules",
    },
  },
});
