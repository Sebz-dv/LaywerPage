// src/pages/admin/blog/SimplePostsPage.jsx
import React, { useEffect, useState } from "react";
import postsService from "../../../services/postsService";
import { SimplePostModal } from "./SimplePostModal";

export default function SimplePostsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;
    postsService
      .list()
      .then((rows) => {
        if (alive) setItems(rows);
      })
      .catch((err) => {
        console.error(err);
        if (alive) setLoadError(err?.message || "Error cargando");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setOpen(true);
  };

  const upsertLocal = (saved) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold font-display">
            Blogs
          </h1>
          <p className="mt-1 text-sm text-soft">
            Administra notas rápidas, links y adjuntos en un solo lugar.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent"
          onClick={openNew}
        >
          Nuevo
        </button>
      </div>

      {/* Estado de lista */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="card card-pad text-center">
            <p className="text-soft">Cargando…</p>
          </div>
        ) : loadError ? (
          <div className="card card-pad text-center border-destructive text-[0.95rem] text-red-600">
            {loadError}
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad text-center text-soft">
            <p>
              Aún no hay posts. Crea el primero con el botón{" "}
              <span className="font-medium text-accent">Nuevo</span>.
            </p>
          </div>
        ) : (
          items.map((it) => (
            <article
              key={it.id}
              className="card card-pad interactive"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  {/* Título */}
                  <h3 className="text-lg md:text-xl font-semibold font-display">
                    {it.title}
                  </h3>

                  {/* Autor */}
                  {it.author?.name && (
                    <p className="text-xs text-soft font-subtitle">
                      Autor:{" "}
                      <span className="font-medium">
                        {it.author.name}
                      </span>
                    </p>
                  )}

                  {/* Info / descripción corta */}
                  {it.info && (
                    <p className="text-sm text-soft mt-1">
                      {it.info}
                    </p>
                  )}

                  {/* Links */}
                  {it.links?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.links.map((l, i) => (
                        <a
                          key={i}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-primary inline-flex items-center gap-1 hover:bg-primary/10"
                        >
                          <span className="i-lucide-link" />
                          <span className="truncate max-w-[200px]">
                            {l.label || l.url}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {/* Adjuntos */}
                  {Array.isArray(it.attachments) &&
                    it.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {it.attachments.map((a, i) => (
                          <a
                            key={i}
                            href={a.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs link"
                          >
                            {a.name || a.path}
                          </a>
                        ))}
                      </div>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline text-sm"
                    onClick={() => openEdit(it)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal de creación/edición */}
      <SimplePostModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSaved={upsertLocal}
      />
    </div>
  );
}
