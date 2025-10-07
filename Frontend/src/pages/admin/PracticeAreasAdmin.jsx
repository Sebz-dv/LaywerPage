// src/pages/admin/PracticeAreasAdmin.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { practiceAreasService as svc } from "../../services/practiceAreasService"; // baseURL: http://localhost:8000/api
import { motion, AnimatePresence } from "framer-motion";

/* ================== Utils ================== */
function cx(...xs) { return xs.filter(Boolean).join(" "); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const toInt = (v, d = 0) => Number.isFinite(+v) ? +v : d;

const parseBullets = (text) =>
  (text ?? "")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

const bulletsToText = (arr) => Array.isArray(arr) ? arr.join("\n") : "";

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

/* ================== Página ================== */
export default function PracticeAreasAdmin() {
  // Tabla
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  // Controles
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ featured: "", active: "" });
  const [sort, setSort] = useState("order,title");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Confirm
  const [confirm, setConfirm] = useState(null); // { id, title }

  // Toast simple
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const pushToast = (t) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // Fetch
  async function fetchData(p = page) {
    setLoading(true);
    try {
      const params = {
        q,
        sort,
        per_page: perPage,
        page: p,
      };
      if (filters.featured !== "") params.featured = filters.featured;
      if (filters.active !== "") params.active = filters.active;

      const res = await svc.list(params);
      const data = res?.data ?? res?.data?.data ?? res?.data ?? [];
      const m = res?.meta ?? res?.data?.meta ?? null;
      setItems(data);
      setMeta(m);
      setPage(m?.current_page ?? p);
    } catch (err) {
      pushToast({ type: "error", title: "Error cargando áreas", desc: err?.message ?? "Fallo inesperado" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, JSON.stringify(filters), sort, perPage]);

  // Handlers
  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (row) => { setEditing(row); setShowForm(true); };
  const onDelete = (row) => setConfirm({ id: row.id, title: row.title });

  const confirmDelete = async () => {
    if (!confirm?.id) return;
    try {
      await svc.remove(confirm.id);
      setItems((xs) => xs.filter(x => x.id !== confirm.id));
      pushToast({ type: "success", title: "Área eliminada" });
    } catch (err) {
      pushToast({ type: "error", title: "No se pudo eliminar", desc: err?.message });
    } finally {
      setConfirm(null);
    }
  };

  const onToggle = async (row, field) => {
    try {
      const updated = await svc.toggle(row.id, field);
      setItems(xs => xs.map(x => x.id === row.id ? (updated?.data ?? updated) : x));
    } catch (err) {
      pushToast({ type: "error", title: "No se pudo cambiar el estado", desc: err?.message });
    }
  };

  const onInlineOrder = async (row, newOrder) => {
    try {
      const updated = await svc.update(row.id, { order: toInt(newOrder, row.order ?? 0) });
      setItems(xs => xs.map(x => x.id === row.id ? (updated?.data ?? updated) : x));
    } catch (err) {
      pushToast({ type: "error", title: "No se pudo actualizar el orden", desc: err?.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Áreas de práctica</h1>
          <p className="text-sm text-[hsl(var(--fg)/0.6)]">Gestiona las áreas visibles en la página pública.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90"
          >
            + Nueva área
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-[hsl(var(--border))] p-3 mb-4 bg-[hsl(var(--card))]">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, subtítulo o resumen…"
            className="w-full md:max-w-sm rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.featured}
              onChange={(e) => setFilters(f => ({ ...f, featured: e.target.value }))}
              className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Destacadas: Todas</option>
              <option value="1">Solo destacadas</option>
              <option value="0">No destacadas</option>
            </select>

            <select
              value={filters.active}
              onChange={(e) => setFilters(f => ({ ...f, active: e.target.value }))}
              className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
            >
              <option value="">Estado: Todas</option>
              <option value="1">Activas</option>
              <option value="0">Inactivas</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
            >
              <option value="order,title">Orden + Título</option>
              <option value="title">Título (A–Z)</option>
              <option value="-created_at">Más recientes</option>
              <option value="created_at">Más antiguas</option>
            </select>

            <select
              value={perPage}
              onChange={(e) => setPerPage(+e.target.value)}
              className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
            >
              {[6,12,24,48].map(n => <option key={n} value={n}>{n} / página</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[hsl(var(--muted))]">
              <tr className="text-left">
                <th className="px-3 py-2 w-14">Icono</th>
                <th className="px-3 py-2">Título</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Subtítulo</th>
                <th className="px-3 py-2 w-24">Orden</th>
                <th className="px-3 py-2 w-44">Flags</th>
                <th className="px-3 py-2 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-[hsl(var(--fg)/0.6)]">Cargando…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-[hsl(var(--fg)/0.6)]">Sin resultados</td></tr>
              )}
              {!loading && items.map((row) => (
                <tr key={row.id} className="border-t border-[hsl(var(--border))]">
                  <td className="px-3 py-2">
                    {row.icon ? (
                      <img
                        src={row.icon}
                        alt=""
                        className="h-10 w-10 rounded-md object-contain bg-[hsl(var(--muted))]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-[hsl(var(--muted))]" />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{row.title}</td>
                  <td className="px-3 py-2 text-[hsl(var(--fg)/0.7)]">{row.slug}</td>
                  <td className="px-3 py-2 text-[hsl(var(--fg)/0.8)]">{row.subtitle ?? "—"}</td>
                  <td className="px-3 py-2">
                    <input
                      defaultValue={row.order ?? 0}
                      onBlur={(e) => {
                        const v = toInt(e.target.value, row.order ?? 0);
                        if (v !== row.order) onInlineOrder(row, v);
                      }}
                      type="number"
                      className="w-20 rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Badge
                        onClick={() => onToggle(row, "active")}
                        color={row.active ? "success" : "destructive"}
                        title={row.active ? "Activa" : "Inactiva"}
                        clickable
                      />
                      <Badge
                        onClick={() => onToggle(row, "featured")}
                        color={row.featured ? "warning" : "muted"}
                        title={row.featured ? "Destacada" : "No destacada"}
                        clickable
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(row)}
                        className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="px-3 py-1.5 rounded-lg border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.06)]"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[hsl(var(--border))]">
          <div className="text-xs text-[hsl(var(--fg)/0.6)]">
            {meta ? (
              <>Página {meta.current_page} de {meta.last_page} — {meta.total} registros</>
            ) : (<>—</>)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => meta?.prev_page_url && fetchData(page - 1)}
              disabled={!meta || meta.current_page <= 1}
              className={cx(
                "px-3 py-1.5 rounded-lg border",
                (!meta || meta.current_page <= 1)
                  ? "border-[hsl(var(--border))] text-[hsl(var(--fg)/0.5)] cursor-not-allowed"
                  : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              )}
            >
              Anterior
            </button>
            <button
              onClick={() => meta?.next_page_url && fetchData(page + 1)}
              disabled={!meta || meta.current_page >= meta.last_page}
              className={cx(
                "px-3 py-1.5 rounded-lg border",
                (!meta || meta.current_page >= meta.last_page)
                  ? "border-[hsl(var(--border))] text-[hsl(var(--fg)/0.5)] cursor-not-allowed"
                  : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
              )}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar con SCROLL */}
      <AnimatePresence>
        {showForm && (
          <FormModal
            key={editing?.id ?? "new"}
            editing={editing}
            onClose={() => setShowForm(false)}
            onSaved={async () => {
              setShowForm(false);
              pushToast({ type: "success", title: editing ? "Cambios guardados" : "Área creada" });
              await sleep(120);
              fetchData(page);
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            title="Eliminar área"
            message={<>¿Seguro que deseas eliminar <b>{confirm.title}</b>? Esta acción no se puede deshacer.</>}
            onCancel={() => setConfirm(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={cx(
              "fixed bottom-4 right-4 rounded-xl px-4 py-3 shadow-lg border",
              toast.type === "success" && "bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success))]",
              toast.type === "error"   && "bg-[hsl(var(--destructive)/0.08)] border-[hsl(var(--destructive))]"
            )}
          >
            <div className="text-sm font-medium">{toast.title}</div>
            {toast.desc && <div className="text-xs opacity-80">{toast.desc}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================== Subcomponentes ================== */

function Badge({ title, color = "muted", clickable = false, onClick }) {
  const map = {
    muted:        "bg-[hsl(var(--muted))] text-[hsl(var(--fg))]",
    success:      "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.4)]",
    warning:      "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] border border-[hsl(var(--warning)/0.4)]",
    destructive:  "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.4)]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "px-2 py-1 rounded-full text-xs font-medium",
        map[color],
        clickable && "hover:opacity-90"
      )}
    >
      {title}
    </button>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-2 text-sm text-[hsl(var(--fg)/0.8)]">{message}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))]">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-3 py-1.5 rounded-lg bg-[hsl(var(--destructive))] text-white">
            Eliminar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormModal({ editing, onClose, onSaved }) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    title: editing?.title ?? "",
    subtitle: editing?.subtitle ?? "",
    excerpt: editing?.excerpt ?? "",
    body: editing?.body ?? "",
    slug: editing?.slug ?? "",
    bulletsText: bulletsToText(editing?.bullets),
    featured: !!editing?.featured,
    active: editing?.active ?? true,
    order: editing?.order ?? 0,
    icon_url: editing?.icon ?? "",
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(editing?.icon ?? "");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("content"); // content | media

  const onPickFile = async (file) => {
    if (!file) return;
    setIconFile(file);
    const dataUrl = await readAsDataUrl(file).catch(() => "");
    setIconPreview(dataUrl);
    setForm(f => ({ ...f, icon_url: "" })); // limpiar url si hay archivo
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await onPickFile(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        excerpt: form.excerpt || null,
        body: form.body || null,
        slug: form.slug || null,
        bullets: parseBullets(form.bulletsText),
        featured: form.featured ? 1 : 0,
        active: form.active ? 1 : 0,
        order: toInt(form.order, 0),
      };

      if (iconFile) payload.icon = iconFile;
      else if (form.icon_url) payload.icon_url = form.icon_url;

      const res = isEdit
        ? await svc.update(editing.id, payload)
        : await svc.create(payload);

      await sleep(120);
      onSaved(res?.data ?? res);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={onSubmit}
        initial={{ y: 18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        className="w-full max-w-3xl max-h-[85svh] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col"
      >
        {/* Header fijo */}
        <div className="sticky top-0 z-10 px-5 pt-5 pb-3 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{isEdit ? "Editar área" : "Nueva área"}</h3>
              <p className="text-xs text-[hsl(var(--fg)/0.6)]">Los cambios se reflejan en la web pública.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 rounded-lg border border-[hsl(var(--border))]"
            >
              Cerrar
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={cx(
                "px-3 py-1.5 rounded-lg border",
                tab === "content" ? "bg-[hsl(var(--muted))]" : "border-[hsl(var(--border))]"
              )}
            >
              Contenido
            </button>
            <button
              type="button"
              onClick={() => setTab("media")}
              className={cx(
                "px-3 py-1.5 rounded-lg border",
                tab === "media" ? "bg-[hsl(var(--muted))]" : "border-[hsl(var(--border))]"
              )}
            >
              Media
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-5 py-4 grow">
          {tab === "content" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs">Subtítulo</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs">Slug (opcional)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                  placeholder="se-generará-desde-el-titulo"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs">Resumen / Excerpt</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs">Cuerpo (opcional)</label>
                <textarea
                  rows={5}
                  value={form.body}
                  onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs">Bullets (una por línea)</label>
                <textarea
                  rows={4}
                  value={form.bulletsText}
                  onChange={(e) => setForm(f => ({ ...f, bulletsText: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs">Orden</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))}
                  />
                  Destacada
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                  />
                  Activa
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="rounded-xl border border-[hsl(var(--border))] p-4"
              >
                <div className="text-xs mb-2">Icono (subir archivo)</div>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md bg-[hsl(var(--muted))] overflow-hidden">
                    {iconPreview ? (
                      <img src={iconPreview} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <label className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--muted))]">
                    Elegir archivo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      hidden
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <p className="text-xs opacity-70 mt-2">También puedes arrastrar y soltar aquí. Máx 4MB.</p>
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] p-4">
                <div className="text-xs mb-2">o usar URL externa</div>
                <input
                  value={form.icon_url}
                  onChange={(e) => {
                    setForm(f => ({ ...f, icon_url: e.target.value }));
                    if (!iconFile) setIconPreview(e.target.value);
                  }}
                  placeholder="https://.../icon.svg"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm"
                />
                <p className="text-xs opacity-70 mt-2">Si subes archivo, la URL se ignora.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer fijo */}
        <div className="sticky bottom-0 z-10 px-5 py-4 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-[hsl(var(--border))]"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="px-3 py-2 rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando…" : (isEdit ? "Guardar cambios" : "Crear")}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
