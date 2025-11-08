// src/lib/origin.js
import { api } from "./api";

/**
 * Devuelve el ORIGIN del backend (proto + host [+ puerto si aplica])
 * a partir de api.defaults.baseURL. Ej:
 *   https://back.blancoramirezlegal.com/api -> https://back.blancoramirezlegal.com
 */
export function getBackendOrigin() {
  const base = api?.defaults?.baseURL || "";
  try {
    const u = new URL(base);
    return u.origin;
  } catch {
    // Sin origin confiable: devolvemos string vacío
    return "";
  }
}

/**
 * Une una ruta relativa a la baseURL /api (para endpoints).
 * - "/team" -> "https://back.../api/team"
 * - "team"  -> "https://back.../api/team"
 */
export function resolveApiUrl(path = "") {
  const base = api?.defaults?.baseURL || "";
  if (!base) return path;
  const clean = String(path || "").replace(/^\/+/, "");
  return `${base.replace(/\/+$/, "")}/${clean}`;
}

/**
 * Resuelve una URL de asset del backend:
 * - http(s)://... -> se respeta tal cual
 * - /storage/...  -> se antepone ORIGIN del back
 * - storage/...   -> se antepone ORIGIN del back + "/"
 * - ""/null/undefined -> ""
 *
 * Si no se puede determinar el origin del back, devuelve la cadena tal cual.
 */
export function resolveAssetUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;

  const origin = getBackendOrigin();
  if (!origin) return u; // devolvemos tal cual si no hay origin confiable

  if (u.startsWith("/")) return `${origin}${u}`;
  return `${origin}/${u.replace(/^\/+/, "")}`;
}
