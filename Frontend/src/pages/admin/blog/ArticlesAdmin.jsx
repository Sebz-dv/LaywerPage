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
    <div className="flex flex-wrap gap-2">
      {published ? (
        <span className="badge badge-primary">Publicado</span>
      ) : (
        <span className="badge">Borrador</span>
      )}
      {featured ? <span className="badge badge-accent">Destacado</span> : null}
    </div>
  );
};

const LinkBadges = ({ pdfUrl, externalUrl }) => {
  if (!pdfUrl && !externalUrl) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {pdfUrl ? <span className="badge">PDF</span> : null}
      {externalUrl ? <span className="badge">Link externo</span> : null}
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
        ...(filters.published_only !== "" ? { published_only: filters.published_only } : {}),
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
    <div className="p-4 md:p-6 space-y-4">
      {/* Header / Toolbar */}
      <div className="card card-pad sticky top-4 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[hsl(var(--card))/0.6]">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold font-display">
            Publicaciones
          </h1>

          <div className="ms-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                className="input pe-9"
                placeholder="Buscar título o extracto…"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
              <span
                aria-hidden
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted"
              >
                ⌕
              </span>
            </div>

            <select
              className="input w-[180px]"
              value={filters.published_only}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, published_only: e.target.value }));
              }}
              title="Filtrar por publicados/borradores"
            >
              <option value="">Todos</option>
              <option value="1">Solo publicados</option>
              <option value="0">Solo borradores</option>
            </select>

            <select
              className="input w-[180px]"
              value={filters.featured}
              onChange={(e) => {
                setPage(1);
                setFilters((f) => ({ ...f, featured: e.target.value }));
              }}
              title="Filtrar por destacados"
            >
              <option value="">Destacados: todos</option>
              <option value="1">Solo destacados</option>
              <option value="0">No destacados</option>
            </select>

            <select
              className="input w-[240px]"
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              title="Orden"
            >
              <option value="-published_at,id">Publicación (reciente)</option>
              <option value="-id">Más nuevos (ID)</option>
              <option value="-created_at">Creación (reciente)</option>
              <option value="title">Título (A-Z)</option>
              <option value="-featured,-published_at">
                Destacados primero
              </option>
            </select>

            <select
              className="input w-[120px]"
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(parseInt(e.target.value, 10));
              }}
              title="Resultados por página"
            >
              {[8, 12, 16, 24, 32].map((n) => (
                <option key={n} value={n}>
                  {n}/pág
                </option>
              ))}
            </select>

            <button
              className="btn btn-accent"
              onClick={() => nav("/dash/articles/new")}
            >
              + Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card card-pad border-destructive/40">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Listado */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
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
            <div className="fixed inset-0 grid place-items-center bg-black/10 backdrop-blur-sm pointer-events-none">
              <Loader size={44} />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad flex items-center justify-between">
            <div>
              <h3 className="font-semibold">No hay artículos</h3>
              <p className="text-muted text-sm">
                Ajusta filtros o crea tu primera publicación.
              </p>
            </div>
            <button
              className="btn btn-primary"
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
                className="card overflow-hidden interactive"
              >
                {/* Cover */}
                {it.cover_url ? (
                  <img
                    src={it.cover_url}
                    alt={it.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="h-40 bg-muted grid place-items-center text-muted">
                    Sin portada
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge">
                      {it.category?.name ?? "—"}
                    </span>
                    {it.author?.name ? (
                      <span className="badge">{it.author.name}</span>
                    ) : null}
                  </div>

                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {it.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <StatusBadge
                      published={!!it.is_published}
                      featured={!!it.featured}
                    />
                    <LinkBadges pdfUrl={it.pdf_url} externalUrl={it.external_url} />
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
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
