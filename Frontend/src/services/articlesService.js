import { api } from "../lib/api";

const apiOrigin = (() => {
  try {
    return new URL(api.defaults.baseURL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

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

const ensureNumericId = (id) => {
  const s = String(id ?? "").trim();
  if (!/^[0-9]+$/.test(s)) {
    throw new Error(`Article ID inválido: "${id}". Se requiere un número.`);
  }
  return s;
};

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

  // ✅ SOLO por ID (endpoint público: GET /articles/{id})
  async get(id) {
    const safeId = ensureNumericId(id);
    const r = await api.get(`/articles/${encodeURIComponent(safeId)}`);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async create(payload) {
    const fd = toFormData(payload);
    const r = await api.post("/articles", fd);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  // ✅ SOLO por ID
  async update(id, payload) {
    const safeId = ensureNumericId(id);
    const fd = toFormData(payload);
    const r = await api.post(`/articles/${encodeURIComponent(safeId)}`, fd);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async remove(id) {
    const safeId = ensureNumericId(id);
    const r = await api.delete(`/articles/${encodeURIComponent(safeId)}`);
    return r.data;
  },

  async togglePublish(id) {
    const safeId = ensureNumericId(id);
    const r = await api.post(`/articles/${encodeURIComponent(safeId)}/toggle-publish`);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async toggleFeatured(id) {
    const safeId = ensureNumericId(id);
    const r = await api.post(`/articles/${encodeURIComponent(safeId)}/toggle-featured`);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },
};
