// src/pages/public/blog/BlogArticle.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { articlesService as svc } from "../../../services/articlesService";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

/* ================= Helpers ================= */
const formatDate = (iso, withTime = false) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
};

const estimateReadingTime = (html) => {
  if (!html) return null;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return `${Math.max(1, Math.round(words / 200))} min`;
};

const parseMeta = (meta) => {
  if (!meta) return null;
  if (typeof meta === "object") return meta;
  try {
    const fixed =
      typeof meta === "string" && meta.trim().startsWith("{")
        ? meta
        : String(meta || "").replace(/^"|"$/g, "");
    return JSON.parse(fixed);
  } catch {
    return { _raw: meta };
  }
};

// ⬅️ Ahora prioriza display_name
const authorNameFrom = (a = {}) =>
  a.display_name ||
  a.name ||
  a.full_name ||
  [a.first_name, a.last_name].filter(Boolean).join(" ") ||
  a.nombre ||
  "Anónimo";

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "A";

/* ================= UI atoms ================= */
const Badge = ({ children, tone = "neutral", title }) => {
  const tones = {
    neutral: "border-token bg-muted text-soft",
    success:
      "border-emerald-300/50 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200",
    warn:
      "border-amber-300/50 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
    info:
      "border-sky-300/50 bg-sky-50 text-sky-800 dark:bg-sky-900/20 dark:text-sky-200",
    accent: "badge-accent",
  };
  return (
    <span title={title} className={`badge ${tones[tone]} whitespace-nowrap`}>
      {children}
    </span>
  );
};

function KV({ label, value, mono = false }) {
  return (
    <div className="rounded-xl border border-token bg-muted p-3">
      <div className="text-[11px] uppercase tracking-wide opacity-60 font-subtitle">
        {label}
      </div>
      <div className={`mt-0.5 ${mono ? "font-mono text-[13px]" : ""}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ================= Component ================= */
export default function BlogArticle() {
  const { id } = useParams();
  const location = useLocation();
  const debug = useMemo(
    () => new URLSearchParams(location.search).has("debug"),
    [location.search]
  );

  const [art, setArt] = useState(null);
  const [err, setErr] = useState(null);
  const [related, setRelated] = useState([]);
  const prefersReduced = useReducedMotion();

  // progress
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!id || !/^[0-9]+$/.test(String(id))) {
      setErr(404);
      setArt(null);
      return;
    }
    (async () => {
      try {
        const res = await svc.get(id);
        console.log("GET article:", res);
        setArt(res);
        setErr(null);
      } catch (e) {
        const status = e?.response?.status || 500;
        setErr(status);
        setArt(null);
        console.warn("GET article error:", status, e?.response?.data || e);
      }
    })();
  }, [id]);

  // relacionados por categoría
  useEffect(() => {
    (async () => {
      if (!art?.article_category_id) return setRelated([]);
      try {
        const r = await svc.list({
          published_only: 1,
          per_page: 3,
          sort: "-published_at,id",
          category_id: art.article_category_id,
        });
        const rows = (r?.data ?? []).filter(
          (x) => String(x.id) !== String(art.id)
        );
        setRelated(rows.slice(0, 3));
      } catch {
        setRelated([]);
      }
    })();
  }, [art?.article_category_id, art?.id]);

  // progress on scroll
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.scrollHeight - window.innerHeight;
      const y = Math.min(
        Math.max(window.scrollY - (el.offsetTop - 16), 0),
        total
      );
      setProgress(total > 0 ? (y / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [art?.body]);

  const readingTime = useMemo(
    () => estimateReadingTime(art?.body),
    [art?.body]
  );
  const authorName = useMemo(
    () => authorNameFrom(art?.author || {}),
    [art?.author]
  );
  const metaObj = useMemo(() => parseMeta(art?.meta), [art?.meta]);

  const hasExternal = !!art?.external_url;
  const hasPdf = !!art?.pdf_url;
  const hasBody = !!art?.body;

  /* ================= States ================= */
  if (err === 404)
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="card card-pad">
          <h2 className="text-lg font-semibold mb-2 font-display">
            Artículo no encontrado
          </h2>
          <p className="text-sm text-soft mb-4">
            Revisa el enlace. Esta vista funciona únicamente con ID numérico.
          </p>
          <Link to="/blog" className="btn btn-accent">
            ← Volver al blog
          </Link>
        </div>
      </div>
    );

  if (!art)
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-56 w-full rounded-2xl bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-11/12 rounded bg-muted" />
            <div className="h-4 w-10/12 rounded bg-muted" />
          </div>
        </div>
      </div>
    );

  /* ================= Share URLs ================= */
  const canonical = typeof window !== "undefined" ? window.location.href : "";
  const share = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      canonical
    )}`,
    tw: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      canonical
    )}&text=${encodeURIComponent(art.title)}`,
    li: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      canonical
    )}&title=${encodeURIComponent(art.title)}`,
  };

  /* ================= UI ================= */
  return (
    <article className="max-w-5xl lg:max-w-6xl mx-auto font-display">
      {/* Progress fino arriba */}
      <div
        className="fixed left-0 right-0 top-0 h-[3px] z-40"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--accent)) 0, hsl(var(--secondary)) 100%)",
          transform: `scaleX(${Math.max(0.02, progress / 100)})`,
          transformOrigin: "0 0",
          opacity: 0.9,
        }}
      />

      {/* Breadcrumb minimal */}
      <div className="px-4 md:px-6 mt-4">
        <nav className="text-sm text-soft font-subtitle">
          <Link className="link" to="/">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link className="link" to="/blog">
            Publicaciones
          </Link>
        </nav>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bleed-x h-[42svh] md:h-[48svh] mt-3">
        {art.cover_url ? (
          <motion.img
            src={art.cover_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            initial={false}
            animate={prefersReduced ? {} : { scale: [1.03, 1.07, 1.03] }}
            transition={
              prefersReduced
                ? {}
                : { duration: 16, repeat: Infinity, ease: "easeInOut" }
            }
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/60" />
        <div className="relative h-full flex items	end mt-36">
          <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
            <header className="max-w-4xl">
              {/* Chips de estado */}
              <div className="flex items-center gap-2 mb-3">
                {art.category?.name && (
                  <Badge tone="accent">{art.category.name}</Badge>
                )}
                {hasPdf && (
                  <Badge tone="info" title="Documento PDF">
                    PDF
                  </Badge>
                )}
                {hasExternal && (
                  <Badge tone="success" title="Enlace externo">
                    Link externo
                  </Badge>
                )}
                {art.featured && <Badge tone="warn">Destacado</Badge>}
              </div>

              <h1 className="text-white text-3xl sm:text-4xl font-semibold tracking-[0.01em] drop-shadow">
                {art.title}
              </h1>

              <div className="mt-2 text-white/90 text-sm font-subtitle flex flex-wrap items-center gap-x-3 gap-y-1">
                <time>
                  {art.published_at ? formatDate(art.published_at) : "Borrador"}
                </time>
                {readingTime && (
                  <span className="opacity-70">• {readingTime} de lectura</span>
                )}
                {authorName && (
                  <span className="opacity-70">• Por {authorName}</span>
                )}
              </div>

              {/* Acciones rápidas si hay PDF/Link */}
              {(hasPdf || hasExternal) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {hasPdf && (
                    <a
                      className="btn btn-outline"
                      href={art.pdf_url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Ver PDF ↗
                    </a>
                  )}
                </div>
              )}
            </header>
          </div>
        </div>
      </section>

      {/* Extracto breve */}
      {art.excerpt && (
        <section className="px-4 md:px-6 mt-6">
          <div className="rounded-2xl border border-token bg-card p-4">
            <p className="text-base text-soft font-subtitle">{art.excerpt}</p>
          </div>
        </section>
      )}

      {/* Contenido (o fallback cuando solo hay PDF/Link) */}
      <section className="px-4 md:px-6 mt-6">
        {hasBody ? (
          <div
            ref={contentRef}
            className="
              prose prose-neutral max-w-none
            "
          >
            <div
              className="
                card card-pad
                [&>img]:rounded-xl [&>img]:border [&>img]:border-token
                whitespace-pre-line
              "
            >
              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {art.body || ""}
              </ReactMarkdown>
            </div>
          </div>
        ) : hasPdf || hasExternal ? (
          <div className="card card-pad">
            <p className="text-soft">
              Este artículo se encuentra disponible{" "}
              {hasPdf ? "en formato PDF" : ""}
              {hasPdf && hasExternal ? " y " : ""}
              {hasExternal ? "mediante un enlace externo" : ""}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasPdf && (
                <a
                  className="btn btn-primary"
                  href={art.pdf_url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Abrir PDF ↗
                </a>
              )}
              {hasExternal && (
                <a
                  className="btn btn-outline"
                  href={art.external_url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Abrir enlace ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="card card-pad">
            <p className="text-soft">
              Próximamente contenido para este artículo.
            </p>
          </div>
        )}
      </section>

      {/* Share bar + Autor */}
      <section className="px-4 md:px-6 mt-8">
        <div className="flex flex-col gap-6">
          {/* Share */}
          <div className="rounded-2xl border border-token bg-card p-4">
            <div className="text-sm font-subtitle opacity-80 mb-2">
              Compartir en
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                className="btn btn-outline"
                href={share.fb}
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                className="btn btn-outline"
                href={share.li}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="btn btn-outline"
                href={share.tw}
                target="_blank"
                rel="noopener noreferrer"
              >
                X / Twitter
              </a>
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard?.writeText(canonical);
                }}
              >
                Copiar enlace
              </button>
            </div>
          </div>

          {/* Autor */}
          <div className="rounded-2xl border border-token bg-card p-4 flex items-center gap-4">
            {art.author?.avatar_url ? (
              <img
                src={art.author.avatar_url}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover border border-token"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-12 h-12 rounded-full grid place-items-center bg-primary text-[hsl(var(--primary-foreground))] font-bold">
                {initialsOf(authorName)}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm text-soft mb-1">Escrito por:</div>
              <div className="font-semibold">{authorName}</div>
              {art.author?.slug && (
                <Link
                  to={`/equipo/${art.author.slug}`}
                  className="link text-sm"
                >
                  Ver perfil
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="px-4 md:px-6 mt-10 mb-10">
          <h3 className="text-lg font-semibold mb-3">
            Artículos que te pueden interesar
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((it) => (
              <article
                key={it.id}
                className="card overflow-hidden interactive flex flex-col"
              >
                {it.cover_url ? (
                  <img
                    src={it.cover_url}
                    alt={it.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-40 bg-muted grid place-items-center">
                    <span className="text-muted text-sm">Sin portada</span>
                  </div>
                )}
                <div className="card-pad flex flex-col gap-2">
                  <span className="text-xs text-soft">
                    {formatDate(it.published_at)}
                  </span>
                  <Link
                    to={`/publicaciones/${encodeURIComponent(it.id)}`}
                    className="font-semibold hover:underline underline-offset-4 line-clamp-2"
                    title={it.title}
                  >
                    {it.title}
                  </Link>
                  {it.excerpt && (
                    <p className="text-sm text-soft line-clamp-3">
                      {it.excerpt}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Datos técnicos (solo debug) */}
      {debug && (
        <section className="px-4 md:px-6 mt-8">
          <div className="card card-pad">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Datos técnicos</h3>
              <div className="flex items-center gap-2">
                <span className="badge">ID #{art.id}</span>
                {art.slug && <span className="badge badge-primary">slug</span>}
                {hasPdf && <span className="badge">pdf_url</span>}
                {hasExternal && (
                  <span className="badge">external_url</span>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <KV label="ID" value={art.id} />
              <KV label="Slug" value={art.slug || "—"} mono />
              <KV
                label="Categoría ID"
                value={art.article_category_id ?? "—"}
              />
              <KV label="Categoría" value={art.category?.name ?? "—"} />
              <KV label="Autor ID" value={art.author_id ?? "—"} />
              <KV label="Autor" value={authorName || "—"} />
              <KV label="Destacado" value={art.featured ? "Sí" : "No"} />
              <KV label="Publicado" value={art.is_published ? "Sí" : "No"} />
              <KV
                label="Publicado el"
                value={formatDate(art.published_at, true)}
              />
              <KV label="Creado el" value={formatDate(art.created_at, true)} />
              <KV
                label="Actualizado el"
                value={formatDate(art.updated_at, true)}
              />
              <KV label="Cover path" value={art.cover_path || "—"} mono />
              <KV label="Cover URL" value={art.cover_url || "—"} mono />
              <KV label="PDF URL" value={art.pdf_url || "—"} mono />
              <KV
                label="External URL"
                value={art.external_url || "—"}
                mono
              />
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Meta</div>
              <pre className="text-xs overflow-auto rounded-xl border border-token bg-muted p-3">
                {JSON.stringify(metaObj ?? null, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
