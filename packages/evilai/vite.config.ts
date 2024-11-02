import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/evilai/",
  plugins: [react()],
  build: {
    outDir: "../../dist/evilai",
    emptyOutDir: false,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
