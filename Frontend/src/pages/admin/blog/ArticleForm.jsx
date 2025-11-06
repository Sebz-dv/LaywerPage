// src/pages/admin/blog/ArticleForm.jsx
import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { teamService } from "../../../services/teamService";
import { useParams, useNavigate } from "react-router-dom";

// util slugify consistente (sin dependencias)
function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}

export default function ArticleForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const fileRef = useRef(null);
  const [ReactMarkdown, setReactMarkdown] = useState(null); // carga dinámica para preview

  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewOn, setPreviewOn] = useState(false);

  const [form, setForm] = useState({
    article_category_id: "",
    author_id: "",
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    featured: false,
    is_published: false,
    meta: { title: "", description: "", keywords: [] },
    cover: null, // File
  });

  const coverPreview = useMemo(() => {
    if (form.cover instanceof File) return URL.createObjectURL(form.cover);
    return null;
  }, [form.cover]);

  // Cargar autores
  useEffect(() => {
    (async () => {
      try {
        const res = await teamService.list({ per_page: 1000, sort: "name" });
        setAuthors(res?.data || res || []);
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
      setError(null);
      try {
        const res = await svc.get(id);
        // ✅ Evita mezclar ?? con || sin paréntesis
        const a = (res?.data ?? res) || {};
        setForm((f) => ({
          ...f,
          article_category_id: a.category?.id ?? a.article_category_id ?? "",
          author_id: a.author?.id ?? a.author_id ?? "",
          title: a.title ?? "",
          slug: a.slug ?? "",
          excerpt: a.excerpt ?? "",
          body: a.body ?? "",
          featured: !!a.featured,
          is_published: !!a.is_published,
          meta: a.meta ?? { title: "", description: "", keywords: [] },
          cover: null,
        }));
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el artículo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Cargar react-markdown on demand para preview
  useEffect(() => {
    if (!previewOn || ReactMarkdown) return;
    (async () => {
      try {
        const mod = await import("react-markdown");
        setReactMarkdown(() => mod.default);
      } catch (e) {
        console.warn("Preview Markdown no disponible:", e);
      }
    })();
  }, [previewOn, ReactMarkdown]);

  // Helpers de cambio
  const setMetaField = (key, value) =>
    setForm((f) => ({ ...f, meta: { ...f.meta, [key]: value } }));

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "cover") {
      return setForm((f) => ({ ...f, cover: files?.[0] ?? null }));
    }

    if (name === "title") {
      // autogenera slug si está vacío
      const next = { ...form, title: value };
      if (!form.slug?.trim()) next.slug = slugify(value);
      return setForm(next);
    }

    if (name === "slug") {
      return setForm((f) => ({ ...f, slug: slugify(value) }));
    }

    if (name.startsWith("meta.")) {
      const key = name.split(".")[1];
      if (key === "keywords") {
        const kws = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return setMetaField("keywords", kws);
      }
      return setMetaField(key, value);
    }

    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Keywords chips con Enter/Comma
  const onKeywordsKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const raw = e.currentTarget.value.trim().replace(/,$/, "");
      if (!raw) return;
      setMetaField("keywords", Array.from(new Set([...(form.meta.keywords || []), raw])));
      e.currentTarget.value = "";
    }
  };
  const removeKeyword = (kw) => {
    setMetaField(
      "keywords",
      (form.meta.keywords || []).filter((k) => k !== kw)
    );
  };

  // Normaliza payload y decide multipart si hay cover
  const buildPayload = () => {
    const base = {
      article_category_id: form.article_category_id || null,
      author_id: form.author_id || null,
      title: form.title?.trim(),
      slug: form.slug?.trim() || slugify(form.title),
      excerpt: form.excerpt || null,
      body: form.body || null,
      featured: !!form.featured,
      is_published: !!form.is_published,
      meta: form.meta || null,
    };

    if (form.cover instanceof File) {
      const fd = new FormData();
      Object.entries(base).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (k === "meta") fd.append("meta", JSON.stringify(v));
        else fd.append(k, String(v));
      });
      fd.append("cover", form.cover);
      return fd; // multipart
    }
    return base; // JSON
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return alert("El título es obligatorio.");
    if (!form.slug?.trim()) setForm((f) => ({ ...f, slug: slugify(f.title) }));

    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      if (id) await svc.update(id, payload);
      else await svc.create(payload);
      nav("/dash/articles");
    } catch (err) {
      const data = err?.response?.data;
      console.log("422 details:", data);
      // ✅ Evita mezclar ?? con || sin paréntesis
      const msg =
        data?.message ??
        ((Object.entries(data?.errors ?? {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n")) || "No se pudo guardar.");
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const ResetCover = () => {
    setForm((f) => ({ ...f, cover: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold font-display">
          {id ? "Editar artículo" : "Nuevo artículo"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => nav(-1)}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={previewOn ? "btn btn-secondary" : "btn btn-outline"}
            onClick={() => setPreviewOn((v) => !v)}
          >
            {previewOn ? "Ocultar preview" : "Ver preview"}
          </button>
          <button
            className="btn btn-accent"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="card card-pad border border-accent/40">
          <p className="text-sm text-soft">⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-5">
        {/* Columna izquierda (form principal) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card card-pad space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">Título</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  placeholder="Título del artículo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">Slug</label>
                <input
                  className="input"
                  name="slug"
                  value={form.slug}
                  onChange={onChange}
                  placeholder="autogenerado si lo dejas vacío"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">Categoría (ID)</label>
                <input
                  className="input"
                  name="article_category_id"
                  value={form.article_category_id}
                  onChange={onChange}
                  placeholder="Ej. 1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-soft">Autor</label>
                <select
                  className="input text-black"
                  name="author_id"
                  value={form.author_id}
                  onChange={onChange}
                >
                  <option value="">— Sin autor —</option>
                  {authors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-soft">Extracto</label>
              <textarea
                className="input"
                rows={3}
                name="excerpt"
                value={form.excerpt}
                onChange={onChange}
                placeholder="Resumen corto (máx 500)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Contenido (Markdown/HTML)
              </label>
              <textarea
                className="input"
                rows={previewOn ? 12 : 16}
                name="body"
                value={form.body}
                onChange={onChange}
                placeholder="Escribe aquí tu contenido…"
              />
            </div>
          </div>

          <div className="card card-pad space-y-4">
            <h2 className="font-semibold font-display text-lg">SEO</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">SEO Título</label>
                <input
                  className="input"
                  name="meta.title"
                  value={form.meta.title}
                  onChange={onChange}
                  placeholder="Title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">SEO Descripción</label>
                <input
                  className="input"
                  name="meta.description"
                  value={form.meta.description}
                  onChange={onChange}
                  placeholder="Description"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">
                  SEO Keywords (Enter o coma)
                </label>
                <input
                  className="input"
                  onKeyDown={onKeywordsKeyDown}
                  placeholder="ej. derecho, educación, Colombia"
                />
                <div className="flex flex-wrap gap-2 mt-1">
                  {(form.meta.keywords || []).map((kw) => (
                    <span key={kw} className="badge badge-accent">
                      {kw}
                      <button
                        type="button"
                        className="ml-2 text-xs opacity-80 hover:opacity-100"
                        onClick={() => removeKeyword(kw)}
                        aria-label={`Eliminar ${kw}`}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={onChange}
                />
                <span>Destacado</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={form.is_published}
                  onChange={onChange}
                />
                <span>Publicado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Columna derecha (portada + preview) */}
        <div className="space-y-5">
          <div className="card card-pad space-y-3">
            <label className="block text-sm text-soft">Portada</label>
            <div className="flex items-start gap-4">
              <div className="logo-box">
                {coverPreview ? (
                  // preview del archivo nuevo
                  <img
                    src={coverPreview}
                    alt="Preview portada"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-soft text-sm">Sin imagen</span>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  name="cover"
                  className="block"
                  onChange={onChange}
                />
                {form.cover && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={ResetCover}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          {previewOn && (
            <div className="card card-pad">
              <h3 className="font-semibold mb-2 font-display">Preview</h3>
              <div className="prose prose-sm max-w-none">
                {ReactMarkdown ? (
                  <Suspense fallback={<p className="text-soft">Cargando preview…</p>}>
                    <ReactMarkdown>{form.body || "_(vacío)_"}</ReactMarkdown>
                  </Suspense>
                ) : (
                  <p className="text-soft">Cargando preview…</p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => nav(-1)}
          disabled={saving}
        >
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-40 grid place-items-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10 card card-pad">
            <p className="text-soft">Cargando artículo…</p>
          </div>
        </div>
      )}
    </div>
  );
}
