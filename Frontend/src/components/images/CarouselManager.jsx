import React, { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { carouselService, filenameFromSrc } from "../../services/carouselService";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

/* =========================================================
 *  Helpers
 * =======================================================*/
const cx = (...xs) => xs.filter(Boolean).join(" ");

function pickBackendOrigin() {
  const env = import.meta.env.VITE_API_ORIGIN;
  if (typeof env === "string" && /^https?:\/\//i.test(env)) {
    try {
      return new URL(env).origin;
    } catch {
      console.error("Invalid VITE_API_ORIGIN:", env);
    }
  }
  const base = api?.defaults?.baseURL;
  if (typeof base === "string" && /^https?:\/\//i.test(base)) {
    try {
      return new URL(base).origin;
    } catch {
      console.error("Invalid baseURL:", base);
    }
  }
  return "http://localhost:8000";
}
const BACKEND_ORIGIN = pickBackendOrigin();

function resolveUrl(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // absoluta
  if (u.startsWith("/")) return `${BACKEND_ORIGIN}${u}`; // /storage/...
  return `${BACKEND_ORIGIN}/${u.replace(/^\/+/, "")}`; // storage/...
}

// 👉 construye la URL de descarga segura (no abre en el navegador)
function buildDownloadUrlFromSrc(src) {
  const filename = filenameFromSrc(src);
  return `${BACKEND_ORIGIN}/api/carrusel/${encodeURIComponent(filename)}/download`;
}

/* =========================================================
 *  UI Atoms (ligeros, sin libs externas)
 * =======================================================*/
const Icon = {
  Upload: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 16v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
      <path d="M9 3h6m-8 4h10m-1 0l-.7 11.2a1 1 0 01-1 .8H9.7a1 1 0 01-1-.8L8 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Download: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
      <path d="M12 4v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20H4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  ),
  X: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
};

function Badge({ children, tone = "muted", className }) {
  const tones = {
    muted: "bg-[hsl(var(--muted))] text-[hsl(var(--fg))/0.8]",
    primary: "bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]",
    danger: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={cx("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

function Button({ as:Comp = "button", variant = "solid", tone = "primary", className, children, ...rest }) {
  const variants = {
    solid: {
      primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.92)]",
      neutral: "bg-[hsl(var(--card))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--muted))]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    },
    soft: {
      primary: "bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.18]",
      neutral: "bg-[hsl(var(--muted))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--muted))/0.8]",
      danger: "bg-red-50 text-red-700 hover:bg-red-100",
    }
  };
  return (
    <Comp className={cx(
      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-[hsl(var(--border))/0.35] shadow-[0_1px_0_rgba(0,0,0,.04)]",
      variants[variant][tone],
      className
    )} {...rest}>
      {children}
    </Comp>
  );
}

/* =========================================================
 *  Componente principal
 * =======================================================*/
export default function CarouselManager({ className, onChanged, thumbFit = "contain" }) {
  const [items, setItems] = useState([]); // [{src, alt}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState(null); // {src, alt}
  const inputRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Variants de animación
  const listVariants = {
    visible: prefersReduced ? {} : { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };
  const cardVariants = prefersReduced ? {} : {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 24, mass: 0.6 } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } },
  };

  // Data
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await carouselService.list();
      const normalized = (Array.isArray(list) ? list : []).map((it) => ({ ...it, src: resolveUrl(it.src) }));
      setItems(normalized);
      onChanged?.(normalized);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el carrusel");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Handlers
  const onPick = (e) => { const f = e.target.files?.[0] || null; setFile(f); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0] || null; setFile(f); };
  const onUpload = async () => {
    if (!file) return;
    try {
      setBusy(true); setError("");
      await carouselService.upload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error subiendo imagen");
    } finally { setBusy(false); }
  };
  const onDelete = async (src) => {
    const name = filenameFromSrc(src);
    if (!confirm(`¿Eliminar ${name}?`)) return;
    try {
      setBusy(true); setError("");
      await carouselService.removeBySrc(src);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Error eliminando imagen");
    } finally { setBusy(false); }
  };

  const fitClass = thumbFit === "cover" ? "object-cover" : "object-contain";

  return (
    <section className={cx("space-y-5", className)}>
      {/* Header con métrica + acciones rápidas */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Gestión de carrusel</h2>
          <Badge tone="primary">{items.length} imagen{items.length === 1 ? "" : "es"}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="soft" tone="neutral" onClick={() => load()} disabled={loading || busy} aria-label="Recargar">
            <span className={cx("inline-block h-2 w-2 rounded-full",
              loading ? "animate-pulse bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]")}/>
            Recargar
          </Button>
          <Button onClick={() => inputRef.current?.click()} aria-label="Seleccionar imagen">
            <Icon.Upload/> Subir nueva
          </Button>
        </div>
      </header>

      {/* Uploader mejorado */}
      <motion.div
        className={cx(
          "rounded-2xl border border-dashed p-4 sm:p-5",
          dragOver ? "bg-[hsl(var(--muted))]" : "bg-[hsl(var(--card))]",
          "border-[hsl(var(--border))] shadow-[inset_0_1px_0_rgba(255,255,255,.03)]"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        animate={dragOver && !prefersReduced ? { scale: 1.01, boxShadow: "0 0 0 2px hsl(var(--primary)/0.35)" } : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-[hsl(var(--fg))/0.85]">
              Arrastra una imagen aquí o {" "}
              <button type="button" onClick={() => inputRef.current?.click()} className="underline underline-offset-4">
                explora tu equipo
              </button>
              .
            </p>
            <p className="text-xs text-[hsl(var(--fg))/0.6] mt-1">
              Formatos: jpg, jpeg, png, webp, avif. Tamaño según políticas del servidor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
            {file && (
              <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] max-w-[260px] truncate"
                title={file.name}>
                {file.name}
              </motion.span>
            )}
            <Button onClick={onUpload} disabled={!file || busy} aria-disabled={!file || busy}>
              {busy ? (
                <motion.span aria-hidden initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                  className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
              ) : (<Icon.Upload/>) }
              Subir
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Estado / errores */}
      <AnimatePresence>
        {error && (
          <motion.div key="error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-800 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700/80 hover:text-red-900"><Icon.X/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de imágenes */}
      <LayoutGroup>
        <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] animate-pulse" style={{ aspectRatio: "4 / 3" }} />
            ))
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
                <p className="text-[hsl(var(--fg))/0.8]">Aún no hay imágenes en el carrusel.</p>
                <p className="text-[hsl(var(--fg))/0.6] text-sm">Sube tu primera imagen para empezar ✨</p>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.figure layout key={it.src} variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                  whileHover={prefersReduced ? undefined : { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">

                  {/* Imagen con ratio fijo */}
                  <button type="button" className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]" style={{ aspectRatio: "4 / 3" }} onClick={() => setLightbox(it)}>
                    <motion.img src={it.src} alt={it.alt || "Imagen"}
                      className={cx("absolute inset-0 h-full w-full", fitClass, "bg-[hsl(var(--muted))]")}
                      loading="lazy" decoding="async"
                      onError={(e) => { e.currentTarget.style.opacity = 0.2; }}
                      whileHover={prefersReduced ? undefined : { scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    />
                  </button>

                  {/* Etiqueta (nombre/alt) */}
                  <figcaption className="absolute inset-x-2 bottom-2 rounded-md bg-black/45 px-2 py-1 text-[11px] text-white truncate backdrop-blur">
                    {it.alt || filenameFromSrc(it.src)}
                  </figcaption>

                  {/* Acciones */}
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute right-2 top-2 flex gap-2">
                    <a href={buildDownloadUrlFromSrc(it.src)} download
                       className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur px-2 py-1 text-xs hover:bg-[hsl(var(--muted))] inline-flex items-center gap-1">
                      <Icon.Download/> Descargar
                    </a>
                    <button type="button" onClick={() => onDelete(it.src)} disabled={busy}
                      className="rounded-lg border border-red-600 bg-red-600/90 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-60 inline-flex items-center gap-1">
                      <Icon.Trash/> Eliminar
                    </button>
                  </motion.div>
                </motion.figure>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </LayoutGroup>

      {/* Lightbox simple (framer-motion) */}
      <AnimatePresence>
        {lightbox && (
          <motion.div key="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center"
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.98, y: 6, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 6, opacity: 0 }}
              className="relative w-full max-w-4xl">
              <button onClick={() => setLightbox(null)} className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 h-8 w-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md">
                <Icon.X/>
              </button>
              <div className="relative w-full rounded-2xl overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <img src={lightbox.src} alt={lightbox.alt || "Imagen"} className="w-full h-auto object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
