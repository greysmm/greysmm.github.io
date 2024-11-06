import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/evil_ai/",
  plugins: [react()],
  build: {
    outDir: "../../dist/evil_ai",
    emptyOutDir: false,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
