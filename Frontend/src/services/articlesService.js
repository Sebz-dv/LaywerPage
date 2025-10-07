// src/services/articlesService.js
import { api } from "../lib/api"; // baseURL: http://localhost:8000/api

// Origin real del backend (http://localhost:8000)
const apiOrigin = (() => {
  try { return new URL(api.defaults.baseURL, window.location.origin).origin; }
  catch { return window.location.origin; }
})();

// Normaliza URL (relativa o absoluta con host incorrecto) al origin del API
const normalizeFromApiOrigin = (pathOrUrl) => {
  if (!pathOrUrl) return pathOrUrl;
  try {
    if (!/^https?:\/\//i.test(pathOrUrl)) {
      return new URL(pathOrUrl, apiOrigin).href;
    }
    const u = new URL(pathOrUrl);
    const a = new URL(apiOrigin);
    u.protocol = a.protocol;
    u.host = a.host;
    return u.href;
  } catch {
    return pathOrUrl;
  }
};

const normalizeArticle = (a) => {
  if (!a) return a;
  return {
    ...a,
    cover_url: a.cover_url ? normalizeFromApiOrigin(a.cover_url) : a.cover_url,
  };
};

function toFormData(payload = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    if (k === "meta" && typeof v === "object" && !(v instanceof File)) {
      fd.append("meta", JSON.stringify(v));
    } else if (k === "cover" && v instanceof File) {
      fd.append("cover", v);
    } else if (typeof v === "boolean") {
      fd.append(k, v ? "true" : "false");
    } else {
      fd.append(k, v);
    }
  }
  return fd;
}

export const articlesService = {
  async list(params = {}) {
    const r = await api.get("/articles", { params });
    if (Array.isArray(r.data?.data)) {
      r.data.data = r.data.data.map(normalizeArticle);
    } else if (Array.isArray(r.data)) {
      r.data = r.data.map(normalizeArticle);
    }
    return r.data;
  },

  // get inteligente: usa slug si NO es numérico, si es numérico usa id
  async get(idOrSlug) {
    const isNumeric = /^[0-9]+$/.test(String(idOrSlug));
    const url = isNumeric
      ? `/articles/id/${encodeURIComponent(idOrSlug)}`
      : `/articles/slug/${encodeURIComponent(idOrSlug)}`;
    const r = await api.get(url);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async create(payload) {
    const fd = toFormData(payload);
    const r = await api.post("/articles", fd); // NO setees Content-Type
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  // Update vía POST (tu ruta privada acepta POST /articles/{article})
  async update(idOrSlug, payload) {
    const fd = toFormData(payload);
    const r = await api.post(`/articles/${encodeURIComponent(idOrSlug)}`, fd);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async remove(idOrSlug) {
    const r = await api.delete(`/articles/${encodeURIComponent(idOrSlug)}`);
    return r.data;
  },

  async togglePublish(idOrSlug) {
    const r = await api.post(`/articles/${encodeURIComponent(idOrSlug)}/toggle-publish`);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async toggleFeatured(idOrSlug) {
    const r = await api.post(`/articles/${encodeURIComponent(idOrSlug)}/toggle-featured`);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },
};
