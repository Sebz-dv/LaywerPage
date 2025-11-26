// src/components/about/DataView.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import br from "../../assets/about/br.png";
import { settingsService } from "../../services/settingsService";
import { mediaService } from "../../services/mediaService";
import { resolveAssetUrl } from "../../lib/origin";

// ✅ Renombrado para evitar Sonar javascript:S2137
export default function BrandDataView() {
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("Blanco & Ramírez");

  // 👉 nueva: imagen de fondo para la sección fundadores
  const [foundersHeroUrl, setFoundersHeroUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await settingsService.get();
        setBrandLogoUrl(s.logo_url || "");
        setBrandName(s.site_name || "Blanco & Ramírez");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar settings:", e);
      }

      // Cargar imagen del slot "fundadores_hero"
      try {
        const data = await mediaService.getByKey("fundadores_hero");
        // si el back ya devuelve URL absoluta, puedes usarla directo
        const url = data?.url ? resolveAssetUrl(data.url) : "";
        setFoundersHeroUrl(url);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("No se pudo cargar media slot fundadores_hero:", e);
      }
    })();
  }, []);

  // Logo: si viene de back, lo resolvemos; si no, fallback local
  const logoSrc = brandLogoUrl ? resolveAssetUrl(brandLogoUrl) : br;

  // Fondo hero: usa el slot fundadores_hero si existe; si no, br
  const foundersBg = foundersHeroUrl || br;

  return (
    <section className="w-full bg-white text-neutral-900 overflow-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* Columna de texto */}
        <div className="flex flex-col justify-center px-6 md:px-10 lg:px-16 pt-4 md:pt-12 pb-12 md:pb-20">
          {/* Logo + nombre animado */}
          <motion.div
            className="mb-8 flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.img
              src={logoSrc}
              alt={brandName}
              width={80}
              height={80}
              className="h-16 w-auto object-contain select-none"
              loading="eager"
              onError={(e) => {
                // Si el back no responde la imagen del logo, caemos al asset local `br`
                e.currentTarget.src = br;
              }}
            />
            <motion.span
              className="text-xl md:text-2xl font-bold tracking-tight text-[#0C2E63]"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              {brandName}
            </motion.span>
          </motion.div>

          {/* Título */}
          <motion.h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-6 font-['Minion_VC']"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          >
            Comprometidos con la justicia, <br />
            la educación y la buena <br />
            administración pública.
          </motion.h1>

          {/* Línea decorativa */}
          <motion.div
            className="w-28 h-1 mb-6 flex gap-1 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            <span className="flex-1 bg-[#d48b1e]" />
            <span className="flex-1 bg-[#0C2E63]" />
          </motion.div>

          {/* Párrafo */}
          <motion.p
            className="text-base md:text-lg leading-relaxed text-neutral-800 font-['Avenir_Next']"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            En Blanco &amp; Ramírez Abogados S.A.S. trabajamos por fortalecer la
            gestión jurídica del sector público y educativo, brindando asesoría
            especializada, representación judicial y acompañamiento estratégico
            a entidades y directivos. Combinamos rigor académico, experiencia
            institucional y visión innovadora para ofrecer soluciones que
            protegen derechos, previenen riesgos y contribuyen al desarrollo del
            país.
          </motion.p>
        </div>

        {/* Imagen con animación de entrada lateral - DESKTOP */}
        <motion.div
          className="hidden md:block bg-right bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${foundersBg})`,
            minHeight: "600px",
          }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Imagen móvil */}
        <motion.div
          className="block md:hidden h-72 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${foundersBg})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </div>
    </section>
  );
}
