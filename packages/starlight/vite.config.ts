import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/starlight/",
  plugins: [react()],
  build: {
    outDir: "../../dist/starlight",
    emptyOutDir: false,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
