"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { infoBlocksService } from "../../services/infoBlocksService";

/* ================= Utils & Tokens ================= */
const cx = (...xs) => xs.filter(Boolean).join(" ");
const Motion = motion.div;
const T = {
  h1: "text-4xl sm:text-5xl md:text-6xl",
  h2: "text-3xl sm:text-4xl",
  h3: "text-2xl sm:text-3xl",
  pLg: "text-lg sm:text-xl",
  p: "text-base sm:text-lg",
  kicker: "text-xs sm:text-sm tracking-[.18em] uppercase font-subtitle",
};

function useFadeUpSlow() {
  const prefersReduced = useReducedMotion();
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
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
}
const staggerSlow = (delay = 0.12) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, when: "beforeChildren" } },
});

/* ================= Skeleton ================= */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 max-w-md w-full mx-auto">
      <div className="h-4 w-32 rounded bg-[hsl(var(--muted))] mb-3 animate-pulse" />
      <div className="h-6 w-2/3 rounded bg-[hsl(var(--muted))] mb-4 animate-pulse" />
      <div className="h-4 w-full rounded bg-[hsl(var(--muted))] mb-2 animate-pulse" />
      <div className="h-4 w-5/6 rounded bg-[hsl(var(--muted))] animate-pulse" />
    </div>
  );
}

/* ================= Component ================= */
export default function InfoCardsGrid({
  title = "Nosotros",
  subtitle = "Conoce nuestra identidad institucional",
  className = "",
}) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const prefersReduced = useReducedMotion();

  const fade = useFadeUpSlow();

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
    return [...items].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
  }, [items]);

  return (
    <motion.section
      className={cx("w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      variants={staggerSlow(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {/* Header */}
      <header className="mb-10 text-center">
        <motion.p
          variants={fade}
          className={cx(T.kicker, "text-primary font-subtitle")}
          style={{ letterSpacing: "0.22em" }}
        >
          Identidad
        </motion.p>
        <motion.h1
          variants={fade}
          className={cx(T.h1, "font-semibold tracking-[0.03em]")}
          style={{ letterSpacing: "0.03em", fontKerning: "normal", fontOpticalSizing: "auto" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={fade}
            className={cx(T.pLg, "mt-3 text-soft max-w-3xl mx-auto")}
          >
            {subtitle}
          </motion.p>
        )}
      </header>

      {/* Error */}
      <AnimatePresence>
        {err && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="alert"
            className="mb-6 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-800 text-sm"
          >
            {err}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        variants={staggerSlow(0.08)}
        className={cx(
          "grid gap-6",
          "[grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        )}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : sorted.length === 0 ? (
          <motion.div
            variants={fade}
            className="col-span-full text-center"
          >
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 max-w-2xl mx-auto">
              <p className="text-soft">No hay información publicada.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((b) => (
              <motion.article
                key={b.id}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -2, boxShadow: "0 18px 44px -22px hsl(var(--primary)/.55)" }
                }
                className={cx(
                  "group relative rounded-2xl overflow-hidden",
                  "border border-token bg-card",
                  "transition-[transform,box-shadow,border-color]"
                )}
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                {/* top accent bar */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]"
                />

                {/* header */}
                <header className="px-5 pt-5 pb-4 border-b border-token text-center">
                  <h3 className="text-lg font-semibold leading-tight" itemProp="name">
                    {b.title}
                  </h3>
                </header>

                {/* body */}
                <div className="px-5 py-5">
                  <div
                    className="text-[hsl(var(--fg))/0.92] leading-relaxed whitespace-pre-line"
                    itemProp="text"
                  >
                    {b.body}
                  </div>
                </div>

                {/* hover glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "radial-gradient(600px 200px at 50% -20%, rgba(255,255,255,.12), transparent 70%)",
                  }}
                />
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* microdata de sección */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description: subtitle,
            mainEntity: sorted.map((b) => ({
              "@type": "CreativeWork",
              name: b.title,
              text: b.body,
            })),
          }),
        }}
      />
    </motion.section>
  );
}
