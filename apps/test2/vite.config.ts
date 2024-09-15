import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://greysmm.github.io/test2/',
  plugins: [react()],
  build: {
    outDir: '../../dist/test2',
    emptyOutDir: false, 
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
