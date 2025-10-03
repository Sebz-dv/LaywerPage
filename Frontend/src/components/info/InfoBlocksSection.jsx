"use client";
import React, { useEffect, useState, useMemo } from "react";
import { infoBlocksService } from "../../services/infoBlocksService";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const byOrder = (order = [], a, b) => {
  const pos = (k) => {
    const i = order.indexOf(String(k || "").toLowerCase());
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  const ao = pos(a.key), bo = pos(b.key);
  if (ao !== bo) return ao - bo;
  const ap = a.position ?? 0, bp = b.position ?? 0;
  if (ap !== bp) return ap - bp;
  return (a.id ?? 0) - (b.id ?? 0);
};

export default function InfoCardsGrid({
  title = "Nosotros",
  subtitle = "Conoce nuestra identidad institucional",
  order = ["mision", "vision", "valores"],
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

  const sorted = useMemo(() => {
    const norm = (order || []).map((s) => String(s).toLowerCase());
    return [...items].sort((a, b) => byOrder(norm, a, b));
  }, [items, order]);

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
      className={cx(
        // Centrado del bloque completo
        "w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
        className
      )}
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
          <p className="mt-2 text-[hsl(var(--fg))/0.7] max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </header>

      {err && (
        <div
          role="alert"
          className="mb-6 rounded-xl border px-3 py-2 text-sm border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--destructive))]"
        >
          {err}
        </div>
      )}

      <motion.div
        // Grilla centrada y fluida (cards se centran solas)
        className={cx(
          "grid gap-5 justify-center",
          // auto-fit + minmax para que se centre solo
          "grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
        )}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 max-w-md w-full mx-auto"
            >
              <div className="h-5 w-2/5 rounded bg-[hsl(var(--muted))] mb-3 animate-pulse" />
              <div className="h-4 w-full rounded bg-[hsl(var(--muted))] mb-2 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[hsl(var(--muted))] animate-pulse" />
            </div>
          ))
        ) : sorted.length === 0 ? (
          <p className="text-[hsl(var(--fg))/0.7] text-center col-span-full">
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
                    : {
                        y: -2,
                        // sombra suave al elevarse
                        boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
                      }
                }
                className={cx(
                  "group relative rounded-2xl border transition max-w-md w-full mx-auto",
                  "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                )}
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                <header className="border-b border-[hsl(var(--border))] px-5 py-4 text-center">
                  <h3
                    className="text-lg font-semibold leading-tight"
                    itemProp="name"
                  >
                    {b.title}
                  </h3>
                </header>
                <div className="px-5 py-4">
                  <div
                    className="text-[hsl(var(--fg))/0.9] leading-relaxed whitespace-pre-line"
                    itemProp="text"
                  >
                    {b.body}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.section>
  );
}
