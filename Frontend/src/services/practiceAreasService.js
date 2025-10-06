// src/services/practiceAreasService.js
import { api } from "../lib/api"; // baseURL: http://localhost:8000/api

export const practiceAreasService = {
  list,
  get,
  create,
  update,
  destroy: remove,
  toggle,
};

// src/services/practiceAreasService.js
function toPayload(payload) {
  const hasFile = payload?.iconFile instanceof File;
  if (!hasFile) return payload;

  const fd = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (k === "iconFile") continue;
    if (v === undefined || v === null) continue;

    if (Array.isArray(v)) {
      v.forEach((x) => fd.append(`${k}[]`, x));
    } else if (typeof v === "boolean") {
      fd.append(k, v ? "1" : "0");            // 👈 booleans como 1/0
    } else {
      fd.append(k, v);
    }
  }
  fd.append("icon", payload.iconFile);         // campo archivo
  return fd;
}


async function list(params = {}) {
  const { data } = await api.get("/practice-areas", { params });
  return data; // { data, meta, links }
}

async function get(idOrSlug) {
  const { data } = await api.get(`/practice-areas/${idOrSlug}`);
  return data;
}

async function create(payload) {
  const body = toPayload(payload);
  const headers = body instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
  const { data } = await api.post("/practice-areas", body, { headers });
  return data;
}

async function update(id, payload) {
  const body = toPayload(payload);
  const headers = body instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined;
  const { data } = await api.put(`/practice-areas/${id}`, body, { headers });
  return data;
}

async function remove(id) {
  const { data } = await api.delete(`/practice-areas/${id}`);
  return data;
}

async function toggle(id, field = "active") {
  const { data } = await api.post(`/practice-areas/${id}/toggle`, null, { params: { field } });
  return data;
}
