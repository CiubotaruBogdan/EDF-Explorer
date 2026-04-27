import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/**
 * Production Vite config.
 *
 * Build + deploy:
 *   Run deploy.ps1 from the project root — it builds, syncs assets,
 *   and patches index.html automatically.
 *
 * Manual build only:
 *   cd app
 *   $env:PUBLIC_BASE = "/edf-explorer/"
 *   .\node_modules\.bin\vite.exe build --config vite.config.prod.ts
 */
const PUBLIC_BASE = process.env.PUBLIC_BASE ?? "/";

export default defineConfig({
  base: PUBLIC_BASE,
  plugins: [react({ jsxRuntime: "automatic" }), tailwindcss()],
  mode: "production",
  esbuild: { jsxDev: false },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: import.meta.dirname,
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "wouter"],
          echarts: ["echarts", "echarts-for-react"],
          search: ["minisearch"],
        },
      },
    },
  },
});
