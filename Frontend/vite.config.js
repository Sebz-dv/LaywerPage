/* global process */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = (env.VITE_BASE_URL || "/").trim() || "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_ORIGIN || "http://localhost:8000",
          changeOrigin: true,
          // rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      sourcemap: mode !== "production",
      outDir: "dist",
      assetsDir: "assets",
    },
  };
});
