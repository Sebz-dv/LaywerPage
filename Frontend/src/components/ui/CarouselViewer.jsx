// LawFirmCarousel.jsx
"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// ✅ Usa tu axios configurado y helper para assets (igual que en TeamFinder)
import { api } from "../../lib/api";
import { resolveAssetUrl } from "../../lib/origin";
import { carouselService } from "../../services/carouselService";

// utils
const cx = (...xs) => xs.filter(Boolean).join(" ");
const clampIndex = (n, c) => (c === 0 ? 0 : ((n % c) + c) % c);

function useReducedMotion() {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setPref(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return pref;
}

function useOnScreen(ref, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(true);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => setIntersecting(e.isIntersecting),
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

/**
 * Carrusel sobrio para firmas de abogados.
 * Optimizado para imágenes 1920×823 y 2560×1097 (misma relación).
 */
export default function LawFirmCarousel({
  className,
  autoplay = true,
  interval = 4500,
  loop = true,
  showDots = true,
  showArrows = true,
  pauseOnHover = true,
  slideFit = "cover", // "cover" | "contain"
  aspectRatio = "1920 / 823",
}) {
  const [items, setItems] = useState([]); // [{ src, alt, title, subtitle }]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [index, setIndex] = useState(0);
  const [isHover, setHover] = useState(false);

  const rootRef = useRef(null);
  const trackRef = useRef(null);

  // Swipe
  const startX = useRef(0);
  const deltaX = useRef(0);
  const dragging = useRef(false);

  const fitClass = slideFit === "cover" ? "object-cover" : "object-contain";
  const prefersReduced = useReducedMotion();
  const onScreen = useOnScreen(rootRef, "50px");

  // ✅ Carga usando tu servicio y normalizando con resolveAssetUrl
  const load = useCallback(async (signal) => {
    setLoading(true);
    setErr("");
    try {
      const list = await carouselService.list({ signal });
      const normalized = (Array.isArray(list) ? list : []).map((it) => ({
        ...it,
        src: resolveAssetUrl(it?.src),
      }));
      setItems(normalized);
      setIndex((i) => clampIndex(i, normalized.length));
    } catch (e) {
      // Ignora aborts
      if (e?.name === "CanceledError" || e?.name === "AbortError") return;
      setErr(e?.message || "No se pudo cargar el carrusel");
    } finally {
      setLoading(false);
    }
  }, []);

  // Montaje + abort seguro
  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const count = items.length;
  const goTo = useCallback((i) => setIndex(clampIndex(i, count)), [count]);
  const next = useCallback(
    () =>
      setIndex((i) =>
        loop ? clampIndex(i + 1, count) : Math.min(i + 1, count - 1)
      ),
    [count, loop]
  );
  const prev = useCallback(
    () =>
      setIndex((i) => (loop ? clampIndex(i - 1, count) : Math.max(i - 1, 0))),
    [count, loop]
  );

  // autoplay (pausa si no está en pantalla o hover)
  useEffect(() => {
    if (!autoplay || count <= 1) return;
    if (pauseOnHover && isHover) return;
    if (!onScreen) return;
    const id = setInterval(next, Math.max(2000, interval));
    return () => clearInterval(id);
  }, [autoplay, interval, next, count, isHover, pauseOnHover, onScreen]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      goTo(count - 1);
    }
  };

  // Handlers de swipe
  const onPointerDown = (e) => {
    if (!trackRef.current) return;
    dragging.current = true;
    trackRef.current.setPointerCapture?.(e.pointerId);
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = 0;
  };
  const onPointerMove = (e) => {
    if (!dragging.current || !trackRef.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = x - startX.current;
    const w = trackRef.current.offsetWidth || 1;
    const pct = -index * 100 + (deltaX.current / w) * 100;
    trackRef.current.style.transform = `translate3d(${pct}%,0,0)`;
  };
  const endDrag = () => {
    if (!dragging.current || !trackRef.current) return;
    const threshold = (trackRef.current.offsetWidth || 300) * 0.15;
    if (deltaX.current < -threshold) next();
    else if (deltaX.current > threshold) prev();
    // reset transform (estado manda)
    trackRef.current.style.transform = `translate3d(-${index * 100}%,0,0)`;
    dragging.current = false;
    deltaX.current = 0;
  };

  // Prefetch de la siguiente imagen
  useEffect(() => {
    if (count <= 1) return;
    const nxt = (index + 1) % count;
    const src = items[nxt]?.src;
    if (!src) return;
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = src;
  }, [index, count, items]);

  const transitionCls = prefersReduced
    ? "transition-none"
    : "transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)]";

  return (
    <section className={cx("w-full", className)}>
      {err && (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}

      <div
        ref={rootRef}
        className="relative w-full select-none outline-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Carrusel de la firma"
        onMouseEnter={pauseOnHover ? () => setHover(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setHover(false) : undefined}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div
          className={cx(
            "relative w-full overflow-hidden border bg-[hsl(var(--card))]",
            "border-[hsl(var(--border))] shadow-sm"
          )}
          style={{ aspectRatio }}
        >
          {/* máscara sutil */}
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_100%_at_50%_50%,#000_65%,transparent_100%)]" />

          {/* track */}
          <div
            ref={trackRef}
            className={cx(
              "absolute inset-0 flex h-full w-full will-change-transform",
              transitionCls
            )}
            style={{ transform: `translate3d(-${index * 100}%,0,0)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={endDrag}
            onMouseLeave={endDrag}
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
                  priority={i === 0}
                />
              ))
            )}
          </div>

          {/* Flechas */}
          {showArrows && count > 1 && !loading && (
            <>
              <NavButton dir="prev" onClick={prev} ariaLabel="Anterior" />
              <NavButton dir="next" onClick={next} ariaLabel="Siguiente" />
            </>
          )}

          {/* Progreso autoplay */}
          {autoplay && count > 1 && !prefersReduced && (
            <AutoplayBar key={index} duration={Math.max(2000, interval)} />
          )}
        </div>

        {/* Bullets */}
        {showDots && count > 1 && !loading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la imagen ${i + 1} de ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cx(
                  "h-1.5 w-6 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
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

function Slide({
  src,
  alt,
  title,
  subtitle,
  fitClass,
  index,
  count,
  priority,
}) {
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
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.opacity = 0.25;
        }}
        sizes="100vw"
      />

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
                <p className="text-xs sm:text-sm opacity-90">{subtitle}</p>
              )}
            </div>
          </div>
        </figcaption>
      )}
    </figure>
  );
}

function NavButton({ dir, onClick, ariaLabel }) {
  const cls =
    "group absolute top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/75 backdrop-blur transition hover:bg-[hsl(var(--muted))]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]";
  const side = dir === "prev" ? "left-3" : "right-3";
  const icon = dir === "prev" ? "M14 18l-6-6 6-6" : "M10 6l6 6-6 6";
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
      <span
        className={cx(
          "pointer-events-none absolute -top-9 rounded-md px-2 py-1 text-[11px]",
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 shadow-sm",
          "opacity-0 transition group-hover:opacity-100"
        )}
      >
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
    <div className="relative flex h-full w-full shrink-0 items-center justify-center">
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
        @keyframes lfc-progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}
