import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { practiceAreasService as svc } from "../../../services/practiceAreasService.js";
import FeaturedAreas from "../../../components/practice/FeaturedAreas.jsx";
import SectionBlock from "../../../components/practice/SectionBlock.jsx";
import {
  FeaturedSkeleton,
  GridSkeleton,
} from "../../../components/practice/Skeletons.jsx";
import areas from "../../../assets/about/areas.jpg";
import office from "../../../assets/about/office.jpeg";

/* ================== Utils ================== */
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ================== Helpers ================== */
const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const mapFeatured = (it) => ({
  id: it.id,
  key: it.slug ?? String(it.id ?? ""),
  slug: it.slug ?? String(it.id ?? ""), // asegura slug para FeaturedAreas
  title: it.title ?? "",
  subtitle: it.subtitle ?? "",
  bullets: Array.isArray(it.bullets) ? it.bullets : [],
  // 👇 incluimos el id como query param para fallback en el detalle
  to: it.slug ? `/servicios/${it.slug}?id=${it.id}` : "#",
  icon: it.icon ?? it.icon_url ?? null, // fallback seguro
  cover: it.cover ?? it.image ?? null,
});

const mapOthers = (it) => ({
  id: it.id,
  slug: it.slug ?? String(it.id ?? ""),
  title: it.title ?? "",
  subtitle: it.subtitle ?? "",
  excerpt: it.excerpt ?? "",
  // 👇 incluimos el id como query param para fallback en el detalle
  to: it.slug ? `/servicios/${it.slug}?id=${it.id}` : "#",
  icon: it.icon ?? it.icon_url ?? null, // fallback seguro
});

/* ================== Variants ================== */
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

/* ================== Hero (estilo Backdrop) ================== */
function Hero({ title, subtitle, image, alt = "" }) {
  const prefersReduced = useReducedMotion();
  const heroRef = useRef(null);

  // Parallax global suave
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, prefersReduced ? 0 : -120]);

  // Ken Burns sutil
  const imgInitial = { opacity: 0, scale: prefersReduced ? 1 : 1.06 };
  const imgAnimate = { opacity: 1, scale: 1 };
  const imgTransition = { duration: 1.1, ease: "easeOut" };

  return (
    <section ref={heroRef} className={cx("relative overflow-hidden font-display text-white")}>
      {/* Fondo con imagen + tinte + shine */}
      <motion.div style={{ y: yHero }} className="absolute inset-0 will-change-transform">
        {image && (
          <motion.img
            src={image}
            alt={alt}
            initial={imgInitial}
            animate={imgAnimate}
            transition={imgTransition}
            className="h-[58svh] md:h-[68svh] lg:h-[76svh] w-full object-cover object-center select-none pointer-events-none"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
          />
        )}

        {/* Overlay mejorado (más contraste hacia la izquierda) */}
        <div className="absolute inset-0">
          {/* Vignette izquierda fuerte para legibilidad del texto alineado a la izq */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b3a]/85 via-[#0d1b3a]/50 to-transparent" />
          {/* Suavizado diagonal */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#759FBC]/30 mix-blend-multiply" />
          {/* Sombra inferior sutil */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        {/* Shine barrido */}
        {!prefersReduced && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.38) 45%, rgba(255,255,255,.52) 50%, rgba(255,255,255,.32) 55%, transparent 100%)",
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
            animate={{ x: ["0%", "200%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {/* Contenedor del texto (alineado a la izquierda) */}
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-[58svh] md:h-[68svh] lg:h-[76svh] grid">
            <div className="self-center text-left max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className={cx(
                  // ↑ tamaño aumentado
                  "text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.07] tracking-[0.005em]",
                  "drop-shadow-[0_10px_28px_rgba(0,0,0,.35)]"
                )}
                style={{ letterSpacing: "0.01em", fontKerning: "normal", fontOpticalSizing: "auto", textRendering: "optimizeLegibility" }}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className="mt-5 md:mt-6 text-xl md:text-2xl lg:text-[22px] text-white/92 leading-relaxed font-subtitle max-w-xl"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ================== Página ================== */
export default function PracticeAreasPage({ data }) {
  const heroTitle = data?.heroTitle ?? "Áreas de práctica";
  const heroSubtitle =
    data?.heroSubtitle ??
    "Soluciones legales integrales, diseñadas a la medida de cada decisión empresarial.";
  const heroImage = areas;

  const [featured, setFeatured] = useState([]);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Barra de progreso
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]); 

  useEffect(() => {
    // Protección contra setState tras unmount
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [resFeat, resOther] = await Promise.all([
          svc.list({ featured: 1, active: 1, sort: "order", per_page: 60 }),
          svc.list({ featured: 0, active: 1, sort: "order,title", per_page: 100 }),
        ]);

        if (!active) return;
        setFeatured(asArray(resFeat).map(mapFeatured));
        setOthers(asArray(resOther).map(mapOthers));
      } catch (e) {
        if (!active) return;
        setErr(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudieron cargar las áreas."
        );
        // Fallback mínimo
        setFeatured((prev) =>
          prev.length
            ? prev
            : [
                {
                  id: 0,
                  key: "aduanas",
                  slug: "aduanas",
                  title: "Aduanas",
                  subtitle: "Operaciones y cumplimiento aduanero.",
                  bullets: [
                    "Clasificación",
                    "Valoración y origen",
                    "Planificación import/export",
                  ],
                  to: "/servicios/aduanas?id=0",
                  icon: "https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/ship.svg",
                  cover: null,
                },
              ]
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Progreso scroll */}
      <motion.div
        style={{ width }}
        className="fixed left-0 top-0 h-1 z-[60] bg-[hsl(var(--accent))]"
        aria-hidden
      />

      {/* HERO */}
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
        alt="Áreas de práctica - imagen principal"
      />

      {/* Error */}
      {err && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div
            role="status"
            className="rounded-lg border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)] px-3 py-2 text-sm"
          >
            {err}
          </div>
        </div>
      )}

      {/* Destacadas */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-12">
        {loading ? <FeaturedSkeleton /> : <FeaturedAreas items={featured} />}
      </section>

      {/* Otras áreas */}
      <div className="max-w-6xl mx-auto px-4 pb-24 space-y-16">
        <SectionBlock
          section={{
            title: "Más áreas de práctica",
            subtitle: "También apoyamos estos frentes. ¿Cuál le sirve hoy?",
            items: others,
          }}
          loading={loading}
          GridSkeleton={GridSkeleton}
        />
      </div>

      {/* CTA sin dependencias */}
      <section className="relative z-10 bg-[hsl(var(--primary))] text-white" aria-labelledby="about-cta">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 order-1">
              <motion.h3
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                id="about-cta"
                className="text-5xl font-semibold"
              >
                ¿Tiene un reto legal? Hablemos y tracemos la mejor estrategia.
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
                className="text-white/85 mt-3 text-xl"
              >
                Cuéntenos su caso, estamos dispuestos a escucharlo y ayudarlo a tomar las mejores decisiones.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                className="mt-7 flex gap-4"
              >
                <a
                  href="/contacto"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 bg-white text-[hsl(var(--primary))] font-medium hover:opacity-90 transition"
                >
                  Contactar
                </a>
                <a
                  href="/servicios"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 border border-white/40 hover:bg-white/10 transition"
                >
                  Ver servicios
                </a>
              </motion.div>
            </div>

            <div className="lg:col-span-6 order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
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
        </div>
      </section>
    </div>
  );
}
