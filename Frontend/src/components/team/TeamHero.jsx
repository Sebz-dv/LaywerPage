"use client";
import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import heroDefault from "../../assets/about/justice.jpg"; // puedes cambiar el default con la prop `bgSrc`

/* ================= Utils ================= */
function cx(...xs) {
  return xs
    .flatMap((x) =>
      typeof x === "object" && x
        ? Object.entries(x)
            .filter(([, v]) => Boolean(v))
            .map(([k]) => k)
        : x
    )
    .filter(Boolean)
    .join(" ");
}

/* ================= Componente ================= */
export default function TeamHero({
  kicker = "Nuestro Equipo",
  title = " Tenemos al mejor talento",
  description = "Nuestro equipo multidisciplinario combina experiencia pública, privada y académica para ofrecer asesoría integral y confiable.",
  align = "left", // 'left' | 'center'
  accent = true, // subrayado bajo el título
  actions = [], // [{ label, href, variant: 'primary'|'outline'|'accent' }]
  className = "",
  // === NUEVO: fondo tipo Backdrop ===
  bgSrc = heroDefault,
  height = "min-h-[58vh] md:min-h-[72vh]",
  tint = "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(117,159,188,.45) 100%)",
}) {
  const headingId = useId();
  const prefersReduced = useReducedMotion();
  const Motion = motion.div;
  const fade = prefersReduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } },
      }
    : {
        hidden: { opacity: 0, y: 26, filter: "blur(4px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0)",
          transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <section
      aria-labelledby={headingId}
      className={cx(
        "relative overflow-hidden",
        "flex items-center",
        "text-white font-display",
        height,
        className
      )}
    >
      {/* ===== Fondo con imagen + tinte + shine ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={bgSrc}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-left md:object-center"
          loading="eager"
          decoding="async"
          sizes="100vw"
        />
        {/* Tinte */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: tint }}
        />
        {/* Shine barrido */}
        {!prefersReduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3"
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

      {/* ===== Contenido ===== */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <header
          className={cx("max-w-3xl", {
            "text-center mx-auto": align === "center",
            "text-left": align === "left",
          })}
        >
          {kicker ? (
            <motion.p
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="eyebrow text-xs tracking-[0.18em] uppercase text-white/80 mb-2 font-subtitle"
              style={{ letterSpacing: "0.18em" }}
            >
              {kicker}
            </motion.p>
          ) : null}

          <motion.h1
            id={headingId}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              "text-balance font-semibold",
              "text-4xl sm:text-5xl md:text-6xl leading-[1.12]",
              "drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
            )}
            style={{
              letterSpacing: "0.03em",
              fontKerning: "normal",
              fontOpticalSizing: "auto",
              textRendering: "optimizeLegibility",
            }}
          >
            {title}
          </motion.h1>

          {accent ? (
            <span
              aria-hidden
              className={cx(
                "mt-3 inline-block h-[3px] w-16 rounded-full bg-white/90",
                { "mx-auto": align === "center" }
              )}
            />
          ) : null}

          {description ? (
            <motion.p
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-5 max-w-2xl font-subtitle text-lg md:text-xl leading-relaxed text-white/92"
            >
              {description}
            </motion.p>
          ) : null}

          {Array.isArray(actions) && actions.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ staggerChildren: 0.12 }}
              className={cx("mt-7 flex flex-wrap gap-3", {
                "justify-center": align === "center",
              })}
            >
              {actions.slice(0, 3).map((a, i) => (
                <CTA key={i} href={a.href || "#"} variant={a.variant}>
                  {a.label}
                </CTA>
              ))}
            </motion.div>
          ) : null}
        </header>
      </div>
    </section>
  );
}

/* ================= CTA con ink fill (como Backdrop) ================= */
function CTA({ href, children, variant = "primary" }) {
  // primary = botón claro sobre fondo oscuro; outline = borde blanco; accent = gradiente primary→accent
  const base =
    variant === "outline"
      ? "btn font-subtitle relative overflow-hidden group text-white border border-white/70 bg-transparent hover:text-[hsl(var(--primary-foreground))]"
      : variant === "accent"
      ? "btn font-subtitle relative overflow-hidden group btn-secondary"
      : "btn font-subtitle relative overflow-hidden group bg-white text-[hsl(var(--primary))] border border-white hover:brightness-95";

  const fillStyle =
    variant === "accent"
      ? "bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--accent)))]"
      : variant === "outline"
      ? "bg-[linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.22))]"
      : "bg-[linear-gradient(90deg,rgba(0,0,0,.06),rgba(0,0,0,.12))]";

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
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
