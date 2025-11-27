// src/pages/AboutUs.jsx
import React, { useMemo, useId, useEffect, useState } from "react";
import {
  FaBalanceScale,
  FaUsers,
  FaHandshake,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import InfoBlocksSection from "../../components/info/InfoBlocksSection.jsx";
import { mediaService } from "../../services/mediaService";

/* ============ Utils ============ */
const cx = (...xs) => xs.filter(Boolean).join(" ");

/**
 * Escala de texto más amigable en móvil.
 */
const T = {
  h1: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  h2: "text-2xl sm:text-3xl md:text-4xl",
  h3: "text-xl sm:text-2xl md:text-3xl",
  h4: "text-lg sm:text-xl md:text-2xl",
  pLg: "text-base sm:text-lg md:text-xl",
  p: "text-sm sm:text-base md:text-lg",
  kicker: "text-[11px] sm:text-xs md:text-sm tracking-[.18em] uppercase font-subtitle",
};

/* ============ Datos ============ */
const values = [
  {
    icon: <FaStar className="h-6 w-6" />,
    title: "Excelencia",
    desc: "Resultados que reflejan compromiso, rigor y calidad.",
  },
  {
    icon: <FaUsers className="h-6 w-6" />,
    title: "Armonía",
    desc: "Equipo sano, comunicación asertiva y servicio impecable.",
  },
  {
    icon: <FaBalanceScale className="h-6 w-6" />,
    title: "Enfoque colectivo",
    desc: "Capacidades alineadas a un propósito común.",
  },
  {
    icon: <FaHandshake className="h-6 w-6" />,
    title: "Lealtad",
    desc: "Compromiso firme ante escenarios complejos.",
  },
];

/* ============ Animaciones ============ */
function useFadeUpSlow() {
  const prefersReduced = useReducedMotion();
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 26, filter: "blur(4px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0)",
        transition: prefersReduced
          ? { duration: 0.4 }
          : { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    [prefersReduced]
  );
}
const staggerSlow = (delay = 0.12) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, when: "beforeChildren" } },
});

/* ============ Botón ============ */
const BtnInk = ({ href, children, variant = "secondary", className }) => {
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
      className={cx(
        base,
        // full width en móvil, auto en pantallas grandes
        "w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left",
        className
      )}
    >
      <span
        aria-hidden
        className={cx(
          "absolute inset-0 -z-0 origin-left scale-x-0 group-hover:scale-x-100",
          "transition-transform duration-700 ease-out",
          fillStyle
        )}
      />
      <span className="relative z-10 flex items-center justify-center sm:justify-start">
        {children}
        <FaArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.a>
  );
};

const Container = ({ className, children }) => (
  <div className={cx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
);

const ValueItem = ({ icon, title, desc }) => {
  const fade = useFadeUpSlow();
  return (
    <motion.article
      variants={fade}
      className="rounded-2xl p-5 sm:p-6 bg-card border border-token hover:shadow-lg transition-shadow font-display"
    >
      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl grid place-items-center bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
        {icon}
      </div>
      <h4 className={cx(T.h4, "mt-3 sm:mt-4 font-semibold")}>{title}</h4>
      <p className={cx(T.p, "mt-2 text-soft")}>{desc}</p>
    </motion.article>
  );
};

/* ============ Página ============ */
export default function AboutUs() {
  const fade = useFadeUpSlow();
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1.05, 1]);
  const titleId = useId();

  // imágenes desde slots
  const [heroBgUrl, setHeroBgUrl] = useState(null); // about_hero
  const [teamImgUrl, setTeamImgUrl] = useState(null); // about_hero_persons
  const [officeImgUrl, setOfficeImgUrl] = useState(null); // contact_services

  useEffect(() => {
    (async () => {
      try {
        const heroSlot = await mediaService.getByKey("about_hero");
        setHeroBgUrl(heroSlot?.url || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar media slot about_hero:", e);
      }

      try {
        const teamSlot = await mediaService.getByKey("about_hero_persons");
        setTeamImgUrl(teamSlot?.url || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar media slot about_hero_persons:", e);
      }

      try {
        const officeSlot = await mediaService.getByKey("contact_services");
        setOfficeImgUrl(officeSlot?.url || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar media slot contact_services:", e);
      }
    })();
  }, []);

  const hasHeroImg = Boolean(heroBgUrl);
  const hasTeamImg = Boolean(teamImgUrl);
  const hasOfficeImg = Boolean(officeImgUrl);

  return (
    <main className="w-full relative overflow-hidden font-display">
      {/* HERO */}
      <section className="relative z-10" aria-labelledby={titleId}>
        <motion.div
          style={{ scale: heroScale }}
          animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 will-change-transform z-0"
        >
          {hasHeroImg && (
            <img
              src={heroBgUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              sizes="100vw"
            />
          )}

          {/* Barrido blanco */}
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

          {/* Overlay (si no hay imagen, esto queda como fondo principal) */}
          <div
            className="absolute inset-0 mix-blend-multiply z-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)/.85) 0%, hsl(var(--accent)/.42) 100%)",
            }}
          />
        </motion.div>

        <Container className="relative z-10 pt-24 pb-20 sm:pt-28 sm:pb-24 mt-16 sm:mt-20">
          <motion.h1
            id={titleId}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.h1,
              "font-display font-semibold tracking-[0.03em] text-white text-balance drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]",
              "text-center sm:text-left"
            )}
            style={{
              letterSpacing: "0.04em",
              fontKerning: "normal",
              fontOpticalSizing: "auto",
              textRendering: "optimizeLegibility",
            }}
          >
            Comprometidos con la justicia, la educación y la buena
            administración pública.
          </motion.h1>

          <motion.p
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.pLg,
              "mt-5 sm:mt-6 max-w-4xl text-white/95 tracking-[0.02em] leading-relaxed",
              "text-center sm:text-left mx-auto sm:mx-0"
            )}
            style={{ wordSpacing: "0.06em" }}
          >
            Asesoría especializada, representación judicial y acompañamiento
            estratégico para entidades y directivos del sector público y
            educativo.
          </motion.p>

          <motion.div
            variants={staggerSlow(0.14)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center justify-center sm:justify-start"
          >
            <BtnInk href="/contacto" variant="secondary">
              Contactar
            </BtnInk>
            <BtnInk href="/servicios" variant="secondary">
              Ver servicios
            </BtnInk>
          </motion.div>
        </Container>
      </section>

      {/* INTRO — Quiénes somos */}
      <section
        className="relative z-10 bg-[hsl(var(--primary))]"
        aria-labelledby="about-intro"
      >
        <Container className="py-16 sm:py-20">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12">
            {/* Texto IZQ */}
            <div
              className={cx(
                hasTeamImg ? "lg:col-span-7" : "lg:col-span-12",
                "order-1 text-white"
              )}
            >
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.kicker,
                  "font-subtitle text-white/85 text-center sm:text-left"
                )}
                id="about-intro"
                style={{
                  fontFamily:
                    '"Avenir Next Var","Avenir Next","Avenir","Segoe UI","Inter",system-ui,-apple-system,sans-serif',
                  fontWeight: 600,
                  fontStretch: "100%",
                }}
              >
                Equipo jurídico con enfoque institucional
              </motion.p>

              <motion.h2
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.h1,
                  "font-semibold tracking-tight mt-3 text-white text-center sm:text-left"
                )}
              >
                Quiénes somos
              </motion.h2>

              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.pLg,
                  "mt-5 sm:mt-7 leading-relaxed text-pretty text-white/90 text-center sm:text-left"
                )}
              >
                Fortalecemos la gestión del sector público y educativo
                combinando rigor académico, experiencia institucional y visión
                innovadora.
              </motion.p>

              <motion.div
                variants={staggerSlow(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-7 sm:mt-8 flex flex-wrap gap-3 sm:gap-3.5 justify-center sm:justify-start"
              >
                {[
                  "Derecho administrativo y constitucional",
                  "Sector público y educativo",
                  "Prevención del daño antijurídico",
                  "Acompañamiento estratégico a directivos",
                ].map((t) => (
                  <motion.span
                    key={t}
                    variants={fade}
                    className={cx(
                      "badge font-subtitle !bg-white/12 !text-white !border-white/30",
                      "!text-xs sm:!text-sm md:!text-base",
                      "!px-3 sm:!px-4 md:!px-5",
                      "!py-1.5 sm:!py-2",
                      "rounded-xl",
                      "!leading-tight tracking-[0.015em]"
                    )}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div
                variants={staggerSlow(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-8 sm:mt-10 grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 text-white"
              >
                {[
                  ["+12", "Años de experiencia"],
                  ["120+", "Procesos asesorados"],
                  ["15", "Entidades formadas"],
                ].map(([n, k]) => (
                  <motion.div
                    key={k}
                    variants={fade}
                    className="rounded-2xl border border-white/60 p-4 sm:p-6
                         flex flex-col items-center justify-center text-center gap-1
                         min-h-[96px] sm:min-h-[120px] hover:border-white transition-colors"
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl font-semibold">
                      {n}
                    </div>
                    <div className="text-[11px] sm:text-xs md:text-sm text-white/85 font-subtitle">
                      {k}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Imagen DERECHA solo si hay slot */}
            {hasTeamImg && (
              <figure className="lg:col-span-5 order-2 relative mt-6 lg:mt-0">
                <motion.div
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <img
                    src={teamImgUrl}
                    alt="Equipo BR Blanco & Ramírez"
                    className="w-full h-[260px] sm:h-[380px] md:h-[460px] lg:h-[520px] object-cover"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width:1024px) 40vw, 90vw"
                  />
                </motion.div>
              </figure>
            )}
          </div>
        </Container>
      </section>

      <InfoBlocksSection
        title=""
        subtitle=""
        order={["mision", "vision"]}
        layout="stack"
        showAnchors
        titleClassName="hidden"
      />

      {/* PROPÓSITO */}
      <section
        className="relative z-10 -mt-4 sm:mt-[-30px] bg-[hsl(var(--primary))] text-white"
        aria-labelledby="about-purpose"
      >
        <Container className="py-14 sm:py-18 md:py-20">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-6">
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={cx(
                  T.kicker,
                  "mb-6 sm:mb-8 text-white/70 text-center sm:text-left"
                )}
                id="about-purpose"
                style={{ letterSpacing: "0.22em" }}
              >
                Nuestro propósito
              </motion.p>

              <motion.h2
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={cx(
                  T.h2,
                  "font-semibold tracking-[0.03em] text-white text-center sm:text-left"
                )}
                style={{
                  letterSpacing: "0.03em",
                  fontKerning: "normal",
                  fontOpticalSizing: "auto",
                  textRendering: "optimizeLegibility",
                }}
              >
                Todo se transforma, menos nuestro propósito.
              </motion.h2>

              <motion.blockquote
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={cx(
                  T.pLg,
                  "mt-5 sm:mt-6 pl-4 sm:pl-5 italic tracking-[0.01em]",
                  "text-white/90 border-l-2 border-white/30",
                  "text-left"
                )}
                style={{ letterSpacing: "0.01em", lineHeight: 1.7 }}
              >
                Movilizamos a las instituciones mediante asesoría legal
                estratégica para generar desarrollo social y económico con
                soluciones sostenibles, conscientes y competitivas.
              </motion.blockquote>
            </div>

            <div className="lg:col-span-6 mt-8 lg:mt-0">
              <motion.h3
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={cx(
                  T.h2,
                  "font-semibold text-center text-white"
                )}
              >
                Nuestros valores
              </motion.h3>

              <motion.div
                variants={staggerSlow(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="mt-6 sm:mt-7 grid gap-5 sm:gap-7 grid-cols-1 sm:grid-cols-2 text-primary"
              >
                {values.map((v) => (
                  <ValueItem
                    key={v.title}
                    icon={v.icon}
                    title={v.title}
                    desc={v.desc}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section
        className="relative z-10 bg-[hsl(var(--bg))]"
        aria-labelledby="about-cta"
      >
        <Container className="py-14 sm:py-16">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12">
            <div
              className={cx(
                hasOfficeImg ? "lg:col-span-6" : "lg:col-span-12",
                "order-1 text-primary"
              )}
            >
              <motion.h3
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                id="about-cta"
                className={cx(
                  T.h2,
                  "font-semibold text-center sm:text-left"
                )}
              >
                Conversemos sobre tus retos institucionales
              </motion.h3>
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.p,
                  "text-primary/85 mt-3 font-subtitle text-center sm:text-left"
                )}
              >
                Un diagnóstico claro, un plan accionable y acompañamiento
                cercano.
              </motion.p>
              <motion.div
                variants={staggerSlow(0.14)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center sm:justify-start"
              >
                <BtnInk href="/contacto" variant="secondary">
                  Contactar
                </BtnInk>
                <BtnInk href="/servicios" variant="secondary">
                  Ver servicios
                </BtnInk>
              </motion.div>
            </div>

            {hasOfficeImg && (
              <div className="lg:col-span-6 order-2">
                <motion.div
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  className="relative overflow-hidden rounded-2xl mt-6 lg:mt-0"
                >
                  <img
                    src={officeImgUrl}
                    alt="Colaboración con clientes"
                    className="w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px] object-cover"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width:1024px) 48vw, 90vw"
                  />
                </motion.div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalService",
            name: "Blanco & Ramírez",
            areaServed: "Colombia",
            url:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://ejemplo.com",
            image: heroBgUrl || undefined,
            address: { "@type": "PostalAddress", addressCountry: "CO" },
            sameAs: [],
            knowsAbout: [
              "Derecho administrativo",
              "Derecho constitucional",
              "Prevención del daño antijurídico",
              "Capacitación sector público",
            ],
          }),
        }}
      />
    </main>
  );
}
