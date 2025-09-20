import { api } from "../lib/api";

const BASE = "info-blocks";

export const infoBlocksService = {
  async list({ onlyPublic = false } = {}) {
    const { data } = await api.get(`${BASE}`, {
      params: onlyPublic ? { public: 1 } : {},
    });
    return Array.isArray(data) ? data : [];
  },
  async create(payload) {
    const { data } = await api.post(BASE, payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`${BASE}/${id}`);
    return data;
  },
  async reorder(ids) {
    const { data } = await api.patch(`${BASE}/reorder`, { ids });
    return data;
  },
};
