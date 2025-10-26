"use client";
import React, { useEffect, useState, useMemo } from "react";
import { infoBlocksService } from "../../services/infoBlocksService";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function InfoCardsGrid({
  title = "Nosotros",
  subtitle = "Conoce nuestra identidad institucional",
  className = "",
}) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const list = await infoBlocksService.list({ onlyPublic: true });
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "No se pudo cargar");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔽 Ordenar por id ascendente
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
  }, [items]);

  const containerVariants = prefersReduced
    ? {}
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            when: "beforeChildren",
            staggerChildren: 0.06,
            delayChildren: 0.02,
          },
        },
      };

  const cardVariants = prefersReduced
    ? {}
    : {
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 320, damping: 24, mass: 0.7 },
        },
      };

  return (
    <motion.section
      className={cx("w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-muted max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </header>

      {err && (
        <div role="alert" className="mb-6 card card-pad">
          <p className="text-[hsl(var(--destructive))] text-sm">{err}</p>
        </div>
      )}

      <motion.div
        className={cx(
          "grid gap-5 justify-center",
          "grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
        )}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card card-pad max-w-md w-full mx-auto">
              <div className="h-5 w-2/5 rounded bg-[hsl(var(--muted))] mb-3 animate-pulse" />
              <div className="h-4 w-full rounded bg-[hsl(var(--muted))] mb-2 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[hsl(var(--muted))] animate-pulse" />
            </div>
          ))
        ) : sorted.length === 0 ? (
          <p className="text-muted text-center col-span-full">
            No hay información publicada.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((b) => (
              <motion.article
                key={b.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -2, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }
                }
                className={cx(
                  "group relative card max-w-md w-full mx-auto",
                  "transition-[transform,box-shadow,border-color] focus-within:shadow-md"
                )}
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                <header className="border-b border-token px-5 py-4 text-center">
                  <h3 className="text-lg font-semibold leading-tight" itemProp="name">
                    {b.title}
                  </h3>
                </header>

                <div className="card-pad pt-4">
                  <div
                    className="text-[hsl(var(--fg))/0.9] leading-relaxed whitespace-pre-line"
                    itemProp="text"
                  >
                    {b.body}
                  </div>
                </div>

                <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[hsl(var(--accent))]/70 opacity-0 group-hover:opacity-1 transition-opacity" />
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.section>
  );
}
