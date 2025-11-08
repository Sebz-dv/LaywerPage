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
    postsService.list()
      .then((rows) => { if (alive) setItems(rows); })
      .catch((err) => { console.error(err); if (alive) setLoadError(err?.message || "Error cargando"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (item) => { setEditing(item); setOpen(true); };

  const upsertLocal = (saved) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Simple Posts</h1>
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={openNew}
        >Nuevo</button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-xl border p-6 text-center text-neutral-500">Cargando…</div>
        ) : loadError ? (
          <div className="rounded-xl border p-6 text-center text-red-600">{loadError}</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-neutral-500">
            Aún no hay posts. Crea el primero con el botón <span className="font-semibold">Nuevo</span>.
          </div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold">{it.title}</h3>
                  {it.author?.name && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Autor: <span className="font-medium">{it.author.name}</span>
                    </p>
                  )}
                  {it.info && <p className="text-sm text-neutral-600 mt-1">{it.info}</p>}
                  {it.links?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs hover:bg-neutral-50">
                          <span className="i-lucide-link" />{l.label || l.url}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  {Array.isArray(it.attachments) && it.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.attachments.map((a, i) => (
                        <a key={i} href={a.url || "#"} target="_blank" rel="noreferrer" className="text-xs underline">
                          {a.name || a.path}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                    onClick={() => openEdit(it)}
                  >Editar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SimplePostModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSaved={upsertLocal}
      />
    </div>
  );
}
