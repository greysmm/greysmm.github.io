import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/test/',
  plugins: [react()],
  build: {
    outDir: '../../dist/test',
    emptyOutDir: false, 
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
