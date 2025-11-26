// src/services/mediaService.js
import { api } from "../lib/api";

export const mediaService = {
  async getByKey(key) {
    const res = await api.get(`/media-slots/${key}`);
    return res.data; // { key, url, alt }
  },

  async uploadByKey(key, file, alt) {
    const formData = new FormData();
    formData.append("image", file);
    if (alt && alt.trim()) {
      formData.append("alt", alt.trim());
    }

    const res = await api.post(`/media-slots/${key}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // { key, url, alt }
  },
};
