import React, { useMemo, useState, useId } from "react";
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
import equipo from "../../assets/about/equipo.png";
import hero from "../../assets/about/hero.jpg";
import office from "../../assets/about/office.jpeg";

/* =========================================
   Utilidades
========================================= */
const cx = (...xs) => xs.filter(Boolean).join(" ");

/* =========================================
   Tokens de tamaño (rápido de ajustar)
========================================= */
const T = {
  h1: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
  h2: "text-3xl sm:text-4xl md:text-5xl",
  h3: "text-2xl sm:text-3xl md:text-4xl",
  h4: "text-xl sm:text-2xl",
  pLg: "text-lg sm:text-xl",
  p: "text-base sm:text-lg",
  kicker: "text-xs sm:text-sm tracking-[.18em] uppercase",
};

/* =========================================
   Micro-componentes decorativos (opcionales)
========================================= */
const Shine = ({ className }) => (
  <span
    aria-hidden
    className={cx(
      "pointer-events-none absolute inset-0 rounded-[22px]",
      "[mask-image:linear-gradient(180deg,black,transparent_70%)]",
      "before:absolute before:-inset-[40%] before:animate-[spin_10s_linear_infinite]",
      "before:bg-[conic-gradient(from_90deg,transparent,rgba(255,255,255,.33),transparent_30%)]",
      className
    )}
  />
);

const Glow = () => (
  <span
    aria-hidden
    className={cx(
      "absolute -inset-8 rounded-[28px] blur-2xl opacity-50",
      "bg-[radial-gradient(160px_160px_at_18%_10%,hsl(var(--accent)/0.28),transparent_60%),_radial-gradient(220px_220px_at_80%_25%,hsl(var(--primary)/0.20),transparent_60%)]"
    )}
  />
);

/* =========================================
   Datos
========================================= */
const values = [
  {
    icon: <FaStar className="h-6 w-6" />,
    title: "Excelencia",
    desc: "Resultados que reflejan compromiso, rigor y calidad en cada entrega.",
  },
  {
    icon: <FaUsers className="h-6 w-6" />,
    title: "Armonía",
    desc: "Clima de equipo sano, comunicación asertiva y servicio impecable.",
  },
  {
    icon: <FaBalanceScale className="h-6 w-6" />,
    title: "Enfoque colectivo",
    desc: "Capacidades alineadas con un propósito común y visión compartida.",
  },
  {
    icon: <FaHandshake className="h-6 w-6" />,
    title: "Lealtad",
    desc: "Compromiso firme ante escenarios complejos o cambiantes.",
  },
];

/* =========================================
   Helpers de animación
========================================= */
function useFadeInUp() {
  const prefersReduced = useReducedMotion();
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 18 },
      show: {
        opacity: 1,
        y: 0,
        transition: prefersReduced
          ? { duration: 0.28 }
          : { type: "spring", stiffness: 520, damping: 36, mass: 0.58 },
      },
    }),
    [prefersReduced]
  );
}

const staggerContainer = (delay = 0.06) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: delay,
      when: "beforeChildren",
    },
  },
});

/* =========================================
   Subcomponentes semánticos
========================================= */

const Container = ({ className, children }) => (
  <div className={cx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
);

const SectionTitle = ({ id, kicker, title, eyebrowAccent = true }) => (
  <header className="max-w-3xl">
    {kicker && (
      <p className={cx(T.kicker, "text-white font-subtitle")} id={id}>
        {kicker}
      </p>
    )}
    <h2
      className={cx(
        T.h2,
        "font-semibold tracking-tight text-white relative inline-block mt-2"
      )}
    >
      {title}
      {eyebrowAccent && (
        <span className="absolute -bottom-2 left-0 h-[10px] w-14 rounded-full bg-[hsl(var(--accent))]" />
      )}
    </h2>
  </header>
);

const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white bg-[hsl(var(--primary)/.08)] px-3 py-1 text-xs text-white">
    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
    {children}
  </span>
);

const Stat = ({ n, k }) => (
  <motion.article
    variants={useFadeInUp()}
    className="group relative overflow-hidden rounded-2xl p-6 border border-white bg-[hsl(var(--primary)/.06)] backdrop-blur hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_36px_-18px_hsl(var(--primary)/.55)] transition"
  >
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--primary)))]" />
    <div className="relative text-4xl font-semibold tracking-tight text-white">
      {n}
    </div>
    <div className="relative mt-1 text-sm text-white">{k}</div>
  </motion.article>
);

const ValueCard = ({ icon, title, desc }) => (
  <motion.article
    variants={useFadeInUp()}
    whileHover={{ y: -2 }}
    className="group relative overflow-hidden rounded-2xl p-6 border border-token bg-white [background:linear-gradient(120deg,hsl(var(--accent)/.35),transparent_22%,transparent_78%,hsl(var(--primary)/.25))] backdrop-blur hover:border-[hsl(var(--primary))] shadow-[0_10px_30px_-18px_hsl(var(--primary)/.55)] transition will-change-transform"
  >
    <Shine />
    <div className="h-14 w-14 rounded-xl grid place-items-center border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]">
      {icon}
    </div>
    <h4 className={cx(T.h4, "mt-4 font-semibold text-primary")}>{title}</h4>
    <p className={cx(T.p, "mt-1 text-soft")}>{desc}</p>
    <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--accent)/.30),transparent_60%)]" />
  </motion.article>
);

/* =========================================
   Principal
========================================= */
export default function AboutUs() {
  const fadeInUp = useFadeInUp();
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1.06, 1]);
  const titleId = useId();

  const ValueItem = ({ icon: IconOrNode, title, desc, delay = 0 }) => {
    return (
      <motion.article
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
        className="group relative rounded-2xl p-[6px]
        bg-[linear-gradient(172deg,rgba(217,139,30,1)_38%,#ffd30f_100%)]
        dark:bg-[linear-gradient(135deg,#8e786a_0%,#d9c6a6_100%)]
        shadow-[0_8px_36px_-18px_rgba(217,139,30,.4)]
        hover:shadow-[0_18px_80px_-24px_rgba(217,139,30,.55)]
        transition-shadow"
      >
        <div
          className="rounded-[calc(theme(borderRadius.2xl)-6px)] h-full
          bg-[hsl(var(--primary))] text-white p-6 relative overflow-hidden"
        >
          {/* Overlay sutil dorado */}
          <div
            className="absolute -inset-px rounded-[calc(theme(borderRadius.2xl)-6px)] pointer-events-none
          [background:linear-gradient(120deg,rgba(236,214,180,.12),transparent_25%,transparent_75%,rgba(255,230,180,.12))]
          [mask:linear-gradient(white,transparent_30%)]"
          />

          {/* Icono en medallón */}
          <div
            className="relative z-10 mb-4 inline-grid size-12 place-items-center rounded-full
            bg-white/10 ring-1 ring-white/25
            group-hover:bg-white/15 transition-colors"
          >
            {typeof IconOrNode === "function" ? (
              <IconOrNode className="size-6 text-white" aria-hidden />
            ) : (
              <span className="[&>*]:text-white [&>svg]:size-6">
                {IconOrNode}
              </span>
            )}
          </div>

          <h3 className="relative z-10 text-lg font-semibold tracking-tight">
            {title}
          </h3>

          <p className="relative z-10 mt-2 text-sm leading-relaxed text-white/80">
            {desc}
          </p>

          {/* Línea base sutil */}
          <div className="mt-5 h-px w-full bg-white/10" aria-hidden />
        </div>
      </motion.article>
    );
  };

  return (
    <main className="w-full relative overflow-hidden">
      {/* HERO */}
      <section className="relative z-10" aria-labelledby={titleId}>
        <motion.div
          style={{ scale: prefersReduced ? 1 : heroScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={hero}
            alt="Personas trabajando en equipo"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)/.82) 0%, hsl(var(--accent)/.40) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.10]"
            style={{
              background:
                "linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px)_0_0/28px_28px,linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)_0_0/28px_28px",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 [mask-image:linear-gradient(180deg,transparent,black)] bg-[radial-gradient(800px_120px_at_50%_100%,hsl(var(--accent)/.65),transparent_70%)]" />
        </motion.div>

        <Container className="relative py-24 sm:py-28">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide border-white/30 bg-white/10 backdrop-blur text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
          >
            Blanco & Ramírez
          </motion.span>

          <motion.h1
            id={titleId}
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className={cx(
              T.h1,
              "mt-4 font-semibold tracking-tight text-white text-balance drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
            )}
          >
            Comprometidos con la justicia, la educación y la buena
            administración pública.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className={cx(T.pLg, "mt-5 max-w-3xl text-white/95")}
          >
            Asesoría especializada, representación judicial y acompañamiento
            estratégico para entidades y directivos del sector público y
            educativo.
          </motion.p>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <motion.a
              variants={fadeInUp}
              href="/contacto"
              className="btn btn-accent group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))] shadow-[0_12px_32px_-14px_hsl(var(--accent)/.7)]"
            >
              <span className="relative z-10 flex items-center">
                Contactar{" "}
                <FaArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span
                aria-hidden
                className="absolute inset-0 [mask-image:linear-gradient(110deg,transparent,black,transparent)] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.35),transparent)] translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700"
              />
            </motion.a>

            {/* Botón blanco -> ocre al seleccionar/hover */}
            <motion.a
              variants={fadeInUp}
              href="/servicios"
              className="btn bg-white text-black border-[#AC9484]/40 data-[selected=true]:bg-[#AC9484] data-[selected=true]:text-white hover:bg-[#AC9484] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AC9484] focus-visible:ring-offset-2 active:bg-[#AC9484] active:text-white"
              data-selected={false}
            >
              Ver servicios
            </motion.a>
          </motion.div>
        </Container>
      </section>

      {/* INTRO */}
      <section className="relative z-10 " aria-labelledby="about-intro">
        <Container className="py-20 [content-visibility:auto] [contain-intrinsic-size:1000px]">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <figure className="lg:col-span-5 order-2 lg:order-1">
              <span
                className="absolute -top-[-83px] left-8 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1 text-3xl font-semibold tracking-tight
                text-white bg-[hsl(var(--primary))]/90 backdrop-blur
                ring-2 ring-offset-2 ring-offset-black/0 ring-[rgba(217,139,30,0.85)]
                shadow-[0_6px_18px_-8px_rgba(0,0,0,.5)]"
              >
                Quiénes somos
              </span>
              <div className="relative overflow-hidden rounded-2xl border border-token bg-card shadow-[0_10px_40px_-20px_hsl(var(--primary)/.35)] mt-18">
                <img
                  src={equipo}
                  alt="Equipo BR Blanco & Ramírez"
                  className="w-full h-[360px] sm:h-[450px] object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width:1024px) 40vw, 90vw"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(175, 64, 64, 0.1))]"
                  aria-hidden
                />
                <Shine />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 pointer-events-none" />
              </div>
            </figure>

            {/* WRAPPER con borde degradado */}
            <div
              className="lg:col-span-7 order-1 lg:order-2 relative rounded-2xl p-[4px] shadow-xl overflow-hidden
              bg-[linear-gradient(172deg,rgba(217,139,30,1)_38%,#ffd30f_100%)]
              dark:bg-[linear-gradient(135deg,#8e786a_0%,#d9c6a6_100%)]"
            >
              <div
                className="rounded-[calc(theme(borderRadius.2xl)-1px)]
                bg-[hsl(var(--primary))] text-white p-8 sm:p-10 relative overflow-hidden
                bg-opacity-100 backdrop-blur"
              >
                <div
                  className="absolute -inset-px rounded-2xl pointer-events-none
                    [background:linear-gradient(120deg,rgba(236,214,180,.18),transparent_22%,transparent_78%,rgba(255,230,180,.18))]
                    [mask:linear-gradient(white,transparent_25%)]"
                />

                <SectionTitle
                  id="about-intro"
                  title="Equipo jurídico con enfoque institucional"
                  className="text-white [&_*]:text-white [&_.kicker]:text-white/80"
                />

                <p
                  className={cx(
                    T.pLg,
                    "mt-6 leading-relaxed text-pretty text-white/80"
                  )}
                >
                  Fortalecemos la gestión del sector público y educativo
                  combinando rigor académico, experiencia institucional y visión
                  innovadora.
                </p>

                {/* Chips: invertidos para fondo oscuro/primary */}
                <motion.div
                  variants={staggerContainer(0.05)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="mt-6 flex flex-wrap gap-2.5"
                >
                  {[
                    "Derecho administrativo y constitucional",
                    "Sector público y educativo",
                    "Prevención del daño antijurídico",
                    "Acompañamiento estratégico a directivos",
                  ].map((t) => (
                    <motion.div key={t} variants={fadeInUp}>
                      <Chip className="!bg-white/10 !text-white !ring-white/20 hover:!bg-white/15">
                        {t}
                      </Chip>
                    </motion.div>
                  ))}
                </motion.div>

                {/* KPIs: texto e indicadores en blanco */}
                <motion.div
                  variants={staggerContainer(0.06)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 text-white"
                >
                  <Stat
                    n="+12"
                    k="Años de experiencia"
                    className="text-white"
                  />
                  <Stat
                    n="120+"
                    k="Procesos asesorados"
                    className="text-white"
                  />
                  <Stat n="15" k="Entidades formadas" className="text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* PROPÓSITO */}
      <section className="relative z-10" aria-labelledby="about-purpose">
        <Container>
          {/* Card con borde dorado grueso */}
          <div
            className="relative overflow-hidden rounded-2xl p-[4px]
      bg-[linear-gradient(172deg,rgba(217,139,30,1)_38%,#ffd30f_100%)]
      dark:bg-[linear-gradient(135deg,#8e786a_0%,#d9c6a6_100%)]
      shadow-xl hover:shadow-[0_12px_80px_-20px_rgba(217,139,30,.45)] transition-shadow"
          >
            {/* Panel interior primary */}
            <div className="relative rounded-[calc(theme(borderRadius.2xl)-6px)] bg-[hsl(var(--primary))] text-white overflow-hidden">
              <Glow />
              {/* Brillo/texture sutil en el panel */}
              <div
                className="absolute -inset-px rounded-[calc(theme(borderRadius.2xl)-6px)] pointer-events-none
          [background:linear-gradient(120deg,rgba(236,214,180,.16),transparent_22%,transparent_78%,rgba(255,230,180,.16))]
          [mask:linear-gradient(white,transparent_28%)]"
              />

              <div className="relative p-8 sm:p-10">
                <SectionTitle
                  id="about-purpose"
                  kicker="Nuestro propósito"
                  title="Todo se transforma, menos nuestro propósito."
                  eyebrowAccent={false}
                  className="[&_*]:text-white"
                />

                <blockquote
                  className={cx(
                    T.pLg,
                    "mt-5 pl-5 border-l-2 border-white/30 text-white/85 leading-relaxed text-pretty italic"
                  )}
                >
                  Movilizamos a las instituciones mediante asesoría legal
                  estratégica para generar desarrollo social y económico con
                  soluciones sostenibles, conscientes y competitivas.
                </blockquote>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* VALORES */}
      <section className="relative z-10" aria-labelledby="about-values">
        <Container className="py-12">
          <span
            className="absolute -top-[-30px] left-88 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1 text-3xl font-semibold tracking-tight
                text-white bg-[hsl(var(--primary))]/90 backdrop-blur
                ring-2 ring-offset-2 ring-offset-black/0 ring-[rgba(217,139,30,0.85)]
                shadow-[0_6px_18px_-8px_rgba(0,0,0,.5)]"
          >
            Nuestros valores
          </span>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((v, i) => (
              <ValueItem
                key={v.title}
                icon={v.icon}
                title={v.title}
                desc={v.desc}
                delay={i * 0.03}
              />
            ))}
          </motion.div>
        </Container>
      </section>

      {/* IMAGEN AMBIENTE */}
      <section className="relative z-10" aria-label="Espacio de trabajo">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-token bg-card/85 backdrop-blur shadow-[0_16px_52px_-24px_hsl(var(--primary)/.55)]">
            <img
              src={office}
              alt="Espacio de trabajo del equipo"
              className="w-full h-[300px] sm:h-[440px] lg:h-[520px] object-cover"
              loading="lazy"
              decoding="async"
              sizes="100vw"
            />
            <Shine />
          </div>
        </Container>
      </section>

      {/* CTA */}
     <section className="relative z-10" aria-labelledby="about-cta">
  <Container className="py-16">
    {/* Wrapper con borde dorado grueso */}
    <div
      className="relative rounded-2xl p-[6px]
      bg-[linear-gradient(172deg,rgba(217,139,30,1)_38%,#ffd30f_100%)]
      dark:bg-[linear-gradient(135deg,#8e786a_0%,#d9c6a6_100%)]
      shadow-[0_18px_44px_-22px_hsl(var(--primary)/.55)]
      hover:shadow-[0_24px_88px_-26px_rgba(217,139,30,.55)]
      transition-shadow"
    >
      {/* Panel interior primary */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6
        rounded-[calc(theme(borderRadius.2xl)-6px)] px-6 py-8
        bg-[hsl(var(--primary))] text-white backdrop-blur overflow-hidden">
        
        {/* Brillo diagonal sutil */}
        <div className="absolute inset-0 rounded-[calc(theme(borderRadius.2xl)-6px)]
          [background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)]
          opacity-0 sm:opacity-100 pointer-events-none" aria-hidden />
        
        <div className="relative">
          <h3 id="about-cta" className={cx(T.h3, "font-semibold text-white")}>
            Conversemos sobre tus retos institucionales
          </h3>
          <p className={cx(T.p, "text-white/80")}>
            Un diagnóstico claro, un plan accionable y acompañamiento cercano.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          {/* Botón primario blanco sobre primary */}
          <a
            href="/contacto"
            className="group relative inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold
              text-[hsl(var(--primary))] bg-white
              ring-1 ring-white/20 shadow-[0_12px_32px_-14px_rgba(255,255,255,.55)]
              hover:shadow-[0_16px_44px_-16px_rgba(255,255,255,.65)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60
              transition-all"
          >
            <span className="relative z-10 flex items-center">
              Contactar <FaArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </span>
            {/* Shine */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl
                [mask-image:linear-gradient(110deg,transparent,black,transparent)]
                bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.5),transparent)]
                translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700"
            />
          </a>

          {/* (Opcional) Botón secundario borde blanco — descomenta si lo quieres
          <a
            href="/agenda"
            className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold
              text-white bg-transparent ring-1 ring-white/40 hover:bg-white/10 transition-colors"
          >
            Agendar llamada
          </a>
          */}
        </div>
      </div>
    </div>
  </Container>
</section>


      {/* Structured data (SEO para firma legal) */}
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
            image: hero,
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

      <style>{`@keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </main>
  );
}
