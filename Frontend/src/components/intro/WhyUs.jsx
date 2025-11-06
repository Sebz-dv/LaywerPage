// components/about/WhyUs.jsx
import React from "react";
import { motion } from "framer-motion";

const BRAND_BLUE = "#0C2E63";
const BRAND_GOLD = "#d48b1e";
const NAVY_BG = "#071a35";

const defaultItems = [
  {
    title: "Experiencia y especialización",
    text:
      "Más de una década acompañando entidades públicas y privadas en derecho constitucional, administrativo y políticas públicas. Nuestra trayectoria combina la experiencia institucional con el rigor académico.",
  },
  {
    title: "Solidez académica y pensamiento crítico",
    text:
      "Nuestro equipo está conformado por magísteres, especialistas y docentes universitarios comprometidos con la investigación y la formación jurídica de alto nivel.",
  },
  {
    title: "Acompañamiento integral",
    text:
      "Ofrecemos asesoría, representación y consultoría jurídica desde la planeación hasta la ejecución, garantizando decisiones informadas, seguras y estratégicas.",
  },
  {
    title: "Compromiso con la educación y el servicio público",
    text:
      "Defendemos la educación como derecho fundamental y eje del desarrollo social. Trabajamos para fortalecer las instituciones y promover políticas públicas justas y sostenibles.",
  },
];

export default function WhyUs({
  brandName = "Blanco & Ramírez", 
  items = defaultItems,
  tagline = "Elegirnos es confiar en una firma que combina conocimiento, ética y compromiso con el bien público.",
}) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, ease: "easeOut" } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full">
      {/* === Top: AZUL (header) === */}
      <div className="w-full" style={{ backgroundColor: NAVY_BG, color: "white" }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 pt-6 pb-8"> 
          {/* Títulos centrados en blanco */}
          <motion.div variants={container} initial="hidden" animate="show" className="text-center">
            <motion.p variants={fadeUp} className="text-xl md:text-2xl font-semibold text-white/90">
              Por qué elegir a
            </motion.p>

            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1 text-white">
              {brandName}
            </motion.h2>

            {/* Línea bicolor sobre azul */}
            <motion.div variants={fadeUp} className="mx-auto mt-4 mb-2 flex w-24 h-1 overflow-hidden rounded">
              <span className="flex-1" style={{ backgroundColor: BRAND_GOLD }} />
              <span className="flex-1" style={{ backgroundColor: "#fff" }} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* === Bottom: BLANCO (4 columnas + tagline) === */}
      <div className="bg-white text-neutral-900 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {items.map((it, i) => (
              <motion.article key={i} variants={fadeUp}>
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-2xl font-extrabold select-none" style={{ color: BRAND_GOLD }}>
                    {i + 1}.
                  </span>
                  <h3 className="text-xl font-bold leading-snug" style={{ color: BRAND_BLUE }}>
                    {it.title}
                  </h3>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-neutral-700">{it.text}</p>
              </motion.article>
            ))}
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="text-center italic mt-10 md:mt-12 text-neutral-700"
          >
            {tagline}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
