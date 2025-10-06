// src/pages/admin/PracticeAreasAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { practiceAreasService as svc } from "../../services/practiceAreasService";
import { motion, AnimatePresence } from "framer-motion";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

/* ========= helpers de media ========= */
function toAbsolute(url) {
  if (!url) return url;
  const lower = String(url).toLowerCase();
  // No tocar blob:/data: ni ya-http(s)
  if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("blob:") || lower.startsWith("data:")) {
    return url;
  }
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/+$/,"");
  return `${base}${url}`; // ej: http://localhost:8000 + /storage/...
}

function ImgSafe({ src, alt = "", fallback = null, className, ...rest }) {
  const [err, setErr] = useState(false);
  const finalSrc = toAbsolute(src);

  if (!finalSrc) {
    return fallback ?? <span className="text-xs text-muted-foreground">Sin imagen</span>;
  }
  if (err) {
    return (
      <span
        title="No se pudo cargar la imagen"
        className={cx("inline-flex items-center justify-center rounded bg-[hsl(var(--muted))] text-[10px] px-1.5 py-0.5", className)}
      >
        img-error
      </span>
    );
  }
  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={(e) => { setErr(true); console.error("[ImgSafe] Error cargando:", e.currentTarget.src); }}
      className={className}
      {...rest}
    />
  );
}

/* ==================================== */

export default function PracticeAreasAdmin() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ featured: "", active: "" });
  const [sort, setSort] = useState("order,title");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function fetchData(p = page) {
    setLoading(true);
    try {
      const res = await svc.list({
        search: q || undefined,
        featured: filters.featured !== "" ? filters.featured : undefined,
        active: filters.active !== "" ? filters.active : undefined,
        sort, page: p, per_page: perPage,
      });
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(1); }, [q, filters, sort, perPage]);
  useEffect(() => { fetchData(page); }, [page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Áreas de práctica</h1>
          <p className="text-sm text-[hsl(var(--fg)/0.7)]">Administra Aduanas, Comercio Exterior, Cambiario, etc.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 hover:opacity-90"
        >
          + Nueva área
        </button>
      </header>

      {/* Filtros */}
      <section className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, slug, etc."
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        />
        <select
          value={filters.featured}
          onChange={(e) => setFilters((f) => ({ ...f, featured: e.target.value }))}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        >
          <option value="">Destacadas: Todas</option>
          <option value="1">Solo destacadas</option>
          <option value="0">No destacadas</option>
        </select>
        <select
          value={filters.active}
          onChange={(e) => setFilters((f) => ({ ...f, active: e.target.value }))}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        >
          <option value="">Estado: Todas</option>
          <option value="1">Activas</option>
          <option value="0">Inactivas</option>
        </select>
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2"
        >
          {[10,20,30,50].map(n => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </section>

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-[hsl(var(--border))]/70 rounded-lg overflow-hidden">
          <thead className="bg-[hsl(var(--muted))]">
            <tr className="text-left text-sm">
              <Th label="#" />
              <Th label="Orden" sortKey="order" sort={sort} setSort={setSort} />
              <Th label="Título" sortKey="title" sort={sort} setSort={setSort} />
              <Th label="Slug" sortKey="slug" sort={sort} setSort={setSort} />
              <Th label="Destacada" />
              <Th label="Activa" />
              <Th label="Actualizado" sortKey="updated_at" sort={sort} setSort={setSort} />
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]/60">
            <AnimatePresence initial={false}>
              {loading && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">Cargando…</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">Sin resultados.</td></tr>
              )}
              {!loading && items.map((r) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm"
                >
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      defaultValue={r.order ?? 0}
                      className="w-20 rounded border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] px-2 py-1"
                      onBlur={async (e) => {
                        const order = parseInt(e.target.value || "0", 10);
                        if (order !== r.order) { await svc.update(r.id, { order }); fetchData(); }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <ImgSafe src={r.icon ?? r?.debug?.absolute_url ?? r?.icon_url} className="h-6 w-6 rounded object-contain" />
                      <div className="min-w-0">
                        <div className="font-medium leading-tight">{r.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[280px]">{r.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.slug}</td>
                  <td className="px-3 py-2">
                    <Toggle
                      checked={!!r.featured}
                      label={r.featured ? "Sí" : "No"}
                      onChange={async () => { await svc.toggle(r.id, "featured"); fetchData(); }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Toggle
                      checked={!!r.active}
                      label={r.active ? "Sí" : "No"}
                      onChange={async () => { await svc.toggle(r.id, "active"); fetchData(); }}
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(r); setShowForm(true); }} className="rounded border px-2 py-1 hover:bg-[hsl(var(--muted))]">Editar</button>
                      <button onClick={() => setDeleting(r)} className="rounded border px-2 py-1 hover:bg-[hsl(var(--muted))] text-[hsl(var(--destructive))]">Eliminar</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {meta ? `Página ${meta.current_page} de ${meta.last_page} — ${meta.total} registros` : "—"}
        </div>
        <div className="flex gap-2">
          <button disabled={!meta || meta.current_page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded border px-3 py-1.5 disabled:opacity-50">←</button>
          <button disabled={!meta || meta.current_page >= meta.last_page} onClick={() => setPage(p => (meta ? Math.min(meta.last_page, p + 1) : p + 1))} className="rounded border px-3 py-1.5 disabled:opacity-50">→</button>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>{showForm && <FormModal initial={editing} onClose={(changed) => { setShowForm(false); if (changed) fetchData(); }} />}</AnimatePresence>
      <AnimatePresence>{deleting && (
        <ConfirmDialog
          title="Eliminar área"
          desc={`¿Seguro que deseas eliminar “${deleting.title}”?`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => { await svc.destroy(deleting.id); setDeleting(null); fetchData(); }}
        />
      )}</AnimatePresence>
    </div>
  );
}

/* Auxiliares */

function Th({ label, sortKey, sort, setSort }) {
  const isSortable = !!sortKey;
  const dir = useMemo(() => {
    if (!isSortable) return null;
    const parts = sort.split(",").map(s => s.trim());
    const hit = parts.find(p => p.replace("-", "") === sortKey);
    if (!hit) return null;
    return hit.startsWith("-") ? "desc" : "asc";
  }, [sort, sortKey]);

  function toggleSort() {
    if (!isSortable) return;
    const curr = dir ?? "none";
    let next;
    if (curr === "none") next = sortKey;
    else if (curr === "asc") next = `-${sortKey}`;
    else next = "";
    const parts = sort.split(",").filter(Boolean).map(s => s.trim()).filter(s => s.replace("-", "") !== sortKey);
    const newSort = [next, ...parts].filter(Boolean).join(",");
    setSort(newSort || sortKey);
  }

  return (
    <th className={cx("px-3 py-2 font-semibold select-none", isSortable && "cursor-pointer")} onClick={toggleSort} title={isSortable ? "Ordenar" : undefined}>
      <span className="inline-flex items-center gap-1">
        {label}
        {isSortable && <span className="text-xs text-muted-foreground">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "—"}</span>}
      </span>
    </th>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={onChange}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        checked ? "border-primary/60 bg-primary/10 text-primary" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      )}
    >
      <span className={cx("h-2.5 w-2.5 rounded-full", checked ? "bg-primary" : "bg-[hsl(var(--border))]")} />
      {label}
    </button>
  );
}

function ConfirmDialog({ title, desc, onCancel, onConfirm }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-3 py-1.5">Cancelar</button>
          <button onClick={onConfirm} className="rounded-lg bg-[hsl(var(--destructive))] text-white px-3 py-1.5">Eliminar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FormModal({ initial, onClose }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    subtitle: initial?.subtitle ?? "",
    excerpt: initial?.excerpt ?? "",
    icon_url: initial?.icon ?? "",   // viene absoluto del API
    to_path: initial?.to ?? "",
    order: initial?.order ?? 0,
    featured: !!initial?.featured,
    active: initial?.active ?? true,
    bullets: initial?.bullets ?? [""],
    iconFile: null,
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setBullet = (i, v) => setForm((f) => ({ ...f, bullets: f.bullets.map((b, idx) => idx === i ? v : b) }));
  const addBullet = () => setForm((f) => ({ ...f, bullets: [...f.bullets, ""] }));
  const removeBullet = (i) => setForm((f) => ({ ...f, bullets: f.bullets.filter((_, idx) => idx !== i) }));

  function acceptFile(file) {
    const okType = /^image\/(png|jpe?g|webp|svg\+xml)$/i.test(file.type);
    const okSize = file.size <= 4 * 1024 * 1024;
    if (!okType) throw new Error("Formato inválido (png, jpg, jpeg, webp, svg).");
    if (!okSize) throw new Error("La imagen debe pesar ≤ 4MB.");
  }

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { acceptFile(file); set("iconFile", file); setLocalPreview(URL.createObjectURL(file)); }
    catch (err) { setErr(err.message); }
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try { acceptFile(file); set("iconFile", file); setLocalPreview(URL.createObjectURL(file)); }
    catch (err) { setErr(err.message); }
  }

  async function onSubmit(e) {
    e?.preventDefault();
    setSaving(true); setErr(null);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        subtitle: form.subtitle || null,
        excerpt: form.excerpt || null,
        to_path: form.to_path || null,
        order: Number(form.order) || 0,
        featured: !!form.featured,
        active: !!form.active,
        bullets: (form.bullets ?? []).map((b) => String(b)).filter((b) => b.trim().length > 0),
        ...(form.iconFile ? {} : { icon_url: form.icon_url || null }),
        iconFile: form.iconFile ?? undefined,
      };
      if (isEdit) await svc.update(initial.id, payload);
      else await svc.create(payload);
      onClose(true);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
      <motion.form
        onSubmit={onSubmit}
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
      >
        <h3 className="text-lg font-semibold">{isEdit ? "Editar" : "Nueva"} área de práctica</h3>
        {err && <div className="mt-2 rounded border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] px-3 py-2 text-sm">{err}</div>}

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <Input label="Título *" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          <Input label="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="ej: aduanas" />
          <Input label="Subtítulo" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          <Input label="Ruta (to_path)" value={form.to_path} onChange={(e) => set("to_path", e.target.value)} placeholder="/areas/aduanas" />
          <Input label="Orden" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />

          {/* Uploader */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Icono / Foto</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cx(
                "flex items-center gap-3 rounded-lg border border-dashed px-3 py-3",
                dragOver ? "border-primary bg-primary/5" : "border-[hsl(var(--border))]/70"
              )}
            >
              <div className="size-16 rounded bg-[hsl(var(--muted))] overflow-hidden grid place-items-center">
                {(localPreview || form.icon_url)
                  ? <ImgSafe src={localPreview || form.icon_url} alt="preview" className="h-full w-full object-cover" />
                  : <span className="text-xs text-muted-foreground">Sin imagen</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Arrastra una imagen aquí o
                  <label className="mx-1 underline cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                    selecciónala
                  </label>
                  . PNG/JPG/WEBP/SVG · máx 4MB.
                </p>
                {!localPreview && form.icon_url && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">Actual: {toAbsolute(form.icon_url)}</p>
                )}
              </div>
              {localPreview && (
                <button
                  type="button"
                  onClick={() => { set("iconFile", null); setLocalPreview(null); }}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-[hsl(var(--muted))]"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Bullets</label>
            <div className="space-y-2">
              {form.bullets.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={b}
                    onChange={(e) => setBullet(i, e.target.value)}
                    className="flex-1 rounded-lg border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] px-3 py-2"
                    placeholder={`Punto #${i + 1}`}
                  />
                  <button type="button" onClick={() => removeBullet(i)} className="rounded-lg border px-3 py-2 hover:bg-[hsl(var(--muted))]">
                    Quitar
                  </button>
                </div>
              ))}
              <button type="button" onClick={addBullet} className="rounded-lg border px-3 py-2 hover:bg-[hsl(var(--muted))]">
                + Agregar bullet
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Checkbox checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
            <Checkbox checked={form.active} onChange={(v) => set("active", v)} label="Activa" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => onClose(false)} className="rounded-lg border px-4 py-2">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 disabled:opacity-60">
            {saving ? "Guardando…" : (isEdit ? "Guardar cambios" : "Crear")}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Input({ label, className, ...rest }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input {...rest} className={cx("w-full rounded-lg border border-[hsl(var(--border))]/70 bg-[hsl(var(--card))] px-3 py-2", className)} />
    </label>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]" />
      {label}
    </label>
  );
}
