// src/pages/admin/ArticlesAdmin.jsx
import React, { useEffect, useState } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/loader/Loader.jsx"; // si no existe, elimina esta import y el uso

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const StatusBadge = ({ published, featured }) => {
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      <span
        className={cx(
          "badge",
          published
            ? "badge-primary"
            : "border border-dashed border-muted text-muted bg-transparent"
        )}
      >
        {published ? "Publicado" : "Borrador"}
      </span>
      {featured && (
        <span className="badge badge-accent flex items-center gap-1">
          ★ <span>Destacado</span>
        </span>
      )}
    </div>
  );
};

const LinkBadges = ({ pdfUrl, externalUrl }) => {
  if (!pdfUrl && !externalUrl) return null;
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      {pdfUrl && <span className="badge">PDF</span>}
      {externalUrl && <span className="badge">Link externo</span>}
    </div>
  );
};

export default function ArticlesAdmin() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ published_only: "", featured: "" });
  const [sort, setSort] = useState("-published_at,id"); // por defecto: publicados recientes primero
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sort,
        page,
        per_page: perPage,
        ...(q ? { search: q } : {}),
        ...(filters.published_only !== ""
          ? { published_only: filters.published_only }
          : {}),
        ...(filters.featured !== "" ? { featured: filters.featured } : {}),
      };
      const res = await svc.list(params);
      setItems(res?.data ?? []);
      setMeta(res?.meta ?? null);
    } catch (e) {
      console.error("Articles fetch error:", e?.response?.data || e);
      setError(e?.response?.data?.message || "Error cargando artículos");
      setItems([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filters, sort, page, perPage]);

  const refreshAndStay = async (fn) => {
    try {
      await fn();
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || "Error en la acción");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header / Toolbar */}
      <div className="card sticky top-4 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[hsl(var(--card))/0.7] border border-border/60 shadow-sm px-3 py-2 md:px-4 md:py-2.5">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Título */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-semibold font-display">
              Publicaciones
            </h1>
            {meta?.total ? (
              <span className="hidden sm:inline-flex text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted">
                {meta.total} en total
              </span>
            ) : null}
            <p className="hidden md:inline text-[11px] text-muted ms-2">
              Gestiona estados y destacados.
            </p>
          </div>

          {/* Filtros en columnas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            <select
              className="input h-8 text-xs w-full"
              value={filters.published_only}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({
                  ...f,
                  published_only: e.target.value,
                }));
              }}
              title="Publicados/borradores"
            >
              <option value="">Todos</option>
              <option value="1">Publicados</option>
              <option value="0">Borradores</option>
            </select>

            <select
              className="input h-8 text-xs w-full"
              value={filters.featured}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, featured: e.target.value }));
              }}
              title="Destacados"
            >
              <option value="">Destacados: todos</option>
              <option value="1">Solo destacados</option>
              <option value="0">No destacados</option>
            </select>

            <select
              className="input h-8 text-xs w-full"
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              title="Orden"
            >
              <option value="-published_at,id">Pub. reciente</option>
              <option value="-id">Más nuevos (ID)</option>
              <option value="-created_at">Creación reciente</option>
              <option value="title">Título (A-Z)</option>
              <option value="-featured,-published_at">
                Destacados primero
              </option>
            </select>

            <select
              className="input h-8 text-xs w-full"
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(parseInt(e.target.value, 10));
              }}
              title="Resultados"
            >
              {[8, 12, 16, 24, 32].map((n) => (
                <option key={n} value={n}>
                  {n}/pág
                </option>
              ))}
            </select>
          </div>

          {/* Search + botón al final */}
          <div className="ms-auto flex items-center gap-2 min-w-[220px]">
            <div className="relative flex-1">
              <input
                className="input pe-8 w-full h-8 text-sm"
                placeholder="Buscar…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
              <span
                aria-hidden
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted"
              >
                ⌕
              </span>
            </div>

            <button
              className="btn btn-accent h-8 px-3 text-xs whitespace-nowrap"
              onClick={() => nav("/dash/articles/new")}
            >
              + Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card card-pad border-destructive/40 bg-red-50/70 dark:bg-red-950/20">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Listado */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="card overflow-hidden border border-border/60 bg-muted/40"
              >
                <div className="h-40 bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
            {/* Overlay loader (si tienes Loader) */}
            <div className="fixed inset-0 grid place-items-center bg-black/15 backdrop-blur-sm pointer-events-none">
              <Loader size={44} />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold">No hay artículos</h3>
              <p className="text-muted text-sm">
                Ajusta filtros o crea tu primera publicación.
              </p>
            </div>
            <button
              className="btn btn-primary w-full md:w-auto"
              onClick={() => nav("/dash/articles/new")}
            >
              Crear artículo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((it) => (
              <motion.article
                key={it.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className={cx(
                  "card overflow-hidden interactive flex flex-col border border-border/60 bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow",
                  !it.is_published && "opacity-90"
                )}
              >
                {/* Cover */}
                <div className="relative">
                  {it.cover_url ? (
                    <img
                      src={it.cover_url}
                      alt={it.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="h-40 bg-muted/60 grid place-items-center text-muted text-xs uppercase tracking-wide">
                      Sin portada
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <StatusBadge
                      published={!!it.is_published}
                      featured={!!it.featured}
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Meta superior */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="badge truncate max-w-[55%]">
                      {it.category?.name ?? "Sin categoría"}
                    </span>
                    {it.author?.name && (
                      <span className="text-muted truncate max-w-[45%] text-right">
                        por{" "}
                        <span className="font-medium">{it.author.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="font-semibold leading-tight line-clamp-2 text-sm">
                    {it.title}
                  </h3>

                  {/* Excerpt (si existe) */}
                  {it.excerpt && (
                    <p className="text-xs text-muted line-clamp-2">
                      {it.excerpt}
                    </p>
                  )}

                  {/* Estado / links */}
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <StatusBadge
                      published={!!it.is_published}
                      featured={!!it.featured}
                    />
                    <LinkBadges
                      pdfUrl={it.pdf_url}
                      externalUrl={it.external_url}
                    />
                  </div>

                  {/* Acciones */}
                  <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                    <button
                      className="btn btn-outline"
                      onClick={() => nav(`/dash/articles/${it.id}/edit`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        refreshAndStay(() => svc.togglePublish(it.id))
                      }
                    >
                      {it.is_published ? "Despublicar" : "Publicar"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        refreshAndStay(() => svc.toggleFeatured(it.id))
                      }
                    >
                      {it.featured ? "Quitar destacado" : "Destacar"}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        confirm("¿Eliminar?") &&
                        refreshAndStay(() => svc.remove(it.id))
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Acciones rápidas de lectura */}
                  {(it.pdf_url || it.external_url) && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
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
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Paginación */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-wrap items-center gap-2 justify-center pt-2">
          <button
            disabled={meta.current_page <= 1}
            className="btn btn-outline disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>

          <span className="text-sm text-muted">
            Página {meta.current_page} de {meta.last_page} · {meta.total} items
          </span>

          <button
            disabled={meta.current_page >= meta.last_page}
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
