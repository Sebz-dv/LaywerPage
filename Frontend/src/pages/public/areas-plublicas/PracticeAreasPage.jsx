import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";
import { practiceAreasService as svc } from "../../../services/practiceAreasService.js";
import FeaturedAreas from "../../../components/practice/FeaturedAreas.jsx";
import SectionBlock from "../../../components/practice/SectionBlock.jsx";
import {
  FeaturedSkeleton,
  GridSkeleton,
} from "../../../components/practice/Skeletons.jsx";

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
        {/* Tinte para legibilidad */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(117,159,188,.45) 100%)",
          }}
        />
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

      {/* Contenedor del texto */}
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-[58svh] md:h-[68svh] lg:h-[76svh] grid place-items-center text-center">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 26, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className={cx(
                  "text-4xl md:text-6xl font-semibold leading-[1.15] tracking-[0.02em] text-balance",
                  "drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
                )}
                style={{ letterSpacing: "0.02em", fontKerning: "normal", fontOpticalSizing: "auto", textRendering: "optimizeLegibility" }}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 18, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className="mt-4 md:mt-6 mx-auto max-w-3xl text-lg md:text-xl text-white/92 leading-relaxed font-subtitle"
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

export default function PracticeAreasPage({ data }) {
  const heroTitle = data?.heroTitle ?? "Áreas de práctica";
  const heroSubtitle =
    data?.heroSubtitle ??
    "Soluciones legales integrales, diseñadas a la medida de cada decisión empresarial.";
  const heroImage =
    data?.heroImage ??
    "https://godoy.legal/wp-content/uploads/2025/08/areas_1.jpg";

  const [featured, setFeatured] = useState([]);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [resFeat, resOther] = await Promise.all([
          svc.list({ featured: 1, active: 1, sort: "order", per_page: 60 }),
          svc.list({ featured: 0, active: 1, sort: "order,title", per_page: 100 }),
        ]);
        setFeatured(asArray(resFeat).map(mapFeatured));
        setOthers(asArray(resOther).map(mapOthers));
      } catch (e) {
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
        setLoading(false);
      }
    })();
  }, []);

  /* Barra de progreso */
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-primary/12 to-transparent border border-border/60"
        >
          <h3 className="text-xl md:text-2xl font-semibold">
            ¿Tiene un reto legal? Hablemos
          </h3>
          <p className="text-muted-foreground mt-1">
            Cuéntenos su caso y le proponemos una ruta clara y accionable.
          </p>
          <Link
            to="/contacto"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            Contacto
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
