// components/layout/LegalFooter.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND_BLUE = "#0C2E63";
const BRAND_GOLD = "#d48b1e";
const NAVY_BG = "#071a35";

export default function LegalFooter({
  year = new Date().getFullYear(),
  brandName = "Blanco & Ramírez",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FOOTER */}
      <footer
        className="w-full border-t"
        style={{ borderColor: "rgba(212, 139, 30, 0.45)", backgroundColor: NAVY_BG }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
            <p className="text-[11px] md:text-xs tracking-wide text-white/80 text-center sm:text-left">
              © {year} {brandName}. Todos los derechos reservados.
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-[11px] md:text-xs font-medium tracking-wide underline-offset-4 
                         decoration-[0.08em] hover:underline text-white/80 hover:text-white
                         transition-colors"
            >
              Políticas de privacidad y términos
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            {/* Evita que el click dentro cierre el modal */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* Header modal */}
              <div
                className="px-5 md:px-7 py-4 flex items-center justify-between border-b"
                style={{ backgroundColor: NAVY_BG, borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-[0.16em]">
                    Avisos legales
                  </p>
                  <h3 className="text-sm md:text-base font-bold text-white mt-0.5">
                    Políticas de privacidad y términos de uso
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white text-sm font-semibold px-2"
                >
                  Cerrar
                </button>
              </div>

              {/* Contenido scrollable */}
              <div className="px-5 md:px-7 py-4 max-h-[70vh] overflow-y-auto text-neutral-800 text-sm md:text-[15px] leading-relaxed">
                <SectionTitle>1. Responsables del tratamiento de datos</SectionTitle>
                <p className="mb-3">
                  {brandName} actúa como responsable del tratamiento de la información
                  personal recolectada a través de este sitio web y de los canales
                  asociados a la prestación de sus servicios jurídicos.
                </p>

                <SectionTitle>2. Finalidad del tratamiento</SectionTitle>
                <p className="mb-2">
                  La información suministrada por los usuarios podrá ser utilizada, entre
                  otros, para las siguientes finalidades:
                </p>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Atender consultas, solicitudes y comunicaciones remitidas por los usuarios.</li>
                  <li>Gestionar la relación contractual o precontractual con clientes y aliados.</li>
                  <li>Cumplir obligaciones legales y regulatorias aplicables a la firma.</li>
                  <li>Remitir información relevante sobre servicios jurídicos y actualizaciones normativas, cuando el usuario lo autorice.</li>
                </ul>

                <SectionTitle>3. Derechos de los titulares</SectionTitle>
                <p className="mb-2">
                  Los titulares de la información podrán ejercer, entre otros, los
                  siguientes derechos:
                </p>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li>Conocer, actualizar y rectificar sus datos personales.</li>
                  <li>Solicitar la supresión de sus datos cuando resulte procedente.</li>
                  <li>Revocar la autorización otorgada para el tratamiento, en los casos que aplique.</li>
                  <li>Presentar quejas ante la autoridad competente por infracciones a la normativa de protección de datos.</li>
                </ul>

                <SectionTitle>4. Conservación de la información</SectionTitle>
                <p className="mb-3">
                  Los datos personales serán conservados por el tiempo necesario para
                  cumplir las finalidades indicadas y las exigencias legales o contractuales
                  aplicables a la firma.
                </p>

                <SectionTitle>5. Uso del sitio web</SectionTitle>
                <p className="mb-3">
                  El contenido publicado en este sitio tiene fines informativos y no
                  constituye asesoría jurídica específica. Cualquier decisión debe adoptarse
                  con base en una consulta directa y personalizada con profesionales de la
                  firma.
                </p>

                <SectionTitle>6. Actualizaciones</SectionTitle>
                <p className="mb-1">
                  {brandName} podrá modificar estas políticas en cualquier momento para
                  atender cambios normativos o institucionales. Las versiones actualizadas
                  serán publicadas en este mismo espacio.
                </p>

                <p className="mt-4 text-xs text-neutral-500 italic">
                  Si desea ejercer sus derechos como titular de datos o conocer la versión
                  completa de nuestras políticas, puede comunicarse a través de los canales
                  oficiales de contacto de la firma.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Subcomponente para títulos de sección del modal */
function SectionTitle({ children }) {
  return (
    <h4
      className="mt-3 mb-1 font-semibold text-sm md:text-[15px]"
      style={{ color: BRAND_BLUE }}
    >
      {children}
    </h4>
  );
}
