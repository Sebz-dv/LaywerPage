// src/services/practiceAreasService.js
import { api } from "../lib/api"; // baseURL: http://localhost:8000/api

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

    if (k === "icon_url" && hasIconFile) continue; // si hay archivo, ignora la URL

    let v = raw;
    if (typeof v === "boolean") v = v ? "1" : "0"; // boolean -> string aceptada por Laravel
    fd.append(k, v == null ? "" : v);
  }
  return fd;
}

export const practiceAreasService = {
  list(params = {}) {
    return api.get("/practice-areas", { params }).then((r) => r.data);
  },

  get(idOrSlug) {
    return api.get(`/practice-areas/${idOrSlug}`).then((r) => r.data);
  },

  create(payload) {
    const hasFile = isFileLike(payload.icon);
    if (hasFile) {
      const fd = toFormData(payload);
      return api
        .post("/practice-areas", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    }
    return api.post("/practice-areas", payload).then((r) => r.data);
  },

  update(id, payload) {
    const hasFile = isFileLike(payload.icon);
    if (hasFile) {
      const fd = toFormData(payload, "PUT");
      return api
        .post(`/practice-areas/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    }
    return api.put(`/practice-areas/${id}`, payload).then((r) => r.data);
  },

  remove(id) {
    return api.delete(`/practice-areas/${id}`).then((r) => r.data);
  },

  toggle(id, field) {
    return api
      .post(`/practice-areas/${id}/toggle`, { field })
      .then((r) => r.data);
  },
};
