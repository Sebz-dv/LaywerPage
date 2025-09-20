// src/services/teamService.js
import { api } from "../lib/api";

const toFormData = (obj = {}) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, v);
  });
  return fd;
};

export const teamService = {
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

  async getBySlug(slug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(slug)}`, { signal });
    return res.data;
  },

  async create(payload) {
    const fd = toFormData(payload); // {nombre, ..., foto: File}
    const res = await api.post("/team", fd); // no seteés Content-Type; el browser lo hace
    return res.data;
  },

  async update(slug, payload) {
    const fd = toFormData(payload);
    // robusto para servers que no “aman” PATCH multipart:
    const res = await api.post(`/team/${encodeURIComponent(slug)}`, fd, {
      params: { _method: "PATCH" },
    });
    return res.data;
  },

  async remove(slug) {
    await api.delete(`/team/${encodeURIComponent(slug)}`);
    return true;
  },
};
