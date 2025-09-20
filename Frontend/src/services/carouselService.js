// src/services/carouselService.js
import { api } from "../lib/api";

const BASE = "carrusel";

export const carouselService = {
  async list() {
    const { data } = await api.get(BASE);
    return Array.isArray(data) ? data : [];
  },
  async upload(file) {
    if (!file) throw new Error("No file provided");
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post(BASE, fd);
    return data;
  },
  async removeByName(filename) {
    if (!filename) throw new Error("Filename required");
    const { data } = await api.delete(
      `${BASE}/${encodeURIComponent(filename)}`
    );
    return data;
  },
  async removeBySrc(src) {
    const name = filenameFromSrc(src);
    return this.removeByName(name);
  },
  downloadUrlFromSrc(src, backendOrigin) {
    const name = filenameFromSrc(src);
    return `${backendOrigin}/api/${BASE}/${encodeURIComponent(name)}/download`;
  },
};

export function filenameFromSrc(src) {
  try {
    const url = new URL(src, window.location.origin);
    return decodeURIComponent(url.pathname.split("/").pop() || "");
  } catch {
    const parts = String(src || "").split("/");
    return decodeURIComponent(parts.pop() || "");
  }
}
