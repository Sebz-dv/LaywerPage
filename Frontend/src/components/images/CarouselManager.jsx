import React, { useEffect, useRef, useState } from "react";
import {
  carouselService,
  filenameFromSrc,
} from "../../services/carouselService";
import { api } from "../../lib/api";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

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
  if (/^https?:\/\//i.test(u)) return u; // ya absoluta
  if (u.startsWith("/")) return `${BACKEND_ORIGIN}${u}`; // /storage/...
  return `${BACKEND_ORIGIN}/${u.replace(/^\/+/, "")}`; // storage/...
}

// 👉 construye la URL de descarga segura (no abre en el navegador)
function buildDownloadUrlFromSrc(src) {
  const filename = filenameFromSrc(src);
  return `${BACKEND_ORIGIN}/api/carrusel/${encodeURIComponent(
    filename
  )}/download`;
}

export default function CarouselManager({
  className,
  onChanged,
  thumbFit = "contain",
}) {
  const [items, setItems] = useState([]); // [{src, alt}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await carouselService.list();
      const normalized = (Array.isArray(list) ? list : []).map((it) => ({
        ...it,
        src: resolveUrl(it.src),
      }));
      setItems(normalized);
      onChanged?.(normalized);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el carrusel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const onPick = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    setFile(f);
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      setBusy(true);
      setError("");
      await carouselService.upload(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Error subiendo imagen"
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (src) => {
    const name = filenameFromSrc(src);
    if (!confirm(`¿Eliminar ${name}?`)) return;
    try {
      setBusy(true);
      setError("");
      await carouselService.removeBySrc(src);
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Error eliminando imagen"
      );
    } finally {
      setBusy(false);
    }
  };

  const fitClass = thumbFit === "cover" ? "object-cover" : "object-contain";

  return (
    <section className={cx("space-y-4", className)}>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gestión de carrusel</h2>
        <span className="text-sm text-[hsl(var(--fg))/0.6]">
          {items.length} imagen{items.length === 1 ? "" : "es"}
        </span>
      </header>

      {/* Uploader */}
      <div
        className={cx(
          "rounded-2xl border border-dashed p-4",
          dragOver ? "bg-[hsl(var(--muted))]" : "bg-[hsl(var(--card))]",
          "border-[hsl(var(--border))]"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-[hsl(var(--fg))/0.8]">
              Arrastra una imagen aquí o{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="underline underline-offset-4"
              >
                explora
              </button>
              .
            </p>
            <p className="text-xs text-[hsl(var(--fg))/0.6) mt-1]">
  Formatos: jpg, jpeg, png, webp, avif. Sin límite (según servidor).
</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onPick}
              className="hidden"
            />
            {file && (
              <span className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] max-w-[260px] truncate">
                {file.name}
              </span>
            )}
            <button
              type="button"
              onClick={onUpload}
              disabled={!file || busy}
              className={cx(
                "rounded-xl px-3 py-2 text-sm font-medium border",
                "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25]",
                !file || busy
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[hsl(var(--primary))/0.92]"
              )}
            >
              Subir
            </button>
          </div>
        </div>
      </div>

      {/* Estado / errores */}
      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] animate-pulse"
              style={{ aspectRatio: "4 / 3" }}
            />
          ))
        ) : items.length === 0 ? (
          <p className="col-span-full text-[hsl(var(--fg))/0.7]">
            No hay imágenes.
          </p>
        ) : (
          items.map((it) => (
            <figure
              key={it.src}
              className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              {/* wrapper con ratio fijo */}
              <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={it.src}
                  alt={it.alt || "Imagen"}
                  className={cx(
                    "absolute inset-0 h-full w-full",
                    fitClass,
                    "bg-[hsl(var(--muted))]"
                  )}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.opacity = 0.2;
                  }}
                />
              </div>

              <figcaption className="absolute inset-x-0 bottom-0 m-2 rounded bg-black/40 px-2 py-1 text-[11px] text-white truncate">
                {it.alt || filenameFromSrc(it.src)}
              </figcaption>

              <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* ✅ Solo descargar: NO abrir en navegador */}
                <a
                  href={buildDownloadUrlFromSrc(it.src)}
                  download
                  className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur px-2 py-1 text-xs hover:bg-[hsl(var(--muted))]"
                >
                  Descargar
                </a>

                <button
                  type="button"
                  onClick={() => onDelete(it.src)}
                  disabled={busy}
                  className="rounded-lg border border-red-600 bg-red-600/90 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </div>
            </figure>
          ))
        )}
      </div>
    </section>
  );
}
