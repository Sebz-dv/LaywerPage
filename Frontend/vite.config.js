import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Lee .env, .env.development, .env.production, etc.
  const env = loadEnv(mode, process.cwd(), "");
  // Si no defines nada, por defecto raíz "/"
  const base = env.VITE_BASE_URL?.trim() || "/";

  return {
    base,                     // <- MUY IMPORTANTE para rutas de assets
    plugins: [react(), tailwindcss()],
    // (Opcional) Proxy en dev para evitar CORS con tu backend Laravel
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_ORIGIN || "http://localhost:8000",
          changeOrigin: true,
          // si tu backend no está bajo /api, ajusta el rewrite
          // rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    // (Opcional) build limpio
    build: {
      sourcemap: mode !== "production",
      outDir: "dist",
      assetsDir: "assets",
    },
  };
});
