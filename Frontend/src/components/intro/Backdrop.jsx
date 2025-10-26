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
        Defensa legal clara, estratégica y sin sorpresas
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mt-6 max-w-2xl text-lg md:text-xl text-white/80"
      >
        Somos un equipo boutique especializado en{" "}
        <strong className="font-semibold text-white">
          derecho comercial, laboral y litigios
        </strong>
        . Ayudamos a empresas y personas a resolver sus retos legales con
        comunicación directa y resultados medibles.
      </motion.p>
    </section>
  );
}
