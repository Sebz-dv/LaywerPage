import React, { useEffect, useMemo, useState } from "react";
import { infoBlocksService } from "../../services/infoBlocksService";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ✅ slugify en cliente
function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

export default function InfoBlocksManager({ className }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const list = await infoBlocksService.list();
      setItems(list);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "No se pudo cargar";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const rawTitle = (fd.get("title") || "").trim();
    const rawKey = (fd.get("key") || "").trim();

    const payload = {
      key: slugify(rawKey || rawTitle),
      title: rawTitle,
      body: (fd.get("body") || "").trim(),
      published: fd.get("published") === "on",
    };

    try {
      setCreating(true);
      setErr("");

      // 👇 la API devuelve el bloque creado
      const created = await infoBlocksService.create(payload);

      // 👇 lo agregamos al estado (aparece sin recargar)
      setItems((prev) => [...prev, created]);

      form.reset();
      form.querySelector('input[name="title"]')?.focus(); // opcional: UX
    } catch (er) {
      const first = er?.response?.data?.errors
        ? Object.values(er.response.data.errors).flat()[0]
        : er?.response?.data?.message || er.message;
      setErr(first || "Error creando");
    } finally {
      setCreating(false);
    }
  };

  const onSave = async (id, row) => {
    try {
      setBusyId(id);
      setErr("");
      await infoBlocksService.update(id, { ...row, key: slugify(row.key) });
      await load();
    } catch (er) {
      const first = er?.response?.data?.errors
        ? Object.values(er.response.data.errors).flat()[0]
        : er?.response?.data?.message || er.message;
      setErr(first || "Error guardando");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar bloque?")) return;
    try {
      setBusyId(id);
      setErr("");
      await infoBlocksService.remove(id);
      await load();
    } catch (er) {
      const first = er?.response?.data?.errors
        ? Object.values(er.response.data.errors).flat()[0]
        : er?.response?.data?.message || er.message;
      setErr(first || "Error eliminando");
    } finally {
      setBusyId(null);
    }
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const clone = items.slice();
    const [moved] = clone.splice(from, 1);
    clone.splice(to, 0, moved);
    setItems(clone);
  };

  const onReorder = async () => {
    try {
      setErr("");
      await infoBlocksService.reorder(items.map((x) => x.id));
      await load();
    } catch (er) {
      const first = er?.response?.data?.errors
        ? Object.values(er.response.data.errors).flat()[0]
        : er?.response?.data?.message || er.message;
      setErr(first || "Error reordenando");
    }
  };

  return (
    <section className={cx("space-y-6", className)}>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bloques institucionales</h2>
        <span className="text-sm text-[hsl(var(--fg))/0.6]">
          {items.length} {items.length === 1 ? "bloque" : "bloques"}
        </span>
      </header>

      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-800 text-sm">
          {String(err)}
        </div>
      )}

      {/* Crear */}
      <form
        onSubmit={onCreate}
        className="rounded-2xl border p-4 space-y-3 bg-[hsl(var(--card))]"
      >
        <h3 className="font-medium">Nuevo bloque</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs mb-1">Clave (slug)</label>
            <input
              name="key"
              placeholder="mision (opcional)"
              className="w-full rounded-lg border px-3 py-2"
              title="Solo minúsculas, números, guion y guion_bajo"
              maxLength={64}
              onInput={(e) => {
                e.currentTarget.value = slugify(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Título</label>
            <input
              name="title"
              required
              placeholder="Misión"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1">Contenido</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder="Nuestra misión es..."
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked />
            <span className="text-sm">Publicado</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className={cx(
            "rounded-xl px-3 py-2 text-sm font-medium border",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25]",
            creating && "opacity-60 cursor-not-allowed"
          )}
        >
          Crear
        </button>
      </form>

      {/* Lista / edición */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border bg-[hsl(var(--muted))] animate-pulse"
            />
          ))
        ) : items.length === 0 ? (
          <p className="text-[hsl(var(--fg))/0.7]">No hay bloques.</p>
        ) : (
          items.map((it, idx) => (
            <BlockRow
              key={it.id}
              item={it}
              busy={busyId === it.id}
              onSave={(row) => onSave(it.id, row)}
              onDelete={() => onDelete(it.id)}
              onMoveUp={() => move(idx, idx - 1)}
              onMoveDown={() => move(idx, idx + 1)}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          ))
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReorder}
            className="rounded-xl px-3 py-2 text-sm border bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))/0.8]"
          >
            Guardar orden
          </button>
        </div>
      )}
    </section>
  );
}

function BlockRow({
  item,
  busy,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [form, setForm] = useState(() => ({
    key: item.key,
    title: item.title,
    body: item.body,
    published: !!item.published,
  }));
  const dirty = useMemo(
    () =>
      form.key !== item.key ||
      form.title !== item.title ||
      form.body !== item.body ||
      form.published !== !!item.published,
    [form, item]
  );

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "key" ? slugify(value) : type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="rounded-2xl border p-4 bg-[hsl(var(--card))] space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs mb-1">Clave (slug)</label>
          <input
            name="key"
            value={form.key}
            onInput={(e) =>
              setForm((f) => ({ ...f, key: slugify(e.currentTarget.value) }))
            }
            className="w-full rounded-lg border px-3 py-2"
            title="Solo minúsculas, números, guion y guion_bajo"
            maxLength={64}
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Título</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1">Contenido</label>
          <textarea
            name="body"
            value={form.body}
            onChange={onChange}
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={onChange}
          />
          <span className="text-sm">Publicado</span>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className={cx(
              "rounded-lg border px-2 py-1 text-xs",
              isFirst
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[hsl(var(--muted))]"
            )}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className={cx(
              "rounded-lg border px-2 py-1 text-xs",
              isLast
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[hsl(var(--muted))]"
            )}
          >
            ↓
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg border border-red-600 bg-red-600/90 px-3 py-1.5 text-xs text-white hover:bg-red-600 disabled:opacity-60"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={!dirty || busy}
            className={cx(
              "rounded-lg border px-3 py-1.5 text-xs",
              dirty && !busy
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25] hover:bg-[hsl(var(--primary))/0.92]"
                : "opacity-60 cursor-not-allowed"
            )}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
