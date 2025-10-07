// src/services/teamService.js
import { api } from "../lib/api";

// Convierte payload plano a FormData (soporta File)
const toFormData = (obj = {}) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    // Si algún campo viene como objeto/array (sin File), lo mandamos como JSON
    if (typeof v === "object" && !(v instanceof File)) {
      fd.append(k, JSON.stringify(v));
    } else {
      fd.append(k, v);
    }
  }
  return fd;
};

export const teamService = {
  // Búsqueda avanzada (con filtros). Responde lo que dé tu API (idealmente {data, meta})
  async search({
    tab,
    nombre,
    cargo,
    area,
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
      ...(area ? { area } : {}),
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

  // Obtiene por id o slug (según soporte del backend)
  async get(idOrSlug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(idOrSlug)}`, { signal });
    return res.data;
  },

  // (Opcional) explícito por slug si lo prefieres
  async getBySlug(slug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(slug)}`, { signal });
    return res.data;
  },

  // Crear miembro (payload puede incluir { foto: File })
  async create(payload) {
    const fd = toFormData(payload);
    const res = await api.post("/team", fd); // no seteés Content-Type; el browser lo hace
    return res.data;
  },

  // Actualizar miembro (acepta id o slug, usando _method=PATCH para multipart)
  async update(idOrSlug, payload) {
    const fd = toFormData(payload);
    const res = await api.post(`/team/${encodeURIComponent(idOrSlug)}`, fd, {
      params: { _method: "PATCH" },
    });
    return res.data;
  },

  // Borrar miembro (acepta id o slug)
  async remove(idOrSlug) {
    await api.delete(`/team/${encodeURIComponent(idOrSlug)}`);
    return true;
  },
};
