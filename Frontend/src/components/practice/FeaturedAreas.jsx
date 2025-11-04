import React, { useEffect, useRef, useState } from "react";
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

/**
 * FeaturedAreas
 * - Props: items: { key, id, slug, title, subtitle, bullets, to, icon, cover }
 */
export default function FeaturedAreas({
  items = [],
  initialCount = 1,
  step = 1,
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
    <div className="relative grid md:grid-cols-2 gap-6 md:gap-8 items-start max-w-none px-0">
      {/* IZQ: sticky tagline */}
      <div className="md:sticky md:top-20 self-start px-4 md:px-6">
        <motion.div
          variants={vContainer(0.06)}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.5 }}
          className="mb-2"
        >
          <motion.p
            variants={vItem}
            className="text-[hsl(var(--primary))] leading-snug text-foreground font-medium"
          >
            <span className="block text-left text-4xl md:text-5xl font-bold">
              Donde hay un reto, trazamos la estrategia para ganarlo.
            </span>
            <span className="block text-left mt-6 md:mt-8 text-base md:text-lg">
              Asesoría legal precisa, diseñada para cada decisión empresarial.
            </span>
          </motion.p>
          <motion.hr
            variants={vItem}
            className="mt-3 h-px border-0 bg-border/20"
          />
        </motion.div>
      </div>

      {/* DER: pila progresiva */}
      <div className="px-4 md:px-6">
        <AnimatePresence initial={false} mode="popLayout">
          {safeItems.slice(0, visibleCount).map((it, idx, arr) => {
            const isFirst = idx === 0;
            const isLast = idx === arr.length - 1;
            const key = it.key ?? it.slug ?? `${it.title ?? "item"}-${idx}`;

            const href =
              it.to ??
              (it.slug || it.key
                ? `/servicios/${it.slug ?? it.key}${it.id ? `?id=${it.id}` : ""}`
                : "#");

            return (
              <motion.article
                key={key}
                layout
                variants={vPopCard}
                initial={reduceMotion ? false : "hidden"}
                animate={reduceMotion ? false : "show"}
                exit={reduceMotion ? false : "exit"}
                className={cx(
                  "relative bg-card p-4 md:p-5 lg:p-6 overflow-hidden will-change-transform",
                  "border-[hsl(var(--border))]",
                  isFirst && "rounded-t-none md:rounded-t-none border-t",
                  "border-x border-y-0",
                  isLast
                    ? "border-b rounded-b-none md:rounded-b-none"
                    : "border-b-0"
                )}
              >
                {(it.cover || it.icon) && (
                  <img
                    src={it.cover || it.icon}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}

                <div className="absolute inset-0 bg-black/20 md:bg-black/15" />

                <div className="relative z-10">
                  <div
                    className={cx(
                      "rounded-xl border",
                      "bg-white/5 border-white/10",
                      "backdrop-blur-sm",
                      "px-4 py-3 md:px-5 md:py-4"
                    )}
                  >
                    <h3 className="text-2xl font-semibold leading-tight text-white">
                      {it.title}
                    </h3>

                    <p className="text-sm mt-1 text-white/80">
                      {it.subtitle || "Experiencia técnica, criterio práctico."}
                    </p>

                    {Array.isArray(it.bullets) && it.bullets.length > 0 && (
                      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                        {it.bullets.slice(0, 6).map((b, i) => (
                          <li key={i} className="text-sm text-white/80">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex justify-end">
                      <Link
                        to={href}
                        aria-label={`Conocer el servicio: ${it.title ?? "Área"}`}
                        className={cx(
                          "group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                          "border-white/20 bg-white/5 text-white/90",
                          "hover:bg-white/10 hover:border-white/30",
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
          })}
        </AnimatePresence>

        {safeItems.length > visibleCount && (
          <div ref={sentinelRef} className="h-10 w-full" />
        )}
      </div>
    </div>
  );
}