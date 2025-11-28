// src/services/articleCategoriesService.js
import { api } from "../lib/api";

export const articleCategoriesService = {
  async list(params = {}) {
    const r = await api.get("/article-categories", { params });
    // Laravel paginator: { data: [...], meta, links }
    return r.data;
  },

  async create(payload) {
    const r = await api.post("/article-categories", payload);
    // Devolvemos el objeto tal cual (el controller retorna el modelo plano)
    return r.data;
  },

  async update(id, payload) {
    const r = await api.put(`/article-categories/${encodeURIComponent(id)}`, payload);
    return r.data;
  },

  async remove(id) {
    const r = await api.delete(`/article-categories/${encodeURIComponent(id)}`);
    return r.data;
  },
};

export default articleCategoriesService;
