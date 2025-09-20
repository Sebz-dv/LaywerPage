// src/services/settingsService.js
import { api } from "../lib/api";

// util: valida URL simple
function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

// 🔧 sanitiza antes de enviar
function sanitizeSettings(payload) {
  const out = { ...payload };

  // normaliza strings
  ["site_name", "email", "phone", "address"].forEach((k) => {
    if (out[k] != null) out[k] = String(out[k]).trim();
  });

  // filtra redes vacías y obliga url válida si viene
  out.social_links = (Array.isArray(out.social_links) ? out.social_links : [])
    .map((x) => ({
      platform: (x.platform ?? "").trim(),
      url: (x.url ?? "").trim(),
      handle: (x.handle ?? "").trim(),
    }))
    // queda el ítem solo si tiene platform+url válidos
    .filter((x) => x.platform && x.url && isValidUrl(x.url));

  // filtra bloques vacíos (sin título)
  out.footer_blocks = (
    Array.isArray(out.footer_blocks) ? out.footer_blocks : []
  )
    .map((b) => ({
      title: (b.title ?? "").trim(),
      html: (b.html ?? "").trim(),
    }))
    .filter((b) => b.title);

  return out;
}

export const settingsService = {
  get: () => api.get("/settings").then((r) => r.data),

  save: (raw) => {
    const s = sanitizeSettings(raw);
    const fd = new FormData();

    // archivo
    if (s.logo instanceof File) fd.append("logo", s.logo);

    // primitivos
    if (s.site_name) fd.append("site_name", s.site_name);
    if (s.email) fd.append("email", s.email);
    if (s.phone) fd.append("phone", s.phone);
    if (s.address) fd.append("address", s.address);

    // arrays “estilo form” (nada de JSON.stringify)
    (s.social_links || []).forEach((item, i) => {
      fd.append(`social_links[${i}][platform]`, item.platform);
      fd.append(`social_links[${i}][url]`, item.url);
      if (item.handle) fd.append(`social_links[${i}][handle]`, item.handle);
    });

    (s.footer_blocks || []).forEach((b, i) => {
      fd.append(`footer_blocks[${i}][title]`, b.title);
      if (b.html) fd.append(`footer_blocks[${i}][html]`, b.html);
    });

    return api
      .post("/settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteLogo: () => api.delete("/settings/logo").then((r) => r.data),
};
