// src/services/articlesService.js
import { api } from "../lib/api";

/* ================== Utils de baseURL ================== */
const apiOrigin = (() => {
  try {
    return new URL(api.defaults.baseURL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

/** Normaliza URLs de Storage del backend para que usen el mismo origin del API */
export const normalizeFromApiOrigin = (pathOrUrl) => {
  if (!pathOrUrl) return pathOrUrl;
  try {
    // Si no es http(s), resuélvelo contra el origin del API
    if (!/^https?:\/\//i.test(pathOrUrl)) {
      return new URL(pathOrUrl, apiOrigin).href;
    }
    // Si es http(s), fuerza scheme/host/port del API
    const u = new URL(pathOrUrl);
    const a = new URL(apiOrigin);
    u.protocol = a.protocol;
    u.host = a.host;
    return u.href;
  } catch {
    return pathOrUrl;
  }
};

/* ================== Normalización de Article ================== */
const normalizeArticle = (a) => {
  if (!a) return a;
  return {
    ...a,
    cover_url: a.cover_url ? normalizeFromApiOrigin(a.cover_url) : a.cover_url,
    pdf_url: a.pdf_url ? normalizeFromApiOrigin(a.pdf_url) : a.pdf_url,
    // external_url: dejar tal cual (puede ser dominio externo)
  };
};

/* ================== FormData helper ================== */
function toFormData(payload = {}) {
  const fd = new FormData();

  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;

    // meta: objeto -> string JSON
    if (k === "meta" && typeof v === "object" && !(v instanceof File)) {
      fd.append("meta", JSON.stringify(v));
      continue;
    }

    // archivos conocidos
    if (k === "cover" && v instanceof File) {
      fd.append("cover", v);
      continue;
    }
    if (k === "pdf" && v instanceof File) {
      fd.append("pdf", v);
      continue;
    }

    // booleans como "true"/"false" (coincide con prepareForValidation)
    if (typeof v === "boolean") {
      fd.append(k, v ? "true" : "false");
      continue;
    }

    // arrays simples (keywords, etc.)
    if (Array.isArray(v)) {
      // Backend espera array JSON (meta.keywords, etc.)
      fd.append(k, JSON.stringify(v));
      // Si un día quieres campos repetidos tipo name[], descomenta:
      // v.forEach((item) => fd.append(`${k}[]`, item));
      continue;
    }

    fd.append(k, v);
  }

  return fd;
}

/* ================== Validación ID numérico ================== */
const ensureNumericId = (id) => {
  const s = String(id ?? "").trim();
  if (!/^[0-9]+$/.test(s)) {
    throw new Error(`Article ID inválido: "${id}". Se requiere un número.`);
  }
  return s;
};

/* ================== Servicio ================== */
export const articlesService = {
  async list(params = {}) {
    // Puedes pasar filtros: { search, category_id, category, featured, published_only, sort, per_page }
    const r = await api.get("/articles", { params });
    // Paginado Laravel Resource: { data, links, meta }
    if (Array.isArray(r.data?.data)) {
      r.data.data = r.data.data.map(normalizeArticle);
    } else if (Array.isArray(r.data)) {
      // Por si algún endpoint retorna arreglo pelado
      r.data = r.data.map(normalizeArticle);
    }
    return r.data;
  },

  /** GET /articles/{id}?with_body=true|false (por defecto true en tu controller) */
  async get(id, { withBody } = {}) {
    const safeId = ensureNumericId(id);
    const r = await api.get(`/articles/${encodeURIComponent(safeId)}`, {
      params:
        typeof withBody === "boolean" ? { with_body: withBody } : undefined,
    });
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  /** POST /articles (multipart/form-data) */
  async create(payload) {
    // 👇 Si ya viene FormData desde el formulario, lo respetamos
    const body = payload instanceof FormData ? payload : toFormData(payload);

    const r = await api.post("/articles", body);
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  /**
   * PUT /articles/{id} (usando override para simplificar con FormData)
   */
  async update(id, payload) {
    const safeId = ensureNumericId(id);
    const body = payload instanceof FormData ? payload : toFormData(payload);

    // 👇 sin _method
    const r = await api.post(`/articles/${encodeURIComponent(safeId)}`, body);
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
    const r = await api.post(
      `/articles/${encodeURIComponent(safeId)}/toggle-publish`
    );
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  async toggleFeatured(id) {
    const safeId = ensureNumericId(id);
    const r = await api.post(
      `/articles/${encodeURIComponent(safeId)}/toggle-featured`
    );
    const data = r.data?.data ?? r.data;
    return normalizeArticle(data);
  },

  /** Helper útil si solo quieres la URL absoluta del PDF para abrir/descargar */
  pdfUrl(articleOrId) {
    if (typeof articleOrId === "object" && articleOrId !== null) {
      return articleOrId.pdf_url
        ? normalizeFromApiOrigin(articleOrId.pdf_url)
        : null;
    }
    // Si solo tienes el path crudo
    return normalizeFromApiOrigin(articleOrId);
  },
};
