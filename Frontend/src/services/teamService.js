// src/services/teamService.js
import { api } from "../lib/api";

/** Detecta si hay que usar FormData (archivos) */
const mustUseFormData = (obj = {}) =>
  Object.values(obj).some((v) => v instanceof File || v instanceof Blob);

/** Convierte payload a FormData:
 *  - Arrays => clave[] por cada valor (incluye 'areas[]')
 *  - Objetos planos => JSON.stringify
 *  - Files/Blobs => tal cual
 */
const toFormData = (obj = {}) => {
  const fd = new FormData();

  const isPlainObject = (v) =>
    v &&
    typeof v === "object" &&
    !(v instanceof File) &&
    !(v instanceof Blob) &&
    !(v instanceof Date);

  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;

    if (Array.isArray(v)) {
      // Enviar arrays como k[] (Laravel-friendly). Ej: areas[]: "Tributario"
      v.forEach((item) => {
        if (item === undefined || item === null || item === "") return;
        fd.append(`${k}[]`, item);
      });
      continue;
    }

    if (isPlainObject(v)) {
      fd.append(k, JSON.stringify(v));
      continue;
    }

    // File/Blob/string/number/boolean
    fd.append(k, v);
  }

  return fd;
};

export const teamService = {
  // Búsqueda avanzada (con filtros). Responde {data, meta} según tu API.
  async search({
    tab,
    nombre,
    cargo,
    area,     // filtro simple por una sola área (string)
    ciudad,
    page = 1,
    perPage = 9,
    sort = "latest",
    signal,
  } = {}) {
    const params = {
      page,
      per_page: perPage,
      sort,
      ...(tab && tab !== "todos" ? { tab } : {}),
      ...(nombre ? { nombre } : {}),
      ...(cargo ? { cargo } : {}),
      ...(area ? { area } : {}),   // si migras a múltiples áreas, cámbialo a areas[]
      ...(ciudad ? { ciudad } : {}),
    };
    const res = await api.get("/team", { params, signal });
    return res.data;
  },

  // Listado simple (alias de index)
  async list(params = {}) {
    const res = await api.get("/team", { params });
    return res.data;
  },

  // Obtener por id/slug
  async get(idOrSlug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(idOrSlug)}`, { signal });
    return res.data;
  },

  async getBySlug(slug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(slug)}`, { signal });
    return res.data;
  },

  // Crear miembro
  async create(payload) {
    // Si no hay archivo, mandamos JSON puro (areas se mantiene como array nativo)
    if (!mustUseFormData(payload)) {
      const res = await api.post("/team", payload);
      return res.data;
    }
    // Con archivo => FormData (areas[] por elemento)
    const fd = toFormData(payload);
    const res = await api.post("/team", fd); // no setees Content-Type a mano
    return res.data;
  },

  // Actualizar miembro (PATCH con override)
  async update(idOrSlug, payload) {
    if (!mustUseFormData(payload)) {
      const res = await api.post(
        `/team/${encodeURIComponent(idOrSlug)}`,
        payload,
        { params: { _method: "PATCH" } }
      );
      return res.data;
    }
    const fd = toFormData(payload);
    const res = await api.post(
      `/team/${encodeURIComponent(idOrSlug)}`,
      fd,
      { params: { _method: "PATCH" } }
    );
    return res.data;
  },

  // Borrar miembro
  async remove(idOrSlug) {
    await api.delete(`/team/${encodeURIComponent(idOrSlug)}`);
    return true;
  },
};
