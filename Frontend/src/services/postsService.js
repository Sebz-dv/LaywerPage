// src/services/postsService.js
import { api } from "../lib/api";

const apiOrigin = (() => {
  try {
    return new URL(api.defaults.baseURL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

const V = "";
const BASE = `${V}/simple-posts`;

function toFormData(payload = {}) {
  const fd = new FormData();

  // 👇 SIEMPRE enviar title (obligatorio en create, necesario en update)
  if (payload.title != null) {
    fd.append("title", payload.title);
  }

  // 👇 SIEMPRE enviar info, text si existen (aunque sea vacío)
  if (payload.info != null) fd.append("info", payload.info);
  if (payload.text != null) fd.append("text", payload.text);

  // Author
  if (payload.author) {
    const a = payload.author;
    if (typeof a === "string") {
      fd.append("author[name]", a);
    } else if (a && typeof a === "object") {
      if (a.id != null) fd.append("author[id]", String(a.id));
      if (a.name != null) fd.append("author[name]", String(a.name));
      if (a.slug != null) fd.append("author[slug]", String(a.slug));
      if (a.avatar_url != null)
        fd.append("author[avatar_url]", String(a.avatar_url));
    }
  }

  // Links
  if (Array.isArray(payload.links)) {
    payload.links.forEach((l, i) => {
      if (!l) return;
      if (l.label != null) fd.append(`links[${i}][label]`, String(l.label));
      if (l.url != null) fd.append(`links[${i}][url]`, String(l.url));
    });
  }

  // Comments
  if (Array.isArray(payload.comments)) {
    payload.comments.forEach((c, i) => {
      if (!c) return;
      if (c.user != null) fd.append(`comments[${i}][user]`, String(c.user));
      if (c.body != null) fd.append(`comments[${i}][body]`, String(c.body));
      if (c.created_at != null)
        fd.append(`comments[${i}][created_at]`, String(c.created_at));
      if (c.imageUrl != null)
        fd.append(`comments[${i}][imageUrl]`, String(c.imageUrl));
    });
  }

  // File
  if (payload.file instanceof File || payload.file instanceof Blob) {
    fd.append("file", payload.file, payload.file.name || "upload.bin");
  }

  return fd;
}

function normalize(post) {
  if (!post) return null;
  const data = post.data ?? {};
  const attachments = Array.isArray(data.attachments)
    ? data.attachments.map((a) => ({
        ...a,
        url: a?.url
          ? a.url
          : a?.path
          ? `${apiOrigin}/storage/${String(a.path).replace(/^\/+/, "")}`
          : undefined,
      }))
    : [];
  return {
    id: post.id,
    author_id: post.author_id ?? null,
    author: data.author ?? null,
    title: post.title ?? "",
    info: data.info ?? null,
    text: data.text ?? null,
    links: data.links ?? [],
    comments: data.comments ?? [],
    attachments,
    created_at: post.created_at ?? null,
    updated_at: post.updated_at ?? null,
    raw: post,
  };
}

export const postsService = {
  async list() {
    const { data } = await api.get(`${BASE}`);
    return Array.isArray(data) ? data.map(normalize) : [];
  },

  async get(id) {
    const { data } = await api.get(`${BASE}/${id}`);
    return normalize(data);
  },

  async create(payload) {
    const fd = toFormData(payload);
    const { data } = await api.post(BASE, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalize(data);
  },

  // src/services/postsService.js
  async update(id, payload) {
    const fd = toFormData(payload);
    fd.append("_method", "PUT"); // 👈 override para Laravel

    // No fuerces Content-Type; deja que el navegador ponga el boundary correcto
    const { data } = await api.post(`${BASE}/${id}`, fd);
    console.log(data);
    return normalize(data);
  },

  async upsert(payload) {
    if (payload?.id != null) {
      const { id, ...rest } = payload;
      return this.update(id, rest);
    }
    return this.create(payload);
  },

  async addLink(id, link) {
    const current = await this.get(id);
    const links = [...(current.links || []), link];
    return this.update(id, {
      title: current.title,
      info: current.info,
      text: current.text,
      links,
      comments: current.comments,
    });
  },

  async addComment(id, comment) {
    const current = await this.get(id);
    const comments = [
      ...(current.comments || []),
      {
        ...comment,
        created_at: comment.created_at ?? new Date().toISOString(),
      },
    ];
    return this.update(id, {
      title: current.title,
      info: current.info,
      text: current.text,
      links: current.links,
      comments,
    });
  },

  async attachFile(id, file) {
    const current = await this.get(id);
    return this.update(id, {
      title: current.title,
      info: current.info,
      text: current.text,
      links: current.links,
      comments: current.comments,
      file,
    });
  },
};

export default postsService;
