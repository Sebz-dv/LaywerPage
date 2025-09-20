// src/services/teamProfileService.js
import { api } from "../lib/api";

export const teamProfileService = {
  async get(slug, { signal } = {}) {
    const res = await api.get(`/team/${encodeURIComponent(slug)}/profile`, { signal });
    return res.data; // { data: profile | null }
  },
  async save(slug, payload, { signal } = {}) {
    // upsert
    const res = await api.post(`/team/${encodeURIComponent(slug)}/profile`, payload, { signal });
    return res.data; // { data: profile }
  },
  async remove(slug, { signal } = {}) {
    const res = await api.delete(`/team/${encodeURIComponent(slug)}/profile`, { signal });
    return res.data; // { ok: true }
  },
};
