// src/pages/admin/ArticleForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { teamService } from "../../../services/teamService"; // 👈 nuevo
import { useParams, useNavigate } from "react-router-dom";

export default function ArticleForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    article_category_id: "",
    author_id: "",        // 👈 nuevo
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    featured: false,
    is_published: false,
    meta: { title: "", description: "", keywords: [] },
    cover: null,
  });
  const [authors, setAuthors] = useState([]); // 👈 lista de team_members
  const [loading, setLoading] = useState(false);

  // Cargar autores (público /team)
  useEffect(() => {
    (async () => {
      try {
        const res = await teamService.list({ per_page: 1000, sort: "name" });
        // asumiendo estructura tipo { data: [...] }
        setAuthors(res.data || res);
      } catch (e) {
        console.warn("No se pudo cargar autores:", e);
      }
    })();
  }, []);

  // Editar: cargar artículo
  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await svc.get(id);
        const a = res.data;
        setForm((f) => ({
          ...f,
          article_category_id: a.category?.id ?? "",
          author_id: a.author?.id ?? "",            // 👈 set de autor
          title: a.title ?? "",
          slug: a.slug ?? "",
          excerpt: a.excerpt ?? "",
          body: a.body ?? "",
          featured: !!a.featured,
          is_published: !!a.is_published,
          meta: a.meta ?? { title: "", description: "", keywords: [] },
          cover: null,
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "cover") {
      return setForm((f) => ({ ...f, cover: files?.[0] ?? null }));
    }
    if (name.startsWith("meta.")) {
      const key = name.split(".")[1];
      const v = key === "keywords"
        ? value.split(",").map((s) => s.trim()).filter(Boolean)
        : value;
      return setForm((f) => ({ ...f, meta: { ...f.meta, [key]: v } }));
    }
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        // normaliza strings vacíos a null para ids
        article_category_id: form.article_category_id || null,
        author_id: form.author_id || null,
      };
      if (id) await svc.update(id, payload);
      else await svc.create(payload);
      nav("/dash/articles");
    } catch (err) {
      const data = err?.response?.data;
      console.log("422 details:", data);
      alert(
        data?.message ??
          Object.entries(data?.errors ?? {})
            .map(([k, v]) => `${k}: ${v.join(", ")}`)
            .join("\n")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 max-w-4xl space-y-4">
      <h1 className="text-xl font-semibold">{id ? "Editar" : "Nuevo"} artículo</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm">Título</label>
          <input className="border rounded px-3 py-2 w-full" name="title" value={form.title} onChange={onChange} required/>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Slug (opcional)</label>
          <input className="border rounded px-3 py-2 w-full" name="slug" value={form.slug} onChange={onChange}/>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Categoría (id)</label>
          <input className="border rounded px-3 py-2 w-full" name="article_category_id" value={form.article_category_id} onChange={onChange} placeholder="(opcional)"/>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Autor</label>
          <select
            className="border rounded px-3 py-2 w-full"
            name="author_id"
            value={form.author_id}
            onChange={onChange}
          >
            <option value="">— Sin autor —</option>
            {authors.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Portada</label>
          <input ref={fileRef} type="file" accept="image/*" name="cover" onChange={onChange}/>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Extracto</label>
        <textarea className="border rounded px-3 py-2 w-full" rows={3} name="excerpt" value={form.excerpt} onChange={onChange}/>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Contenido (Markdown/HTML)</label>
        <textarea className="border rounded px-3 py-2 w-full" rows={10} name="body" value={form.body} onChange={onChange}/>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm">SEO Título</label>
          <input className="border rounded px-3 py-2 w-full" name="meta.title" value={form.meta.title} onChange={onChange}/>
        </div>
        <div className="space-y-2">
          <label className="block text-sm">SEO Descripción</label>
          <input className="border rounded px-3 py-2 w-full" name="meta.description" value={form.meta.description} onChange={onChange}/>
        </div>
        <div className="space-y-2">
          <label className="block text-sm">SEO Keywords (coma)</label>
          <input className="border rounded px-3 py-2 w-full" name="meta.keywords" value={(form.meta.keywords||[]).join(", ")} onChange={onChange}/>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="featured" checked={form.featured} onChange={onChange}/>
          <span>Destacado</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="is_published" checked={form.is_published} onChange={onChange}/>
          <span>Publicado</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" className="border px-4 py-2 rounded" onClick={()=>nav(-1)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
