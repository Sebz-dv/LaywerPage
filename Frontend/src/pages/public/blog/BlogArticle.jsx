// src/pages/blog/BlogArticle.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { articlesService as svc } from "../../../services/articlesService"; // ⬅️ ajusta si tu path difiere
import { motion } from "framer-motion";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const estimateReadingTime = (html) => {
  if (!html) return null;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 200)); // ~200 wpm
  return `${minutes} min`;
};

export default function BlogArticle() {
  const { slug } = useParams();
  const [art, setArt] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await svc.get(slug); // acepta id o slug (nuestro service elige la ruta)
        setArt(res);
      } catch (e) {
        const status = e?.response?.status || 500;
        setErr(status);
        console.warn("GET article error:", status, e?.response?.data || e);
      }
    })();
  }, [slug]);

  const readingTime = useMemo(() => estimateReadingTime(art?.body), [art?.body]);

  const authorName = useMemo(() => {
    const a = art?.author || {};
    return (
      a.name ||
      a.full_name ||
      [a.first_name, a.last_name].filter(Boolean).join(" ") ||
      a.nombre ||
      "Anónimo"
    );
  }, [art?.author]);

  if (err === 404)
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6">
          <h2 className="text-lg font-semibold mb-2">Artículo no encontrado</h2>
          <p className="text-sm opacity-80 mb-4">
            El enlace puede haber cambiado o el artículo fue eliminado.
          </p>
          <Link
            to="/blog"
            className="inline-block rounded-lg px-4 py-2 bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          >
            ← Volver al blog
          </Link>
        </div>
      </div>
    );

  if (!art)
    return (
      <div className="max-w-3xl mx-auto p-4">
        {/* Skeleton */}
        <div className="animate-pulse space-y-4">
          <div className="h-56 w-full rounded-2xl bg-[hsl(var(--muted))]" />
          <div className="h-8 w-3/4 rounded bg-[hsl(var(--muted))]" />
          <div className="h-4 w-1/2 rounded bg-[hsl(var(--muted))]" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-11/12 rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-10/12 rounded bg-[hsl(var(--muted))]" />
          </div>
        </div>
      </div>
    );

  return (
    <article className="max-w-4xl mx-auto p-4">
      {/* Back link */}
      <div className="mb-3">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
        >
          <span>←</span> Volver
        </Link>
      </div>

      {/* HERO con cover + overlay */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      >
        {art.cover_url ? (
          <>
            <img
              src={art.cover_url}
              alt={art.title}
              className="w-full h-[360px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--bg))] via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="h-[200px] w-full bg-[hsl(var(--muted))]" />
        )}
      </motion.div>

      {/* Título + meta */}
      <header className="mt-6">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {art.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {/* Autor */}
          <div className="flex items-center gap-2">
            {art.author?.avatar_url ? (
              <img
                src={art.author.avatar_url}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover border border-[hsl(var(--border))]"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-8 h-8 rounded-full grid place-items-center bg-[hsl(var(--brand))] text-[hsl(var(--brand-contrast))] text-xs font-semibold">
                {authorName
                  .split(" ")
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join("") || "A"}
              </div>
            )}
            <span className="opacity-90">{authorName}</span>
          </div>

          {/* Separador */}
          <span className="opacity-40">•</span>

          {/* Fecha */}
          <time className="opacity-80">
            {art.published_at ? formatDate(art.published_at) : "Borrador"}
          </time>

          {/* Separador */}
          {readingTime && (
            <>
              <span className="opacity-40">•</span>
              <span className="opacity-80">{readingTime} de lectura</span>
            </>
          )}

          {/* Categoría */}
          {art.category?.name && (
            <span className="ml-auto md:ml-4 inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              {art.category.name}
            </span>
          )}
        </div>
      </header>

      {/* Contenido */}
      <section className="mt-8">
        <div className="prose prose-neutral max-w-none">
          <div
            className="[&>img]:rounded-xl [&>img]:border [&>img]:border-[hsl(var(--border))]"
            dangerouslySetInnerHTML={{ __html: art.body }}
          />
        </div>
      </section>

      {/* Autor al pie (mini bio) */}
      <footer className="mt-10">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-4">
          {art.author?.avatar_url ? (
            <img
              src={art.author.avatar_url}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover border border-[hsl(var(--border))]"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-12 h-12 rounded-full grid place-items-center bg-[hsl(var(--brand))] text-[hsl(var(--brand-contrast))] font-bold">
              {authorName
                .split(" ")
                .slice(0, 2)
                .map((s) => s[0]?.toUpperCase())
                .join("") || "A"}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold">{authorName}</div>
            {art.author?.slug ? (
              <Link
                to={`/team/${art.author.slug}`}
                className="text-sm opacity-80 hover:opacity-100 underline underline-offset-4"
              >
                Ver perfil
              </Link>
            ) : (
              <div className="text-sm opacity-70">Autor</div>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
