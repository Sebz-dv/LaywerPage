// src/pages/admin/ArticlesAdmin.jsx
import React, { useEffect, useState } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { motion, AnimatePresence } from "framer-motion";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function ArticlesAdmin() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ published_only: "", featured: "" });
  // ADMIN: por defecto ordenar por más nuevos (id desc)
  const [sort, setSort] = useState("-id");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construye params sin vacíos
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
    <div className="p-4">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          className="border rounded px-3 py-2"
          placeholder="Buscar título, extracto..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
        <select
          className="border rounded px-2 py-2"
          value={filters.published_only}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, published_only: e.target.value })); }}
          title="Filtrar por publicados/borradores"
        >
          <option value="">Todos</option>
          <option value="1">Solo publicados</option>
          <option value="0">Solo borradores</option>
        </select>
        <select
          className="border rounded px-2 py-2"
          value={filters.featured}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, featured: e.target.value })); }}
          title="Filtrar por destacados"
        >
          <option value="">Destacados: todos</option>
          <option value="1">Solo destacados</option>
          <option value="0">No destacados</option>
        </select>
        <select
          className="border rounded px-2 py-2"
          value={sort}
          onChange={(e) => { setPage(1); setSort(e.target.value); }}
          title="Orden"
        >
          <option value="-id">Más nuevos (ID)</option>
          <option value="-created_at">Creación (reciente)</option>
          <option value="-published_at,id">Publicación (reciente)</option>
          <option value="title">Título (A-Z)</option>
          <option value="-featured,-published_at">Destacados primero</option>
        </select>
        <button
          className="ml-auto bg-black text-white px-4 py-2 rounded"
          onClick={() => (window.location.href = "/dash/articles/new")}
        >
          + Nuevo
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <AnimatePresence>
        {loading ? (
          <p>Cargando…</p>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">
            No hay artículos para los filtros actuales.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border rounded-lg overflow-hidden"
              >
                {it.cover_url && (
                  <img
                    src={it.cover_url}
                    alt={it.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="p-3 space-y-2">
                  <div className="text-sm text-gray-500">
                    {it.category?.name ?? "—"}
                  </div>
                  <h3 className="font-semibold">{it.title}</h3>
                  <div className="flex gap-2 text-sm">
                    {it.is_published ? (
                      <span className="text-green-700">Publicado</span>
                    ) : (
                      <span className="text-orange-700">Borrador</span>
                    )}
                    {it.featured && (
                      <span className="text-blue-700">Destacado</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() =>
                        (window.location.href = `/dash/articles/${it.id}/edit`)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => refreshAndStay(() => svc.togglePublish(it.id))}
                    >
                      {it.is_published ? "Despublicar" : "Publicar"}
                    </button>
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => refreshAndStay(() => svc.toggleFeatured(it.id))}
                    >
                      {it.featured ? "Quitar destacado" : "Destacar"}
                    </button>
                    <button
                      className="px-3 py-1 border rounded text-red-600"
                      onClick={() =>
                        confirm("¿Eliminar?") &&
                        refreshAndStay(() => svc.remove(it.id))
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {meta && (
        <div className="mt-4 flex items-center gap-2">
          <button
            disabled={meta.current_page <= 1}
            className="border px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={meta.current_page >= meta.last_page}
            className="border px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
