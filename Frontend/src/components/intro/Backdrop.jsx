import React from "react";
import { motion } from "framer-motion";

export default function Backdrop() {
  const Motios = motion.div;
  return (
    <section
      className={[
        "relative flex flex-col items-center justify-center text-center",
        "px-4 py-20 md:py-28",
        "bg-[#0D1B3A] text-white", // 👈 azul de tu paleta + texto blanco
      ].join(" ")}
    >
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-6xl font-bold tracking-tight"
      >
        Comprometidos con la justicia, la educación y la buena administración
        pública.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mt-6 max-w-2xl text-lg md:text-xl text-white/80"
      >
         En{" "}
        <strong className="font-semibold text-white">
          Blanco & Ramírez Abogados S.A.S.{" "}
        </strong>
        fortalecemos la gestión jurídica del sector público y educativo,
        brindando asesoría, representación y acompañamiento estratégico con
        rigor académico, experiencia y una visión innovadora que protege
        derechos y promueve el desarrollo del país.
      </motion.p>
    </section>
  );
}
