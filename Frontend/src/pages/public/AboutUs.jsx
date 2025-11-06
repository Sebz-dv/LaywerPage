import React, { useMemo, useId } from "react";
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
import InfoBlocksSection from "../../components/info/InfoBlocksSection.jsx";

/* ============ Utils ============ */
const cx = (...xs) => xs.filter(Boolean).join(" ");

const T = {
  h1: "text-5xl sm:text-6xl md:text-7xl",
  h2: "text-4xl sm:text-5xl",
  h3: "text-3xl sm:text-4xl",
  h4: "text-2xl sm:text-3xl",
  pLg: "text-xl sm:text-2xl",
  p: "text-lg sm:text-xl",
  kicker: "text-xs sm:text-sm tracking-[.18em] uppercase font-subtitle",
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

/* ============ Animaciones (suaves/lentas) ============ */
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

/* ============ Botón con relleno interno al hover (Avenir solo aquí) ============ */
const BtnInk = ({ href, children, variant = "secondary" }) => {
  const base =
    variant === "secondary"
      ? "btn font-subtitle relative overflow-hidden group btn-secondary"
      : "btn font-subtitle relative overflow-hidden group text-white border border-white/70 bg-transparent hover:text-[hsl(var(--primary-foreground))]";

  // FIX: usar --accent (no --accent-special)
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
      className={base}
    >
      {/* Relleno interno */}
      <span
        aria-hidden
        className={cx(
          "absolute inset-0 -z-0 origin-left scale-x-0 group-hover:scale-x-100",
          "transition-transform duration-700 ease-out",
          fillStyle
        )}
      />
      <span className="relative z-10 flex items-center">
        {children}
        <FaArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.a>
  );
};

/* ============ Subcomponentes ============ */
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
      className="rounded-2xl p-6 bg-card border border-token hover:shadow-lg transition-shadow font-display"
    >
      <div className="h-12 w-12 rounded-xl grid place-items-center bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
        {icon}
      </div>
      <h4 className={cx(T.h4, "mt-4 font-semibold")}>{title}</h4>
      <p className={cx(T.p, "mt-2 text-soft")}>{desc}</p>
    </motion.article>
  );
};

/* ============ Página ============ */
export default function AboutUs() {
  const fade = useFadeUpSlow();
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1.07, 1]); // parallax suave
  const titleId = useId();

  return (
    // Forzamos Minion VC como base para TODO
    <main className="w-full relative overflow-hidden font-display">
      {/* HERO con giro/oscilación + barrido blanco */}
      <section className="relative z-10" aria-labelledby={titleId}>
        <motion.div
          style={{ scale: heroScale }}
          animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 will-change-transform z-0"
        >
          <img
            src={hero}
            alt="Personas trabajando en equipo"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
          />

          {/* Barrido blanco sobre imagen */}
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

          {/* Overlay color */}
          <div
            className="absolute inset-0 mix-blend-multiply z-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)/.85) 0%, hsl(var(--accent)/.42) 100%)",
            }}
          />
        </motion.div>

        <Container className="relative z-10 py-24 sm:py-28 mt-20">
          <motion.h1
            id={titleId}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.h1,
              // más espacio ENTRE LETRAS
              "font-display font-semibold tracking-[0.03em] text-white text-balance drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
            )}
            // quitamos wordSpacing; activamos kerning de la fuente
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

          {/* PÁRRAFO: Minion (no Avenir) */}
          <motion.p
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.pLg,
              "mt-6 max-w-4xl text-white/95 tracking-[0.02em] leading-relaxed"
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
            className="mt-10 flex flex-wrap gap-4"
          >
            {/* Botones: Avenir (resalte) */}
            <BtnInk href="/contacto" variant="secondary">
              Contactar
            </BtnInk>
            <BtnInk href="/servicios" variant="secondary">
              Ver servicios
            </BtnInk>
          </motion.div>
        </Container>
      </section>

      {/* INTRO — Quiénes somos (bg primary, textos blancos) */}
      <section
        className="relative z-10 bg-[hsl(var(--primary))]"
        aria-labelledby="about-intro"
      >
        <Container className="py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Texto IZQUIERDA */}
            <div className="lg:col-span-7 order-1 text-white">
              {/* Kicker: Avenir */}
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.kicker, // ya incluye font-subtitle
                  "font-subtitle", // refuerzo explícito
                  "text-white/85"
                )}
                id="about-intro"
                style={{
                  fontFamily:
                    '"Avenir Next Var","Avenir Next","Avenir","Segoe UI","Inter",system-ui,-apple-system,sans-serif',
                  fontWeight: 600, // Avenir variable: 300–800
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
                  "font-semibold tracking-tight mt-3 text-white"
                )}
              >
                Quiénes somos
              </motion.h2>

              {/* Párrafo: Minion */}
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(
                  T.pLg,
                  "mt-7 leading-relaxed text-pretty text-white/90"
                )}
              >
                Fortalecemos la gestión del sector público y educativo
                combinando rigor académico, experiencia institucional y visión
                innovadora.
              </motion.p>

              {/* Chips: Avenir (grandes de verdad) */}
              <motion.div
                variants={staggerSlow(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-8 flex flex-wrap gap-3.5 sm:gap-4"
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
                      // OVERRIDES sobre .badge (que trae text-xs)
                      "!text-base sm:!text-xl lg:!text-sm",
                      "!px-4 sm:!px-5 lg:!px-6",
                      "!py-2 sm:!py-2.5",
                      "rounded-xl",
                      "!leading-tight tracking-[0.015em]"
                    )}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>

              {/* KPIs — números: Minion / etiquetas: Avenir */}
              <motion.div
                variants={staggerSlow(0.12)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 text-white"
              >
                {[
                  ["+12", "Años de experiencia"],
                  ["120+", "Procesos asesorados"],
                  ["15", "Entidades formadas"],
                ].map(([n, k]) => (
                  <motion.div
                    key={k}
                    variants={fade}
                    className="rounded-2xl border border-white/60 p-6
                         flex flex-col items-center justify-center text-center gap-1
                         min-h-28 sm:min-h-32 hover:border-white transition-colors"
                  >
                    <div className="text-5xl font-semibold">{n}</div>
                    <div className="text-sm text-white/85 font-subtitle">
                      {k}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Imagen DERECHA */}
            <figure className="lg:col-span-5 order-2 relative">
              <motion.div
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="relative overflow-hidden rounded-2xl"
              >
                <img
                  src={equipo}
                  alt="Equipo BR Blanco & Ramírez"
                  className="w-full h-[380px] sm:h-[542px] object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width:1024px) 40vw, 90vw"
                />
              </motion.div>
            </figure>
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
      {/* PROPÓSITO — Valores IZQ (2x2), Texto DER */}
      <section
  className="relative z-10 mt-[-30px] bg-[hsl(var(--primary))] text-white"
  aria-labelledby="about-purpose"
>
  <Container className="py-18 sm:py-20">
    <div className="grid gap-12 lg:grid-cols-12 items-start">
      {/* Texto (Minion) */}
      <div className="lg:col-span-6 mt-23">
        <motion.p
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={cx(
            T.kicker,
            "tracking-[0.22em]",
            "mb-8",
            "text-white/70" // antes: text-primary
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
            "font-semibold",
            "tracking-[0.03em]",
            "text-white" // fuerza blanco sobre cualquier token
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
            "mt-6 pl-5 italic tracking-[0.01em]",
            "text-white/90",
            "border-l-2 border-white/30" // antes: border-token
          )}
          style={{ letterSpacing: "0.01em", lineHeight: 1.7 }}
        >
          Movilizamos a las instituciones mediante asesoría legal estratégica
          para generar desarrollo social y económico con soluciones
          sostenibles, conscientes y competitivas.
        </motion.blockquote>
      </div>

      {/* Valores (Minion en títulos/descripción) */}
      <div className="lg:col-span-6">
        <motion.h3
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className={cx(T.h2, "font-semibold text-center", "text-white")}
        >
          Nuestros valores
        </motion.h3>

        <motion.div
          variants={staggerSlow(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-7 grid gap-7 sm:grid-cols-2 text-primary"
        >
          {values.map((v) => (
            <ValueItem
              key={v.title}
              icon={v.icon}
              title={v.title}
              desc={v.desc}
              // Si tu ValueItem acepta className, mejor aún:
              // className="text-white"
            />
          ))}
        </motion.div>
      </div>
    </div>
  </Container>
</section>


      {/* CTA — Texto IZQ (Minion título / Avenir texto), Imagen DER */}
      <section
        className="relative z-10 bg-[hsl(var(--bg))]"
        aria-labelledby="about-cta"
      >
        <Container className="py-16">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 order-1 text-primary">
              <motion.h3
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                id="about-cta"
                className={cx(T.h2, "font-semibold")}
              >
                Conversemos sobre tus retos institucionales
              </motion.h3>
              {/* CTA texto: Avenir (resalte) */}
              <motion.p
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className={cx(T.p, "text-primary/85 mt-3 font-subtitle")}
              >
                Un diagnóstico claro, un plan accionable y acompañamiento
                cercano.
              </motion.p>
              <motion.div
                variants={staggerSlow(0.14)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="mt-7 flex gap-4"
              >
                <BtnInk href="/contacto" variant="secondary">
                  Contactar
                </BtnInk>
                <BtnInk href="/servicios" variant="secondary">
                  Ver servicios
                </BtnInk>
              </motion.div>
            </div>

            <div className="lg:col-span-6 order-2">
              <motion.div
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="relative overflow-hidden rounded-2xl"
              >
                <img
                  src={office}
                  alt="Colaboración con clientes"
                  className="w-full h-[280px] sm:h-[340px] lg:h-[380px] object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width:1024px) 48vw, 90vw"
                />
              </motion.div>
            </div>
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
    </main>
  );
}
