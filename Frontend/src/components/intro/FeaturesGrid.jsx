// src/components/about/FeaturesGrid.jsx
"use client";
import React, { useMemo, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaShieldAlt,
  FaGavel,
  FaUniversity,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaHandHoldingUsd,
} from "react-icons/fa";
import { mediaService } from "../../services/mediaService"; // 👈 usamos el slot services_hero

/* ================= Utils ================= */
const cx = (...xs) => xs.filter(Boolean).join(" ");

/** Estructura:
 * { t: string, bullets?: string[], d?: string, icon?: ReactNode }
 */
const DEFAULT_FEATURES = [
  {
    t: "Representación y defensa jurídica",
    bullets: [
      "Litigio estratégico en derecho administrativo y constitucional.",
      "Defensa de directivos y funcionarios públicos.",
      "Procesos disciplinarios y fiscales.",
    ],
    icon: <FaShieldAlt />,
  },
  {
    t: "Gerencia y asesoría jurídica",
    bullets: [
      "Elaboración de proyectos normativos.",
      "Consultoría en políticas públicas.",
      "Prevención del daño antijurídico.",
    ],
    icon: <FaGavel />,
  },
  {
    t: "Derecho educativo",
    bullets: [
      "Asesoría a instituciones y entidades del sector.",
      "Defensa de derechos educativos.",
      "Elaboración de protocolos y políticas internas.",
    ],
    icon: <FaUniversity />,
  },
  {
    t: "Obras por impuestos",
    bullets: [
      "Estructuración de proyectos OxI en educación.",
      "Acompañamiento en formulación, aprobación y seguimiento.",
    ],
    icon: <FaHandHoldingUsd />,
  },
  {
    t: "Capacitación y formación",
    bullets: [
      "Talleres sobre contratación estatal, ética pública y riesgos legales.",
      "Programas a la medida para equipos directivos.",
    ],
    icon: <FaChalkboardTeacher />,
  },
  {
    t: "Acompañamiento integral",
    bullets: [
      "Revisión, aprobación y seguimiento a la ejecución.",
      "Gestión de hitos y cierre con enfoque de resultados.",
    ],
    icon: <FaProjectDiagram />,
  },
];

/* ================= Animations ================= */
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
          ? { duration: 0.3 }
          : { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    [prefersReduced]
  );
}
const staggerSlow = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, when: "beforeChildren" } },
});

/* ================= Component ================= */
export default function FeaturesGrid({
  features = DEFAULT_FEATURES,
  title = "Servicios Jurídicos",
  subtitle = "Nuestro conocimiento, a su servicio.",
  className = "",
  // Estilo Backdrop
  bgSrc: bgSrcProp = null, // 👈 ya no usamos justice.png como default
  tint = "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(117,159,188,.45) 100%)",
  height = "",
}) {
  const fade = useFadeUpSlow();
  const prefersReduced = useReducedMotion();

  // 👉 Imagen desde el slot `services_hero`
  const [bgFromSlot, setBgFromSlot] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await mediaService.getByKey("services_hero");
        // el back ya devuelve la URL pública (Storage::url)
        setBgFromSlot(data?.url || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar media slot services_hero:", e);
      }
    })();
  }, []);

  // Orden de prioridad:
  // 1. bgSrcProp (si alguien quiere forzar una imagen por props)
  // 2. bgFromSlot (services_hero desde el back)
  // 3. color plano (fallback de la sección)
  const bgSrc = bgSrcProp || bgFromSlot;

  return (
    <section id="features" className={cx("relative overflow-hidden", className)}>
      {/* ===== Fondo estilo Backdrop (slot services_hero) ===== */}
      {bgSrc ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={bgSrc}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-left md:object-center"
            loading="lazy"
            decoding="async"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ background: tint }}
          />
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
      ) : (
        <div className="absolute inset-0 z-0 bg-[hsl(var(--primary))]" />
      )}

      {/* ===== Contenido ===== */}
      <motion.div
        variants={staggerSlow(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className={cx(
          "relative z-10 text-white font-display",
          height,
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14"
        )}
      >
        <header className="max-w-3xl">
          <motion.h2
            variants={fade}
            className="text-3xl sm:text-4xl font-semibold tracking-[0.03em] drop-shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            style={{ letterSpacing: "0.03em" }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              variants={fade}
              className="mt-2 text-white/90 font-subtitle"
            >
              {subtitle}
            </motion.p>
          )}
        </header>

        <motion.div
          variants={staggerSlow(0.1)}
          className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} fade={fade} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================= Cards ================= */
function FeatureCard({ t, bullets, d, icon, fade }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.article
      variants={fade}
      whileHover={
        prefersReduced
          ? undefined
          : {
              y: -3,
              boxShadow:
                "0 18px 44px -22px hsl(var(--primary)/.55)",
            }
      }
      className={cx(
        "group relative rounded-2xl overflow-hidden",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg))]",
        "transition-[transform,box-shadow,border-color]"
      )}
    >
      {/* top accent bar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]"
      />

      <div className="p-5">
        {/* Icono */}
        <div
          className={cx(
            "h-11 w-11 rounded-xl grid place-items-center",
            "border border-[hsl(var(--border))]",
            "bg-[hsl(var(--accent))] text-[hsl(var(--bg))]"
          )}
        >
          {icon ?? <FaShieldAlt className="h-5 w-5" />}
        </div>

        <h3 className="mt-4 font-semibold text-lg leading-snug">{t}</h3>

        {Array.isArray(bullets) ? (
          <ul className="mt-2 space-y-1.5 text-sm text-[hsl(var(--fg)/0.85)]">
            {bullets.map((b, k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-[7px] h-[6px] w-[6px] rounded-full bg-[hsl(var(--primary))] shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          d && (
            <p className="mt-2 text-sm text-[hsl(var(--fg)/0.85)] whitespace-pre-line">
              {d}
            </p>
          )
        )}
      </div>

      {/* glow al hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "radial-gradient(600px 200px at 50% -20%, rgba(255,255,255,.12), transparent 70%)",
        }}
      />
    </motion.article>
  );
}
