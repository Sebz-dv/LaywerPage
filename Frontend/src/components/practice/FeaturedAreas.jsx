import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ================= Variants ================= */
const vContainer = (stagger = 0.08) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: stagger } },
});
const vItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const vPopCard = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 16 },
  },
  exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.24 } },
};

/* ============== Utils ============== */
function chunkBy3(arr = []) {
  const out = [];
  for (let i = 0; i < arr.length; i += 3) out.push(arr.slice(i, i + 3));
  return out;
}

/* ============== Hook: luminancia de imagen ============== */
function useImageLuma(src) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.loading = "eager";
    img.src = src;

    const onLoad = () => {
      try {
        const w = 24,
          h = 24;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);

        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          // luminancia percibida (sRGB)
          const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          sum += l;
        }
        const avg = sum / (data.length / 4);
        setIsLight(avg >= 178); // umbral “claro”
      } catch {
        setIsLight(false);
      }
    };

    const onError = () => setIsLight(false);

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    return () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [src]);

  return isLight;
}

/* ============== Subcomponente: Card con overlay adaptable ============== */
function FeaturedCard({ item, reduceMotion }) {
  const key = item.key ?? item.slug ?? item.id ?? item.title ?? "item";
  const href =
    item.to ??
    (item.slug || item.key
      ? `/servicios/${item.slug ?? item.key}${item.id ? `?id=${item.id}` : ""}`
      : "#");

  const cover = item.cover || item.icon || "";
  const isLight = useImageLuma(cover);

  // Agrupar “diferenciales” en columnas de 3 usando `excerpt` (fallback a subtitle)
  const bulletGroups = useMemo(() => {
    const raw = item.excerpt ?? item.subtitle;

    if (!raw) return [];

    // Puede venir como array o como string
    const arr = Array.isArray(raw)
      ? raw
      : String(raw)
          .split("|") // si quieres, puedes separar por "|"
          .map((s) => s.trim())
          .filter(Boolean);

    return chunkBy3(arr);
  }, [item.excerpt, item.subtitle]);

  return (
    <motion.article
      key={key}
      layout
      variants={vPopCard}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? false : "show"}
      exit={reduceMotion ? false : "exit"}
      className={cx(
        "relative bg-card overflow-hidden will-change-transform",
        "border border-[hsl(var(--border))] rounded-xl",
        "min-h-[260px] md:min-h-[300px]"
      )}
    >
      {/* Imagen de fondo */}
      {cover && (
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Scrim base (gradiente suave) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/35" />

      {/* Refuerzo si la imagen es clara */}
      {isLight && (
        <div className="pointer-events-none absolute inset-0 bg-black/28 mix-blend-normal" />
      )}

      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div
          className={cx(
            "rounded-xl border backdrop-blur-sm",
            "bg-white/5 border-white/10",
            "w-full max-w-3xl mx-auto px-5 py-6 md:px-7 md:py-8"
          )}
        >
          {/* Título centrado y más grande */}
          <h3
            className={cx(
              "text-5xl md:text-4xl font-semibold leading-tight text-white text-center",
              "drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
            )}
          >
            {item.title}
          </h3>

          {/* Subtítulo corto opcional (tagline) */}
          {item.tagline && (
            <p
              className={cx(
                "text-xl md:text-base mt-3 text-white/85 text-center",
                "drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
              )}
            >
              {item.tagline}
            </p>
          )}

          {/* Diferenciales / excerpt en columnas de 3 */}
          {bulletGroups.length > 0 && (
            <div
              className={cx(
                "mt-4",
                "flex flex-wrap md:flex-nowrap gap-x-6 gap-y-3 items-start justify-start"
              )}
            >
              {bulletGroups.map((col, ci) => (
                <ul key={ci} className="min-w-[12rem] space-y-1">
                  {col.map((line, i) => (
                    <li
                      key={i}
                      className={cx(
                        "text-lg md:text-base text-white/85 text-left leading-relaxed",
                        "drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
                      )}
                    >
                      • {line}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              to={href}
              aria-label={`Conocer el servicio: ${item.title ?? "Área"}`}
              className={cx(
                "group inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs md:text-sm font-medium",
                "border-white/25 bg-white/10 text-white",
                "hover:bg-white/15 hover:border-white/35",
                "focus:outline-none focus:ring-2 focus:ring-white/30",
                "backdrop-blur-sm transition-colors duration-200"
              )}
            >
              <span>Conocer el servicio</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * FeaturedAreas
 * - Props: items: { key, id, slug, title, excerpt?, subtitle?, tagline?, to, icon, cover }
 */
export default function FeaturedAreas({
  items = [],
  initialCount = 4, // para ver “dos por dos” de entrada
  step = 2,
}) {
  const reduceMotion = useReducedMotion();
  const safeItems = Array.isArray(items) ? items : [];
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialCount, safeItems.length || 0)
  );

  // Sentinel para carga progresiva
  const sentinelRef = useRef(null);
  const inView = useInView(sentinelRef, {
    root: null,
    rootMargin: "0px 0px -28% 0px",
    amount: 0.2,
  });

  useEffect(() => {
    if (!inView) return;
    if (visibleCount >= safeItems.length) return;
    setVisibleCount((n) => Math.min(n + Math.max(1, step), safeItems.length));
  }, [inView, step, safeItems.length, visibleCount]);

  if (!safeItems.length) {
    return (
      <div className="text-sm text-muted-foreground px-4 md:px-6">
        Pronto publicaremos nuestras áreas destacadas. ¿Hablamos mientras?
      </div>
    );
  }

  return (
    <div className="relative max-w-none px-0">
      {/* Arriba, centrado */}
      <div className="px-4 md:px-6 mb-4 md:mb-6">
        <motion.div
          variants={vContainer(0.06)}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.5 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={vItem}
            className="leading-snug font-medium mt-2 text-foreground"
          >
            <span className="block text-5xl font-bold tracking-tight">
              Donde hay un reto, trazamos la estrategia para ganarlo.
            </span>
            <span className="block mt-6 md:mt-8 text-lg text-muted-foreground">
              Asesoría legal precisa, diseñada para cada decisión empresarial.
            </span>
          </motion.p>
          <motion.hr
            variants={vItem}
            className="mt-4 h-px border-0 bg-border/20"
          />
        </motion.div>
      </div>

      {/* Grid de cards (dos por dos) */}
      <div className="px-4 md:px-6">
        <AnimatePresence initial={false} mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {safeItems.slice(0, visibleCount).map((it) => (
              <FeaturedCard
                key={it.key ?? it.slug ?? it.id ?? it.title}
                item={it}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </AnimatePresence>

        {safeItems.length > visibleCount && (
          <div ref={sentinelRef} className="h-10 w-full" />
        )}
      </div>
    </div>
  );
}
