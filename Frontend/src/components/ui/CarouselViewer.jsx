// LawFirmCarousel.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import { carouselService } from "../../services/carouselService";

// utilidades
const cx = (...xs) => xs.filter(Boolean).join(" ");
const clampIndex = (n, c) => (c === 0 ? 0 : ((n % c) + c) % c);

function pickBackendOrigin() {
  const env = import.meta.env?.VITE_API_ORIGIN;
  if (typeof env === "string" && /^https?:\/\//i.test(env)) {
    try { return new URL(env).origin; } catch {}
  }
  const base = api?.defaults?.baseURL;
  if (typeof base === "string" && /^https?:\/\//i.test(base)) {
    try { return new URL(base).origin; } catch {}
  }
  return "http://localhost:8000";
}
const BACKEND_ORIGIN = pickBackendOrigin();

function resolveUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (/^https?:\/\//i.test(s) || /^(data:|blob:)/i.test(s)) return s;
  if (s.startsWith("/")) return `${BACKEND_ORIGIN}${s}`;
  return `${BACKEND_ORIGIN}/${s.replace(/^\/+/, "")}`;
}

// Media query mínima
function useMedia(query) {
  const [m, setM] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const h = () => setM(mq.matches);
    h(); mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return m;
}

/**
 * Carrusel sobrio para firmas de abogados.
 * - Sin botón de descarga ni tarjetas inferiores.
 * - Flechas “ghost glass” y bullets minimal.
 * - Overlay elegante para título y subtítulo.
 */
export default function LawFirmCarousel({
  className,
  mobileAspect = "16/9",
  desktopAspect = "21/9",
  rounded = "rounded-2xl",
  autoplay = true,
  interval = 4500,
  loop = true,
  showDots = true,
  showArrows = true,
  pauseOnHover = true,
  slideFit = "cover", // "cover" | "contain"
}) {
  const [items, setItems] = useState([]); // [{ src, alt, title, subtitle }]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [index, setIndex] = useState(0);
  const [isHover, setHover] = useState(false);
  const trackRef = useRef(null);

  // Swipe (tacto/mouse)
  const startX = useRef(0);
  const deltaX = useRef(0);
  const dragging = useRef(false);

  const isMdUp = useMedia("(min-width: 768px)");
  const fitClass = slideFit === "cover" ? "object-cover" : "object-contain";

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const list = await carouselService.list();
      const normalized = (Array.isArray(list) ? list : []).map((it) => ({
        ...it,
        src: resolveUrl(it.src),
      }));
      setItems(normalized);
      setIndex((i) => clampIndex(i, normalized.length));
    } catch (e) {
      setErr(e?.message || "No se pudo cargar el carrusel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const count = items.length;
  const goTo = useCallback((i) => setIndex(clampIndex(i, count)), [count]);
  const next = useCallback(
    () => setIndex((i) => (loop ? clampIndex(i + 1, count) : Math.min(i + 1, count - 1))),
    [count, loop]
  );
  const prev = useCallback(
    () => setIndex((i) => (loop ? clampIndex(i - 1, count) : Math.max(i - 1, 0))),
    [count, loop]
  );

  // autoplay
  useEffect(() => {
    if (!autoplay || count <= 1) return;
    if (pauseOnHover && isHover) return;
    const id = setInterval(next, Math.max(2000, interval));
    return () => clearInterval(id);
  }, [autoplay, interval, next, count, isHover, pauseOnHover]);

  // relación de aspecto responsive
  const padTop = useMemo(() => {
    const aspect = isMdUp ? desktopAspect : mobileAspect;
    const [w, h] = aspect.split("/").map((n) => Number(n) || 0);
    return w > 0 && h > 0 ? (h / w) * 100 : 56.25;
  }, [isMdUp, desktopAspect, mobileAspect]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
    if (e.key === "Home")       { e.preventDefault(); goTo(0); }
    if (e.key === "End")        { e.preventDefault(); goTo(count - 1); }
  };

  // Handlers de swipe
  const onPointerDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = 0;
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = x - startX.current;
    // desplazamiento visual opcional
    if (trackRef.current) {
      const pct = (-index * 100) + (deltaX.current / (trackRef.current.offsetWidth || 1)) * 100;
      trackRef.current.style.transform = `translateX(${pct}%)`;
    }
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const threshold = (trackRef.current?.offsetWidth || 300) * 0.15;
    if (deltaX.current < -threshold) next();
    else if (deltaX.current > threshold) prev();
    // reset transform controlado por estado
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
    deltaX.current = 0;
  };

  return (
    <section className={cx("w-full", className)}>
      {err && (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}

      {/* wrapper centrado a 90vw para hero sobrio */}
      <div
        className="relative left-1/2 -translate-x-1/2 w-[90vw] select-none"
        aria-roledescription="carousel"
        aria-label="Carrusel de la firma"
        onMouseEnter={pauseOnHover ? () => setHover(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setHover(false) : undefined}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div
          className={cx(
            "relative overflow-hidden border bg-[hsl(var(--card))]",
            "border-[hsl(var(--border))]",
            "shadow-sm",
            rounded
          )}
        >
          {/* máscara sutil en bordes para look editorial */}
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_100%_at_50%_50%,#000_65%,transparent_100%)]" />

          {/* ratio */}
          <div style={{ paddingTop: `${padTop}%` }} />

          {/* track */}
          <div
            ref={trackRef}
            className="absolute inset-0 flex h-full w-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
          >
            {loading ? (
              <SkeletonSlide />
            ) : count === 0 ? (
              <EmptySlide />
            ) : (
              items.map((it, i) => (
                <Slide
                  key={it.src || i}
                  src={it.src}
                  alt={it.alt || `Imagen ${i + 1} de ${count}`}
                  title={it.title}
                  subtitle={it.subtitle}
                  fitClass={fitClass}
                  index={i}
                  count={count}
                />
              ))
            )}
          </div>

          {/* Flechas ghost-glass (sin descarga, sin extras) */}
          {showArrows && count > 1 && !loading && (
            <>
              <NavButton dir="prev" onClick={prev} ariaLabel="Anterior" />
              <NavButton dir="next" onClick={next} ariaLabel="Siguiente" />
            </>
          )}

          {/* Línea de progreso sutil del autoplay */}
          {autoplay && count > 1 && (
            <AutoplayBar key={index} duration={Math.max(2000, interval)} />
          )}
        </div>

        {/* Bullets minimal (sin miniaturas ni tarjetas) */}
        {showDots && count > 1 && !loading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la imagen ${i + 1} de ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cx(
                  "h-1.5 w-6 rounded-full transition-all",
                  i === index
                    ? "bg-[hsl(var(--brand))]"
                    : "bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ===== Subcomponentes =====

function Slide({ src, alt, title, subtitle, fitClass, index, count }) {
  return (
    <figure
      className="relative h-full w-full shrink-0"
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} de ${count}`}
    >
      <img
        src={src}
        alt={alt}
        className={cx(
          "absolute inset-0 h-full w-full bg-[hsl(var(--muted))]",
          fitClass
        )}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(e) => { e.currentTarget.style.opacity = 0.2; }}
        sizes="90vw"
      />
      {/* Overlay legal sobrio */}
      {(title || subtitle) && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex max-w-[95%] flex-col gap-1 rounded-xl bg-[hsl(var(--brand))/0.75] px-4 py-3 text-[hsl(var(--brand-contrast))] shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur">
              {title && (
                <h3 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm opacity-90">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </figcaption>
      )}
      {/* Sello discreto arriba-izquierda (marca/área de práctica) */}
      <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
        <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))/0.7] bg-[hsl(var(--card))/0.6] px-2 py-1 text-[10px] font-medium uppercase tracking-wide backdrop-blur">
          <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
            <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" fill="currentColor" />
          </svg>
          Firma Legal
        </span>
      </div>
    </figure>
  );
}

function NavButton({ dir, onClick, ariaLabel }) {
  const cls =
    "group absolute top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/75 backdrop-blur transition hover:bg-[hsl(var(--muted))]/90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]";
  const side = dir === "prev" ? "left-3" : "right-3";
  const icon =
    dir === "prev"
      ? "M14 18l-6-6 6-6"
      : "M10 6l6 6-6 6";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cx(cls, side)}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-active:scale-90"
        aria-hidden
      >
        <path d={icon}></path>
      </svg>
      {/* micro “hint” arriba del botón al hover en desktop */}
      <span className={cx(
        "pointer-events-none absolute -top-9 rounded-md px-2 py-1 text-[11px]",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 shadow-sm",
        "opacity-0 transition group-hover:opacity-100"
      )}>
        {dir === "prev" ? "Anterior" : "Siguiente"}
      </span>
    </button>
  );
}

function SkeletonSlide() {
  return (
    <div className="relative h-full w-full shrink-0">
      <div className="absolute inset-0 animate-pulse bg-[hsl(var(--muted))]" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-2 w-40 animate-pulse rounded-full bg-[hsl(var(--border))]" />
    </div>
  );
}

function EmptySlide() {
  return (
    <div className="relative h-full w-full shrink-0 flex items-center justify-center">
      <p className="text-[hsl(var(--fg))/0.7]">Aún no hay imágenes.</p>
    </div>
  );
}

function AutoplayBar({ duration = 4000 }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5">
      <span
        className="block h-full bg-[hsl(var(--brand))]"
        style={{ animation: `lfc-progress ${duration}ms linear forwards` }}
      />
      <style>{`
        @keyframes lfc-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
