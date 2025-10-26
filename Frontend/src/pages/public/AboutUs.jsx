// src/pages/AboutUs.jsx
import React from "react";
import {
  FaBalanceScale,
  FaUsers,
  FaHandshake,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const values = [
  { icon: <FaStar className="h-5 w-5" />, title: "Excelencia", desc: "Resultados que reflejan compromiso, rigor y calidad en cada entrega." },
  { icon: <FaUsers className="h-5 w-5" />, title: "Armonía", desc: "Clima de equipo sano, comunicación asertiva y servicio impecable." },
  { icon: <FaBalanceScale className="h-5 w-5" />, title: "Enfoque colectivo", desc: "Capacidades alineadas con un propósito común y visión compartida." },
  { icon: <FaHandshake className="h-5 w-5" />, title: "Lealtad", desc: "Compromiso firme ante escenarios complejos o cambiantes." },
];

const stats = [
  { n: "15+", label: "años de experiencia" },
  { n: "50+", label: "entidades acompañadas" },
  { n: "100%", label: "enfoque público/educativo" },
];

export default function AboutUs() {
  const prefersReduced = useReducedMotion();

  const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced
        ? { duration: 0.25 }
        : { type: "spring", stiffness: 420, damping: 30, mass: 0.6 },
    },
  };

  const containerStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const gridStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
  };

  const hoverLift = prefersReduced
    ? {}
    : { whileHover: { y: -3 }, whileTap: { scale: 0.995 } };

  return (
    <main className="w-full mt-16">
      {/* HERO (sin parallax complejo) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(var(--primary))]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px) 0 0 / 28px 28px",
          }}
        />
        <motion.div
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-subtitle tracking-wide text-[hsl(var(--primary-foreground))] border-white/25 bg-white/10 backdrop-blur"
          >
            BR Blanco &amp; Ramírez
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-[hsl(var(--primary-foreground))] text-balance"
          >
            Comprometidos con la justicia, la educación y la buena administración pública.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-3xl text-[hsl(var(--primary-foreground))/0.92] text-pretty"
          >
            Asesoría especializada, representación judicial y acompañamiento estratégico
            para entidades y directivos del sector público y educativo.
          </motion.p> 
        </motion.div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid gap-8 lg:grid-cols-12"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.3, once: true }}
        >
          <motion.div variants={fadeInUp} className="lg:col-span-7">
            <h2 className="text-2xl font-display font-semibold tracking-tight">
              Quiénes somos
              <motion.span
                className="ml-2 inline-block h-[10px] w-[44px] -mb-[2px] bg-[hsl(var(--accent))] rounded-full align-middle"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ transformOrigin: "left center" }}
              />
            </h2>
            <p className="mt-3 text-[hsl(var(--fg))/0.9] leading-relaxed text-pretty">
              En <strong>Blanco &amp; Ramírez Abogados S.A.S.</strong> fortalecemos la gestión
              jurídica del sector público y educativo combinando rigor académico, experiencia
              institucional y visión innovadora.
            </p>
            <p className="mt-3 text-[hsl(var(--fg))/0.9] leading-relaxed text-pretty">
              Ofrecemos soluciones que protegen derechos, previenen riesgos y contribuyen al
              desarrollo del país: desde litigio estratégico y prevención del daño antijurídico,
              hasta consultoría normativa y acompañamiento a directivos.
            </p>
          </motion.div>

          <motion.aside variants={fadeInUp} className="lg:col-span-5">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-6 relative overflow-hidden">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[hsl(var(--accent))]/20 blur-2xl"
                aria-hidden
              />
              <h3 className="font-semibold">Nuestro enfoque</h3>
              <ul className="mt-3 space-y-2 text-sm text-[hsl(var(--fg))/0.85]">
                <li>• Derecho administrativo y constitucional</li>
                <li>• Sector público y educativo</li>
                <li>• Prevención del daño antijurídico</li>
                <li>• Acompañamiento estratégico a directivos</li>
              </ul>
            </div>
          </motion.aside>
        </motion.div>
      </section>

      {/* PROPÓSITO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.35, once: true }}
          {...hoverLift}
        >
          <motion.div
            className="absolute left-0 top-0 h-full w-[6px] bg-[hsl(var(--accent))]"
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            style={{ transformOrigin: "top center" }}
          />
          <div className="p-6 sm:p-8">
            <p className="text-xs tracking-wide uppercase text-[hsl(var(--fg))/0.7] font-subtitle">
              Nuestro propósito
            </p>
            <h3 className="mt-1 text-xl sm:text-2xl font-display font-semibold tracking-tight">
              Todo se transforma, menos nuestro propósito.
            </h3>
            <blockquote className="mt-3 border-l-2 border-[hsl(var(--accent))] pl-4 text-[hsl(var(--fg))/0.9] text-pretty leading-relaxed">
              Movilizamos a las instituciones mediante asesoría legal estratégica
              para generar desarrollo social y económico con soluciones sostenibles,
              conscientes y competitivas.
            </blockquote>
          </div>
        </motion.div>
      </section>

      {/* VALORES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.h3
          className="text-xl sm:text-2xl font-display font-semibold tracking-tight"
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Nuestros valores
        </motion.h3>

        <motion.div
          className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={gridStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.25, once: true }}
        >
          {values.map((v, i) => (
            <motion.article
              key={i}
              variants={fadeInUp}
              className={cx(
                "group rounded-2xl p-5 border transition",
                "bg-[hsl(var(--card))]/90 border-[hsl(var(--border))] backdrop-blur",
                "hover:border-[hsl(var(--ring))]"
              )}
              {...hoverLift}
            >
              <div className="h-10 w-10 rounded-xl grid place-items-center border border-[hsl(var(--border))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
                {v.icon}
              </div>
              <h4 className="mt-4 font-semibold">{v.title}</h4>
              <p className="mt-1 text-sm text-[hsl(var(--fg))/0.8]">{v.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* CTA FINAL */}
      <section className="relative">
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div
            className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-6 py-6 sm:flex-row sm:items-center"
            {...hoverLift}
          >
            <div>
              <h4 className="text-lg font-display font-semibold tracking-tight">
                Conversemos sobre tus retos institucionales
              </h4>
              <p className="text-sm text-[hsl(var(--fg))/0.8]">
                Un diagnóstico claro, un plan accionable y acompañamiento cercano.
              </p>
            </div>
            <motion.a
              href="/contacto"
              className="btn btn-primary group"
              whileHover={!prefersReduced ? { scale: 1.02 } : {}}
              whileTap={!prefersReduced ? { scale: 0.98 } : {}}
            >
              Contactar
              <FaArrowRight className="ml-1 h-4 w-4" />
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
