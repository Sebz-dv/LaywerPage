"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { api } from "../../lib/api";
import {
  carouselService,
  filenameFromSrc,
} from "../../services/carouselService";
import heroFallback from "../../assets/about/justice.jpg";

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
      ("");
    }
  }
  const base = api?.defaults?.baseURL;
  if (typeof base === "string" && /^https?:\/\//i.test(base)) {
    try {
      return new URL(base).origin;
    } catch {
      ("");
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

/* =========================================================
 *  Componente: BackdropCarousel
 *  - Pone el carrusel como FONDO con crossfade
 *  - Texto superpuesto (como Backdrop)
 *  - Opcional: CTA buttons
 * =======================================================*/
export default function BackdropCarousel({
  title = "Comprometidos con la justicia, la educación y la buena administración pública.",
  subtitle = (
    <>
      En{" "}
      <strong className="font-subtitle font-semibold text-white tracking-[0.02em]">
        Blanco &amp; Ramírez Abogados S.A.S.
      </strong>{" "}
      fortalecemos la gestión jurídica del sector público y educativo, brindando
      asesoría, representación y acompañamiento estratégico con rigor académico,
      experiencia y una visión innovadora.
    </>
  ),
  className = "",
  height = "min-h-[64vh] md:min-h-[78vh]",
  autoplayMs = 6000,
  tint = "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(117,159,188,.45) 100%)",
  showCTAs = true,
  primaryHref = "/contacto",
  secondaryHref = "/servicios",
}) {
  const [slides, setSlides] = useState([]); // [{src, alt}]
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const prefersReduced = useReducedMotion();
  const timerRef = useRef(null);
  const Motion = motion.div;
  // Carga de imágenes del carrusel
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const list = await carouselService.list();
        const normalized = (Array.isArray(list) ? list : [])
          .map((it) => ({ ...it, src: resolveUrl(it.src) }))
          .filter(Boolean);
        if (alive) setSlides(normalized);
      } catch (e) {
        if (alive) setErr(e?.message || "No se pudo cargar el carrusel");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Autoplay
  useEffect(() => {
    if (prefersReduced) return; // respeta accesibilidad
    if (!slides.length) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, Math.max(autoplayMs, 3000));
    return () => clearInterval(timerRef.current);
  }, [slides.length, autoplayMs, prefersReduced]);

  // Preload siguiente slide (suave)
  const nextSrc = slides[(idx + 1) % Math.max(slides.length, 1)]?.src;
  useEffect(() => {
    if (!nextSrc) return;
    const img = new Image();
    img.src = nextSrc;
  }, [nextSrc]);

  // Variants
  const fade = useMemo(
    () => ({
      hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0)",
        transition: prefersReduced
          ? { duration: 0.35 }
          : { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    [prefersReduced]
  );

  return (
    <section
      aria-labelledby="backdrop-carousel-title"
      className={cx(
        "relative overflow-hidden flex flex-col items-center justify-center text-center",
        "px-4 py-20 md:py-28 bg-[#0D1B3A] text-white font-display",
        height,
        className
      )}
    >
      {/* Fondo: slides crossfade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence initial={false}>
          {(slides.length ? slides : [{ src: heroFallback, alt: "" }]).map(
            (s, i) =>
              i === (slides.length ? idx : 0) && (
                <motion.img
                  key={s.src}
                  src={s.src}
                  alt={s.alt || ""}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReduced ? 0.2 : 0.8 }}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="100vw"
                />
              )
          )}
        </AnimatePresence>

        {/* Tinte/overlay */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: tint }}
        />

        {/* Shine barrido suave */}
        {!prefersReduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3 z-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.38) 45%, rgba(255,255,255,.52) 50%, rgba(255,255,255,.32) 55%, transparent 100%)",
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
            animate={{ x: ["0%", "200%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Contenido superpuesto */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1
          id="backdrop-carousel-title"
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl md:text-6xl font-semibold tracking-[0.02em] leading-[1.15] text-balance drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
          style={{
            letterSpacing: "0.02em",
            fontKerning: "normal",
            fontOpticalSizing: "auto",
            textRendering: "optimizeLegibility",
          }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {showCTAs && (
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.12, when: "beforeChildren" },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-8 flex items-center justify-center gap-3 sm:gap-4"
          >
            <CTA href={primaryHref} variant="secondary">
              Contactar
            </CTA>
            <CTA href={secondaryHref} variant="outline">
              Ver servicios
            </CTA>
          </motion.div>
        )}

        {/* Indicadores (opcional) */}
        {slides.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIdx(i)}
                className={cx(
                  "h-2 w-2 rounded-full transition-all",
                  i === idx
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Ir al slide ${i + 1}: ${
                  s.alt || filenameFromSrc(s.src)
                }`}
              />
            ))}
          </div>
        )}

        {/* Estado/Error minimal */}
        {err && (
          <div role="alert" className="mt-4 text-sm text-red-200/95">
            {err}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
 *  CTA con "ink fill" (consistente con About)
 * =======================================================*/
function CTA({ href, children, variant = "secondary" }) {
  const base =
    variant === "secondary"
      ? "btn font-subtitle relative overflow-hidden group btn-secondary"
      : "btn font-subtitle relative overflow-hidden group text-white border border-white/70 bg-transparent hover:text-[hsl(var(--primary-foreground))]";

  const fillStyle =
    variant === "secondary"
      ? "bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--accent)))]"
      : "bg-[linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.22))]";

  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
      className={base}
    >
      <span
        aria-hidden
        className={cx(
          "absolute inset-0 -z-0 origin-left scale-x-0 group-hover:scale-x-100",
          "transition-transform duration-700 ease-out",
          fillStyle
        )}
      />
      <span className="relative z-10 flex items-center">{children}</span>
    </motion.a>
  );
}
