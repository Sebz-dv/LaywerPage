// src/services/practiceAreasService.js
import { api } from "../lib/api"; // ✅ Usa baseURL configurado desde VITE_API_BASE_URL

function isFileLike(v) {
  return (
    (typeof File !== "undefined" && v instanceof File) ||
    (v && typeof v === "object" && v.name && v.size != null && v.type != null)
  );
}

function toFormData(payload, methodOverride = null) {
  const fd = new FormData();
  if (methodOverride) fd.append("_method", methodOverride);

  const hasIconFile = isFileLike(payload.icon);

  for (const [k, raw] of Object.entries(payload)) {
    if (raw === undefined) continue;

    if (k === "bullets") {
      fd.append("bullets", JSON.stringify(Array.isArray(raw) ? raw : []));
      continue;
    }
    if (k === "icon_url" && hasIconFile) continue;

    let v = raw;
    if (typeof v === "boolean") v = v ? "1" : "0";
    fd.append(k, v == null ? "" : v);
  }
  return fd;
}

export const practiceAreasService = {
  list(params = {}, config = {}) {
    return api.get("/practice-areas", { params, ...config }).then((r) => r.data);
  },

  get(idOrSlug, config = {}) {
    return api.get(`/practice-areas/${idOrSlug}`, { ...config }).then((r) => r.data);
  },

  create(payload, config = {}) {
    const hasFile = isFileLike(payload.icon);
    if (hasFile) {
      const fd = toFormData(payload);
      return api
        .post("/practice-areas", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          ...config,
        })
        .then((r) => r.data);
    }
    return api.post("/practice-areas", payload, { ...config }).then((r) => r.data);
  },

  update(id, payload, config = {}) {
    const hasFile = isFileLike(payload.icon);
    if (hasFile) {
      const fd = toFormData(payload, "PUT");
      return api
        .post(`/practice-areas/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          ...config,
        })
        .then((r) => r.data);
    }
    return api.put(`/practice-areas/${id}`, payload, { ...config }).then((r) => r.data);
  },

  remove(id, config = {}) {
    return api.delete(`/practice-areas/${id}`, { ...config }).then((r) => r.data);
  },

  toggle(id, field, config = {}) {
    return api.post(`/practice-areas/${id}/toggle`, { field }, { ...config }).then((r) => r.data);
  },
};