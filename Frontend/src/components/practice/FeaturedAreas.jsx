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

export default function FeaturedAreas({ items }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const canShowMore = visibleCount < (items?.length ?? 0);
  const reduceMotion = useReducedMotion();

  // Sentinel para carga progresiva
  const sentinelRef = useRef(null);
  const inView = useInView(sentinelRef, {
    root: null,
    margin: "0px 0px -28% 0px",
    amount: 0.2,
  });

  useEffect(() => {
    if (inView && canShowMore)
      setVisibleCount((n) => Math.min(n + 1, items.length));
  }, [inView, canShowMore, items?.length]);

  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Aún no hay áreas destacadas publicadas.
      </div>
    );
  }

  return (
    <div className="relative grid md:grid-cols-2 gap-8 items-start">
      {/* IZQ: sticky tagline */}
      <div className="md:sticky md:top-20 self-start">
        <motion.div
          variants={vContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-2"
        >
          <motion.p
            variants={vItem}
            className="text-[clamp(1rem,1.2vw+0.9rem,1.4rem)] leading-snug text-foreground font-medium"
          >
            <span className="block text-left">
              Estrategia legal inteligente, adaptada a cada
            </span>
            <span className="block text-left">movimiento empresarial.</span>
          </motion.p>

          {/* Línea divisoria sutil (opcional) */}
          <motion.hr
            variants={vItem}
            className="mt-3 h-px border-0 bg-border/20"
          />
        </motion.div>
      </div>

      {/* DER: pila progresiva */}
      <div>
        <AnimatePresence initial={false} mode="popLayout">
          {items.slice(0, visibleCount).map((it, idx) => (
            <motion.article
              key={it.key ?? idx}
              layout
              variants={vPopCard}
              initial="hidden"
              animate="show"
              exit="exit"
              className={cx(
                "relative rounded-none border-y border-[hsl(var(--border))]",
                "bg-card p-4 md:p-5 lg:p-6 overflow-hidden will-change-transform",
                "border-b-0"
              )}
            >
              <div className="flex gap-4 md:gap-5">
                <div className="relative w-40 md:w-56 aspect-[4/3] shrink-0 rounded-xl overflow-hidden ">
                  {it.cover ? (
                    <img
                      src={it.cover}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : it.icon ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <img
                        src={it.icon}
                        alt=""
                        className="object-cover opacity-90 rounded-md"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h3 className="text-2xl font-semibold leading-tight">
                    {it.title}
                  </h3>
                  {it.subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {it.subtitle}
                    </p>
                  )}

                  {Array.isArray(it.bullets) && it.bullets.length > 0 && (
                    <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                      {it.bullets.map((b, i) => (
                        <li key={i} className="text-sm text-foreground/80">
                          • {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex justify-end">
                    <Link
                      to={it.to}
                      aria-label={`Conocer más sobre ${it.title ?? "el área"}`}
                      className={cx(
                        "group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium",
                        // Base: outline sobrio
                        "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg)/0.9)]",
                        // Hover/focus: toque de acento, sin gritar
                        "hover:bg-[hsl(var(--accent)/0.08)] hover:text-[hsl(var(--accent))]",
                        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      )}
                    >
                      <span>Conocer más</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {/* Sentinel para ir revelando */}
        {items.length > 1 && <div ref={sentinelRef} className="h-10 w-full" />}
      </div>
    </div>
  );
}
