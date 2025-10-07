// src/pages/blog/BlogList.jsx
import React, { useEffect, useState } from "react";
import { articlesService as svc } from "../../../services/articlesService";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BlogList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const res = await svc.list({
        search: q,
        published_only: 1,
        sort: "-published_at",
        page,
        per_page: 9,
      });
      setItems(res.data);
      setMeta(res.meta);
    })();
  }, [q, page]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blog legal</h1>
      <input
        className="border rounded px-3 py-2 mb-4 w-full"
        placeholder="Buscar artículos…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.article
            key={it.slug}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="border rounded-lg overflow-hidden"
          >
            {it.cover_url && (
              <img
                src={it.cover_url}
                alt={it.title}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-3 space-y-2">
              <div className="text-xs text-gray-500">
                {new Date(it.published_at).toLocaleDateString()}
              </div>
              <Link
                to={`/publicaciones/${it.slug}`}
                className="font-semibold hover:underline"
              >
                {it.title}
              </Link>
              <p className="text-sm text-gray-600">{it.excerpt}</p>
            </div>
          </motion.article>
        ))}
      </div>

      {meta && (
        <div className="mt-6 flex items-center gap-2 justify-center">
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
