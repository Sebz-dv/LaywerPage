// src/pages/blog/BlogList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { articlesService as svc } from "../../../services/articlesService";
import heroFallback from "../../../assets/about/articulos.jpg"; // opcional

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** Debounce simple */
function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Prefiere-reducir-animación (accesibilidad) */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!m?.matches);
    update();
    m?.addEventListener?.("change", update);
    return () => m?.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/** Fecha legible con fallback */
function formatDate(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

const LinkBadges = ({ pdfUrl, externalUrl }) => {
  if (!pdfUrl && !externalUrl) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {pdfUrl ? <span className="badge">PDF</span> : null}
      {externalUrl ? <span className="badge">Link externo</span> : null}
    </div>
  );
};

export default function BlogList({
  heroImage = heroFallback,
  heroTitle = "Publicaciones",
  heroDescription = "Reflexiones y análisis de nuestro equipo sobre los desafíos legales y las transformaciones del entorno.",
}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 380);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prefersReduced = usePrefersReducedMotion();

  // evita race conditions
  const reqId = useRef(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const thisId = ++reqId.current;
    try {
      const res = await svc.list({
        search: debouncedQ || undefined,
        published_only: 1,
        sort: "-published_at,id",
        page,
        per_page: perPage,
      });
      if (thisId !== reqId.current) return;
      setItems(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch (e) {
      if (thisId !== reqId.current) return;
      console.error("BlogList fetch error:", e?.response?.data || e);
      setItems([]);
      setMeta(null);
      setError(
        e?.response?.data?.message || "No pudimos cargar las publicaciones."
      );
    } finally {
      if (thisId === reqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, page, perPage]);

  const skeletons = useMemo(() => Array.from({ length: perPage }), [perPage]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-10">
      {/* ===================== HERO FULL-BLEED ===================== */}
      <section className="w-screen h-[56svh] md:h-[64svh] relative overflow-hidden left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-[-12px]">
        {/* Fondo con blur + ken burns */}
        {heroImage && (
          <motion.img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="
              absolute inset-0 h-full w-full object-cover object-center
              blur-[6px] md:blur-[8px] lg:blur-[10px]
            "
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            initial={false}
            animate={
              prefersReduced ? {} : { scale: [1.1, 1.14, 1.1], y: [0, -8, 0] }
            }
            transition={
              prefersReduced
                ? {}
                : { duration: 18, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ willChange: "transform, filter" }}
          />
        )}

        {/* Overlays para contraste */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/35 md:bg-black/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        {/* Contenido centrado SIN cristal */}
        <div className="relative h-full grid place-items-center">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <header className="max-w-4xl mx-auto text-center">
              <h1
                className="
                  font-display 
                  text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                  font-semibold 
                  tracking-[0.06em] 
                  text-white 
                  drop-shadow-[0_10px_28px_rgba(0,0,0,.35)] 
                  leading-[1.12]
                "
                style={{
                  letterSpacing: "0.3em",
                  fontKerning: "normal",
                  fontOpticalSizing: "auto",
                  textRendering: "optimizeLegibility",
                }}
              >
                {heroTitle}
              </h1>

              {heroDescription && (
                <p
                  className="
                    mt-3 md:mt-4 
                    text-white/92 
                    font-subtitle 
                    text-lg md:text-xl 
                    leading-relaxed 
                    tracking-[0.02em] 
                    drop-shadow-[0_6px_20px_rgba(0,0,0,.35)] 
                    mx-auto
                  "
                  style={{ letterSpacing: "0.3em" }}
                >
                  {heroDescription}
                </p>
              )}
            </header>
          </div>
        </div>
      </section>

      {/* ===================== CONTROLES ===================== */}
      <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-soft">Explora los últimos artículos publicados.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            className="input"
            placeholder="Buscar título, extracto, contenido…"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            aria-label="Buscar artículos"
          />
          <select
            className="input sm:w-40"
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value) || 9);
            }}
            aria-label="Artículos por página"
          >
            <option value={6}>6 por página</option>
            <option value={9}>9 por página</option>
            <option value={12}>12 por página</option>
            <option value={18}>18 por página</option>
          </select>
        </div>
      </div>

      {/* ===================== ERRORES ===================== */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 border border-red-200 bg-red-50 text-red-700 rounded-xl px-3 py-2 text-sm"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== GRID ===================== */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Loading -> skeletons */}
        {loading &&
          skeletons.map((_, i) => (
            <div
              key={`sk-${i}`}
              className="card overflow-hidden animate-pulse"
              aria-hidden="true"
            >
              <div className="h-44 bg-muted" />
              <div className="card-pad space-y-3">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
            </div>
          ))}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="card card-pad text-center">
              <p className="text-soft">
                No encontramos publicaciones con esos filtros.
              </p>
              {debouncedQ && (
                <button
                  className="btn btn-outline mt-3"
                  onClick={() => {
                    setQ("");
                    setPage(1);
                  }}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        {!loading &&
          items.map((it, i) => {
            const id = it.id; // 🔒 usamos id sí o sí
            return (
              <motion.article
                key={id ?? i}
                className={cx(
                  "card overflow-hidden group interactive",
                  "flex flex-col"
                )}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                {/* Cover */}
                {it.cover_url ? (
                  <img
                    src={it.cover_url}
                    alt={it.title}
                    className="w-full h-44 object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-44 bg-muted grid place-items-center">
                    <span className="text-muted text-sm">Sin portada</span>
                  </div>
                )}

                {/* Body */}
                <div className="card-pad flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {formatDate(it.published_at)}
                    </span>
                    <span
                      className={cx(
                        "badge",
                        it.category?.name ? "badge-accent" : ""
                      )}
                      title={it.category?.slug || ""}
                    >
                      {it.category?.name ?? "General"}
                    </span>
                  </div>

                  <Link
                    to={`/publicaciones/${encodeURIComponent(id)}`}
                    className="text-lg font-semibold font-display leading-tight hover:underline underline-offset-4 line-clamp-2"
                    title={it.title}
                  >
                    {it.title}
                  </Link>

                  {/* Autor + enlaces disponibles */}
                  <div className="flex items-center justify-between">
                    {it.author?.name ? (
                      <span className="text-xs text-muted">
                        Por {it.author.name}
                      </span>
                    ) : <span />}

                    <LinkBadges pdfUrl={it.pdf_url} externalUrl={it.external_url} />
                  </div>

                  {it.excerpt && (
                    <p className="text-soft text-sm line-clamp-3">
                      {it.excerpt}
                    </p>
                  )}

                  {/* CTA primaria */}
                  <div className="pt-1">
                    <Link
                      to={`/publicaciones/${encodeURIComponent(id)}`}
                      className="btn btn-outline w-full"
                    >
                      Leer más
                    </Link>
                  </div>

                  {/* Acciones rápidas de lectura (si hay PDF/link) */}
                  {(it.pdf_url || it.external_url) && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {it.pdf_url ? (
                        <a
                          className="btn btn-outline"
                          href={it.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver PDF ↗
                        </a>
                      ) : (
                        <div />
                      )}
                      {it.external_url ? (
                        <a
                          className="btn btn-outline"
                          href={it.external_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir link ↗
                        </a>
                      ) : (
                        <div />
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
      </div>

      {/* ===================== PAGINACIÓN ===================== */}
      {meta && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            disabled={meta.current_page <= 1 || loading}
            className="btn btn-outline disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>
          <span className="text-sm text-soft">
            Página {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={meta.current_page >= meta.last_page || loading}
            className="btn btn-outline disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
