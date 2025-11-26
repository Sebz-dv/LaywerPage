// components/about/AlliesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import vtp from "../../assets/aliados/VTP.png";

const BRAND_BLUE = "#0C2E63";
const BRAND_GOLD = "#d48b1e";
const NAVY_BG = "#071a35";

const defaultAllies = [
  {
    name: "Alianza Verú Torres",
    logoSrc: vtp,
    logoAlt: "Logo Verú Torres Partners",
    logoHref: "https://www.verutorrespartners.com/", // ajusta al real
    description:
      "La alianza con Verú Torres está conformada por una firma londinense de reconocida trayectoria en litigios y arbitrajes internacionales y una firma colombiana emergente de estudiosos del derecho con amplia experiencia en la administración pública. Tiene como objeto principal la prestación de servicios jurídicos especializados para la defensa de intereses del sector oficial.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: "easeOut" },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AlliesSection({
  title = "Alianzas estratégicas",
  subtitle = "Construimos redes de confianza para fortalecer la defensa del interés público.",
  allies = defaultAllies,
}) {
  const isSingle = allies.length === 1;

  return (
    <section className="w-full">
      {/* Header coherente con WhyUs */}
      <div
        className="w-full"
        style={{ backgroundColor: NAVY_BG, color: "white" }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 pt-6 pb-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.p
              variants={slideUp}
              className="text-xl md:text-2xl font-semibold text-white/90"
            >
              Nuestros aliados
            </motion.p>

            <motion.h2
              variants={slideUp}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1 text-white"
            >
              {title}
            </motion.h2>

            <motion.div
              variants={slideUp}
              className="mx-auto mt-4 mb-2 flex w-24 h-1 overflow-hidden rounded"
            >
              <span
                className="flex-1"
                style={{ backgroundColor: BRAND_GOLD }}
              />
              <span className="flex-1" style={{ backgroundColor: "#fff" }} />
            </motion.div>

            {subtitle && (
              <motion.p
                variants={slideUp}
                className="mt-3 text-sm md:text-base max-w-2xl mx-auto text-white/80"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Zona tipo carrusel: si hay uno, centrado; si hay varios, grilla */}
      <div className="bg-white text-neutral-900 py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className={
              isSingle
                ? "flex justify-center"
                : "grid grid-cols-1 md:grid-cols-2 gap-8"
            }
          >
            {allies.map((ally, idx) => (
              <AllyCard key={ally.name || idx} ally={ally} index={idx} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Card individual, reutilizable */
function AllyCard({ ally, index = 0 }) {
  const {
    logoSrc = "../../assets/aliados/VTP.png",
    logoAlt = "Logo aliado",
    logoHref,
    name = "Alianza Verú Torres",
    description = "",
  } = ally || {};

  return (
    <motion.article
      variants={slideUp}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
      className="flex flex-col sm:flex-row items-center sm:items-center gap-5 md:gap-8 
                 rounded-xl border bg-white shadow-sm px-6 py-6 md:px-8 md:py-7
                 hover:shadow-md hover:-translate-y-1 transition-all duration-300
                 max-w-4xl"
      style={{ borderColor: BRAND_GOLD }}
    >
      {/* Logo a la izquierda (más grande) */}
      <div className="flex-shrink-0 flex flex-col items-center sm:items-center">
        {logoHref ? (
          <a
            href={logoHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={logoAlt}
            className="block"
          >
            <LogoBox logoSrc={logoSrc} logoAlt={logoAlt} />
          </a>
        ) : (
          <LogoBox logoSrc={logoSrc} logoAlt={logoAlt} />
        )}
        <p className="mt-3 text-[10px] tracking-[0.22em] uppercase font-semibold text-neutral-600 text-center">
          Aliado estratégico
        </p>
      </div>

      {/* Texto a la derecha (ligeramente más pequeño) */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <h3
          className="text-base md:text-lg font-bold leading-snug"
          style={{ color: BRAND_BLUE }}
        >
          {name}
        </h3>

        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span
            className="inline-block h-0.5 w-10 rounded-full"
            style={{ backgroundColor: BRAND_GOLD }}
          />
        </div>

        <p className="text-xs md:text-sm leading-relaxed text-neutral-700 max-w-2xl mx-auto sm:mx-0">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

function LogoBox({ logoSrc, logoAlt }) {
  return (
    <div
      className="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-white 
                 flex items-center justify-center overflow-hidden 
                 "
      style={{ borderColor: "#e5e7eb" }}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={logoAlt}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-[11px] text-slate-400 text-center px-3">
          Logo aliado
        </span>
      )}
    </div>
  );
}
