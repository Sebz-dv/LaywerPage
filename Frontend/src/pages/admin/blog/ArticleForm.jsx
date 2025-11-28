// src/pages/admin/blog/ArticleForm.jsx
import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { teamService } from "../../../services/teamService";
import { articleCategoriesService } from "../../../services/articleCategoriesService";
import { useParams, useNavigate } from "react-router-dom";

// util slugify consistente (sin dependencias)
function slugify(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}

export default function ArticleForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const coverRef = useRef(null);
  const pdfRef = useRef(null);
  const [ReactMarkdown, setReactMarkdown] = useState(null); // carga dinámica para preview

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]); // categorías existentes
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewOn, setPreviewOn] = useState(false);

  // estado para crear categorías rápidas
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);

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

    // Archivos / URLs
    cover: null, // File nuevo
    cover_url: null, // existente (backend)
    pdf: null, // File nuevo
    pdf_url: null, // existente (backend)
    external_url: "", // link externo opcional
  });

  // Preview de la portada NUEVA (si se selecciona archivo); si no, usamos cover_url existente
  const coverPreview = useMemo(() => {
    if (form.cover instanceof File) return URL.createObjectURL(form.cover);
    return form.cover_url || null;
  }, [form.cover, form.cover_url]);

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

  // Cargar categorías
  useEffect(() => {
    (async () => {
      try {
        const res = await articleCategoriesService.list({
          per_page: 100,
          sort: "name",
        });
        setCategories(res?.data || res || []);
      } catch (e) {
        console.warn("No se pudo cargar categorías:", e);
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
          // archivos/urls existentes
          cover: null,
          cover_url: a.cover_url ?? null,
          pdf: null,
          pdf_url: a.pdf_url ?? null,
          external_url: a.external_url ?? "",
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
    if (name === "pdf") {
      return setForm((f) => ({ ...f, pdf: files?.[0] ?? null }));
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
      setMetaField(
        "keywords",
        Array.from(new Set([...(form.meta.keywords || []), raw]))
      );
      e.currentTarget.value = "";
    }
  };

  const removeKeyword = (kw) => {
    setMetaField(
      "keywords",
      (form.meta.keywords || []).filter((k) => k !== kw)
    );
  };

  // Crear categoría rápida
  const handleCreateCategory = async () => {
    const name = catName.trim();
    if (!name) {
      alert("Escribe un nombre para la categoría.");
      return;
    }

    setCatSaving(true);
    try {
      const created = await articleCategoriesService.create({ name });
      const cat = created?.data ?? created;

      // agregar a la lista y seleccionar
      setCategories((prev) => [...prev, cat]);
      setForm((f) => ({
        ...f,
        article_category_id:
          cat?.id != null ? String(cat.id) : f.article_category_id,
      }));
      setCatName("");
    } catch (err) {
      console.error("Error creando categoría:", err);
      const apiMsg = err?.response?.data?.message;
      alert(apiMsg || err?.message || "No se pudo crear la categoría.");
    } finally {
      setCatSaving(false);
    }
  };

  // Normaliza payload y decide multipart si hay archivos
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
      external_url: form.external_url?.trim() || null,
      meta: form.meta || null,
    };

    const needMultipart =
      form.cover instanceof File || form.pdf instanceof File;

    if (needMultipart) {
      const fd = new FormData();
      Object.entries(base).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (k === "meta") fd.append("meta", JSON.stringify(v));
        else if (typeof v === "boolean") fd.append(k, v ? "true" : "false");
        else fd.append(k, String(v));
      });
      if (form.cover instanceof File) fd.append("cover", form.cover);
      if (form.pdf instanceof File) fd.append("pdf", form.pdf);
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
      const msg =
        data?.message ??
        (Object.entries(data?.errors ?? {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n") ||
          "No se pudo guardar.");
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetCover = () => {
    setForm((f) => ({ ...f, cover: null }));
    if (coverRef.current) coverRef.current.value = "";
  };
  const resetPdf = () => {
    setForm((f) => ({ ...f, pdf: null }));
    if (pdfRef.current) pdfRef.current.value = "";
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
              {/* Categoría como select + creación rápida */}
              <div className="space-y-1.5">
                <label className="block text-sm text-soft">Categoría</label>
                <select
                  className="input text-black"
                  name="article_category_id"
                  value={form.article_category_id}
                  onChange={onChange}
                >
                  <option value="">— Sin categoría —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name || cat.nombre || cat.title}
                    </option>
                  ))}
                </select>

                {/* Crear categoría rápida */}
                <div className="mt-2 flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Nueva categoría…"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCreateCategory}
                    disabled={catSaving}
                  >
                    {catSaving ? "Creando…" : "Crear"}
                  </button>
                </div>
                <p className="text-xs text-soft mt-1">
                  Escribe un nombre y pulsa{" "}
                  <span className="font-semibold">Crear</span> para añadir una
                  categoría nueva.
                </p>
              </div>

              {/* Autor */}
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
                      {t.nombre ||
                        t.name ||
                        `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim()}
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
                <label className="block text-sm text-soft">
                  SEO Descripción
                </label>
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
            <div className="flex flex-col gap-3">
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

              <div className="space-y-1.5">
                <label className="block text-sm text-soft">
                  Link externo (opcional)
                </label>
                <input
                  className="input"
                  name="external_url"
                  value={form.external_url}
                  onChange={onChange}
                  placeholder="https://sitio-externo.com/articulo"
                />
                {form.external_url?.trim() && (
                  <a
                    className="link text-sm"
                    href={form.external_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir link externo ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha (portada + PDF + preview) */}
        <div className="space-y-6">
          {/* PORTADA */}
          <div className="card card-pad space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-soft/80">
                  Portada
                </p>
              </div>

              {coverPreview && (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Imagen cargada
                </span>
              )}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              {/* Preview de portada */}
              <div className="w-full md:w-48">
                <div className="logo-box relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-500/40 bg-slate-900/40">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Portada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-soft">Sin imagen</span>
                  )}
                </div>
              </div>

              {/* Controles de archivo */}
              <div className="flex-1 space-y-3">
                <label className="inline-flex cursor-pointer flex-wrap items-center gap-2 text-[8px]">
                  <span className="btn btn-outline">Seleccionar imagen</span>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    name="cover"
                    className="sr-only"
                    onChange={onChange}
                  /> 
                </label>

                {(form.cover || form.cover_url) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {form.cover && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={resetCover}
                      >
                        Quitar archivo
                      </button>
                    )}

                    {form.cover_url && !form.cover && (
                      <a
                        className="btn btn-outline"
                        href={form.cover_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver imagen ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PDF OPCIONAL */}
          <div className="card card-pad space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-soft/80">
                  PDF (opcional)
                </p>
                <p className="text-xs text-soft mt-1">
                  Adjunta un documento extendido para descarga o lectura
                  detallada.
                </p>
              </div>

              {(form.pdf || form.pdf_url) && (
                <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
                  PDF disponible
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <label className="block text-xs text-soft">
                  <span className="mb-1 inline-block font-medium">
                    Seleccionar archivo PDF
                  </span>
                  <input
                    ref={pdfRef}
                    type="file"
                    accept="application/pdf"
                    name="pdf"
                    className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-600"
                    onChange={onChange}
                  />
                </label>

                <p className="text-[11px] text-soft">
                  Se aceptan archivos .pdf (máx 10MB).
                </p>

                {/* Acciones para PDF existente */}
                {form.pdf_url && !form.pdf && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      className="btn btn-outline"
                      href={form.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver PDF ↗
                    </a>
                    <a className="btn btn-outline" href={form.pdf_url} download>
                      Descargar
                    </a>
                  </div>
                )}

                {/* Quitar archivo nuevo seleccionado */}
                {form.pdf && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetPdf}
                  >
                    Quitar PDF
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW DEL ARTÍCULO */}
          {previewOn && (
            <div className="card card-pad space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold">
                  Preview del contenido
                </h3>
                <span className="text-[11px] text-soft">
                  Solo lectura · generado en tiempo real
                </span>
              </div>

              <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 p-3">
                <div className="prose prose-sm max-w-none prose-invert">
                  {ReactMarkdown ? (
                    <Suspense
                      fallback={
                        <p className="text-soft text-sm">Cargando preview…</p>
                      }
                    >
                      <ReactMarkdown>{form.body || "_(vacío)_"}</ReactMarkdown>
                    </Suspense>
                  ) : (
                    <p className="text-soft text-sm">Cargando preview…</p>
                  )}
                </div>
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
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={saving}
        >
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
