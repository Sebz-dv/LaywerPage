import React from "react";
import { motion } from "framer-motion";
import hero from "../../assets/about/justice.jpg"; // asegura el path

export default function Backdrop() {
  return (
    <section
      aria-labelledby="backdrop-title"
      className={[
        "relative mt-16 overflow-hidden",
        "flex flex-col items-center justify-center text-center",
        "px-4 py-20 md:py-28",
        "bg-[#0D1B3A] text-white",
        "font-display", // 👈 Minion VC por defecto en toda la sección
      ].join(" ")}
    >
      {/* Fondo con imagen + tinte */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={hero}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-left md:object-center"
          loading="eager"
          decoding="async"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(117,159,188,.45) 100%)",
          }}
        />
      </div>

      {/* Contenido por encima */}
      <motion.h1
        id="backdrop-title"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 font-display text-4xl md:text-6xl font-semibold tracking-[0.02em] leading-[1.15]"
        style={{
          letterSpacing: "0.02em",
          fontKerning: "normal",
          fontOpticalSizing: "auto",
          textRendering: "optimizeLegibility",
        }}
      >
        Comprometidos con la justicia, la educación y la buena administración
        pública.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="relative z-10 font-display mt-6 max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed"
      >
        En{" "}
        <strong className="font-subtitle font-semibold text-white tracking-[0.02em]">
          Blanco &amp; Ramírez Abogados S.A.S.
        </strong>{" "}
        fortalecemos la gestión jurídica del sector público y educativo,
        brindando asesoría, representación y acompañamiento estratégico con rigor
        académico, experiencia y una visión innovadora que protege derechos y
        promueve el desarrollo del país.
      </motion.p>
    </section>
  );
}
