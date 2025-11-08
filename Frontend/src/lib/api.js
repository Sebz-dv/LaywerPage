// src/lib/api.js
import axios from "axios";

/**
 * Resuelve la baseURL del backend a partir de variables de entorno
 * y pequeños “trucos” de entorno. NUNCA cae a localhost.
 *
 * Prioridad:
 * 1) import.meta.env.VITE_API_BASE_URL
 * 2) <meta name="api-base-url" content="https://.../api"> (opcional)
 * 3) window.location.origin + "/api"  (si estás sirviendo el front desde el mismo dominio del back)
 */
function resolveBaseURL() {
  const envUrl = import.meta.env?.VITE_API_BASE_URL?.trim();
  if (envUrl) return normalizeApiBase(envUrl);

  const meta = document.querySelector('meta[name="api-base-url"]');
  const metaUrl = meta?.getAttribute("content")?.trim();
  if (metaUrl) return normalizeApiBase(metaUrl);

  // Fallback seguro: mismo origen + /api (útil si proxy o mismo host)
  const sameOrigin = `${window.location.origin}/api`;
  return normalizeApiBase(sameOrigin);
}

/**
 * Normaliza la base /api quitando barras duplicadas y asegurando que termine en /api
 * Ej: https://back.foo.com -> https://back.foo.com/api
 *     https://back.foo.com/api/ -> https://back.foo.com/api
 */
function normalizeApiBase(url) {
  try {
    const u = new URL(url);
    // Normaliza pathname para que termine exactamente en /api
    let path = u.pathname.replace(/\/+$/, ""); // sin barra final
    if (!/\/api$/i.test(path)) {
      path = `${path}/api`.replace(/\/+/g, "/");
    }
    u.pathname = path;
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    // Si algo raro pasa, devolvemos tal cual (axios fallará visiblemente)
    return url;
  }
}

const BASE_URL = resolveBaseURL();

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: String(import.meta.env?.VITE_USE_CREDENTIALS).toLowerCase() === "true",
});

console.info("[api] baseURL =", api.defaults.baseURL);

let isRefreshing = false;
let pendingQueue = [];

/**
 * Interceptor de respuesta con lógica de refresh de token
 * (solo intenta refresh cuando realmente el backend indicó expiración).
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = (original.url || "").toString();
    const msg = (error.response?.data?.message || "").toLowerCase();

    const isAuthEndpoint =
      url.includes("/refresh") || url.includes("/login") || url.includes("/register");

    const looksExpired = msg.includes("expired") || msg.includes("token has expired");

    if (status === 401 && !original.__isRetryRequest && !isAuthEndpoint && looksExpired) {
      if (isRefreshing) {
        await new Promise((resolve) => pendingQueue.push(resolve));
      } else {
        try {
          isRefreshing = true;
          await api.post("/refresh");
        } finally {
          isRefreshing = false;
          pendingQueue.forEach((fn) => fn());
          pendingQueue = [];
        }
      }
      original.__isRetryRequest = true;
      return api.request(original);
    }

    throw error;
  }
);
