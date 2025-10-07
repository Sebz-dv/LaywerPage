// src/pages/PracticeAreasPage.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";
import { practiceAreasService as svc } from "../../services/practiceAreasService.js";
import FeaturedAreas from "../../components/practice/FeaturedAreas.jsx";
import SectionBlock from "../../components/practice/SectionBlock.jsx";
import {
  FeaturedSkeleton,
  GridSkeleton,
} from "../../components/practice/Skeletons.jsx";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ================== Helpers ================== */
const asArray = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

const mapFeatured = (it) => ({
  key: it.slug ?? String(it.id ?? ""),
  title: it.title ?? "",
  subtitle: it.subtitle ?? "",
  bullets: Array.isArray(it.bullets) ? it.bullets : [],
  to: it.slug ? `/areas/${it.slug}` : "#",
  icon: it.icon ?? null,
  cover: it.cover ?? it.image ?? null,
});

const mapOthers = (it) => ({
  slug: it.slug ?? String(it.id ?? ""),
  title: it.title ?? "",
  subtitle: it.subtitle ?? "",
  excerpt: it.excerpt ?? "",
  to: it.slug ? `/areas/${it.slug}` : "#",
  icon: it.icon ?? null,
});

/* ================== Hero ================== */
function Hero({ title, subtitle, image, alt = "" }) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);

  // Parallax con scroll global
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -120]
  );

  // Ken Burns suave
  const imgInitial = { opacity: 0, scale: reduceMotion ? 1 : 1.06 };
  const imgAnimate = { opacity: 1, scale: 1 };
  const imgTransition = { duration: 1.1, ease: "easeOut" };

  // Animación del cuadro (card)
  const boxInitial = { opacity: 0, y: 14, scale: reduceMotion ? 1 : 0.995 };
  const boxAnimate = { opacity: 1, y: 0, scale: 1 };
  const boxTransition = { duration: 0.55, ease: "easeOut" };

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      {/* Imagen con parallax */}
      <motion.div
        style={{ y: yHero }}
        className="absolute inset-0 will-change-transform"
      >
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
        {/* Gradiente para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-transparent" />
      </motion.div>

      {/* Espaciador para la altura del hero */}
      <div className="h-[58svh] md:h-[68svh] lg:h-[76svh]" />

      {/* Card con título + subtítulo */}
      <div className="relative z-10 max-w-6xl mx-auto -mt-[22svh] md:-mt-[26svh] lg:-mt-[30svh] px-4">
        <motion.div
          initial={boxInitial}
          animate={boxAnimate}
          transition={boxTransition}
          className={cx(
            "max-w-3xl rounded-2xl p-5 md:p-7",
            // Fondo semitransparente + blur (si está disponible)
            "bg-background/80 supports-[backdrop-filter]:backdrop-blur-md",
            // Tipografía y contrastes
            "text-foreground",
            // Borde y sombra sutiles
            "border border-border/60 shadow-xl mb-2 text-white"
          )}
        >
          <div className="relative">
             
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
              {title}
            </h1>
          </div>

          {subtitle ? (
            <p
              className="mt-2 md:mt-3 text-base md:text-lg text-muted-foreground"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </motion.div>
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
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [resFeat, resOther] = await Promise.all([
          svc.list(
            { featured: 1, active: 1, sort: "order", per_page: 60 },
            { signal: ac.signal }
          ),
          svc.list(
            { featured: 0, active: 1, sort: "order,title", per_page: 100 },
            { signal: ac.signal }
          ),
        ]);
        setFeatured(asArray(resFeat).map(mapFeatured));
        setOthers(asArray(resOther).map(mapOthers));
      } catch (e) {
        if (ac.signal.aborted) return;
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
                  key: "aduanas",
                  title: "Aduanas",
                  subtitle: "Operaciones y cumplimiento aduanero.",
                  bullets: [
                    "Clasificación",
                    "Valoración y origen",
                    "Planificación import/export",
                  ],
                  to: "/areas/aduanas",
                  icon: "https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/ship.svg",
                  cover: null,
                },
              ]
        );
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
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
