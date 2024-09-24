import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { entry: resolve(__dirname, "src/main.ts"), formats: ["es"] },
    rollupOptions: { external: Object.keys((pkg as any).dependencies || {}) },
  },
  plugins: [react(), dts()],
});
