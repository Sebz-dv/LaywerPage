// src/pages/PracticeAreasPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { practiceAreasService as svc } from "../../services/practiceAreasService.js";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

/* ================== Variants base ================== */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const popCard = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.25 } },
};

// Cambia a true si quieres limitar líneas con CSS (sin plugin)
const CLAMP = true;

/* ================== Página ================== */
export default function PracticeAreasPage({ data }) {
  // HERO (puedes sobreescribir vía prop `data`)
  const heroTitle = data?.heroTitle ?? "Áreas de práctica";
  const heroSubtitle = data?.heroSubtitle ?? "Soluciones legales integrales, hechas a la medida.";
  const heroImage = data?.heroImage ?? "https://images.unsplash.com/photo-1528747045269-390fe33c19d8?q=80&w=1600&auto=format&fit=crop";

  /* Estado de datos públicos */
  const [featured, setFeatured] = useState([]);      // destacadas (arriba)
  const [others, setOthers] = useState([]);          // el resto (grilla)
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Carga inicial
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const [resFeatured, resOthers] = await Promise.all([
          svc.list({ featured: 1, active: 1, sort: "order", per_page: 60 }),
          svc.list({ featured: 0, active: 1, sort: "order,title", per_page: 100 }),
        ]);

        const mapFeatured = (it) => ({
          key: it.slug,
          title: it.title,
          subtitle: it.subtitle,
          bullets: Array.isArray(it.bullets) ? it.bullets : [],
          to: it.to ?? (it.slug ? `/areas/${it.slug}` : "#"),
          icon: it.icon ?? null,
        });
        const mapOthers = (it) => ({
          slug: it.slug,
          title: it.title,
          subtitle: it.subtitle,
          excerpt: it.excerpt,
          to: it.to ?? (it.slug ? `/areas/${it.slug}` : "#"),
          icon: it.icon ?? null,
        });

        if (!alive) return;
        setFeatured((resFeatured?.data ?? []).map(mapFeatured));
        setOthers((resOthers?.data ?? []).map(mapOthers));
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar las áreas.");
        // Fallback mínimo para no dejar vacío
        setFeatured([
          { key: "aduanas", title: "Aduanas", subtitle: "Operaciones y cumplimiento aduanero.", bullets: ["Clasificación", "Valoración y origen", "Planificación de import/export"], to: "/areas/aduanas", icon: "https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/ship.svg" },
          { key: "comercio-exterior", title: "Comercio exterior", subtitle: "Estrategia, tratados y barreras.", bullets: ["Acuerdos", "Zonas francas", "Licencias y VUCE"], to: "/areas/comercio-exterior", icon: "https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/world.svg" },
          { key: "cambiario", title: "Cambiario", subtitle: "Cuentas y reportes al Emisor.", bullets: ["Inversiones", "Endeudamiento externo", "Sancionatorio"], to: "/areas/cambiario", icon: "https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/currency-dollar.svg" },
        ]);
        setOthers([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* HERO parallax */
  const heroRef = useRef(null);
  const { scrollY } = useScroll({ target: heroRef, offset: ["start end", "end start"] });
  const yHero = useTransform(scrollY, [0, 300], [0, -50]); // parallax suave

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: yHero }} className="absolute inset-0">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              className="h-[42svh] w-full object-cover opacity-85"
              loading="eager"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-semibold tracking-tight"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="mt-3 text-base md:text-lg text-muted-foreground max-w-3xl"
          >
            {heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Aviso de error (si falla API) */}
      {err && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="rounded-lg border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)] px-3 py-2 text-sm">
            {err}
          </div>
        </div>
      )}

      {/* ÁREAS PRINCIPALES con revelado progresivo abajo */}
      <section className="max-w-6xl mx-auto px-4 pt-4 pb-10">
        {loading ? <FeaturedSkeleton /> : <FeaturedAreas items={featured} />}
      </section>

      {/* SECCIONES POR TÍTULO / SUBTÍTULO */}
      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-16">
        <SectionBlock
          section={{
            title: "Más áreas de práctica",
            subtitle: "También apoyamos estas frentes. ¿Cuál le sirve hoy?",
            items: others,
          }}
          loading={loading}
        />
      </div>

      {/* CTA CONTACTO (opcional) */}
      <CallToAction />
    </div>
  );
}

/* ================== Featured Areas (revela una por una) ================== */
function FeaturedAreas({ items }) {
  const [visibleCount, setVisibleCount] = useState(1); // arranca mostrando la primera
  const canShowMore = visibleCount < items.length;

  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Aún no hay áreas destacadas publicadas.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chips con micro-interacciones */}
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
        {items.map((it, i) => {
          const active = i < visibleCount;
          return (
            <motion.button
              key={it.key}
              variants={item}
              onClick={() => setVisibleCount(Math.max(visibleCount, i + 1))}
              className={cx(
                "select-none rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-card/70 text-foreground/80 hover:-translate-y-0.5"
              )}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
            >
              {it.title}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Conector estético */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

      {/* Stack progresivo abajo */}
      <div className="mt-6 space-y-4">
        <AnimatePresence initial={false} mode="popLayout">
          {items.slice(0, visibleCount).map((it, idx) => (
            <motion.div
              key={it.key}
              layout
              variants={popCard}
              initial="hidden"
              animate="show"
              exit="exit"
              className={cx("relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm", "p-5 md:p-6 overflow-hidden")}
            >
              {/* Borde animado sutil */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ border: "1px solid hsl(var(--primary)/0.2)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />

              <div className="flex gap-4">
                {it.icon && (
                  <img
                    src={it.icon}
                    alt=""
                    className="h-10 w-10 rounded-md object-contain opacity-90"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold leading-tight">{it.title}</h3>
                  {it.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{it.subtitle}</p>}
                </div>
              </div>

              {it.bullets?.length > 0 && (
                <ul className="mt-3 grid sm:grid-cols-3 gap-2">
                  {it.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-foreground/80">• {b}</li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Link to={it.to} className="text-sm font-medium text-primary hover:opacity-90">
                  Conocer más →
                </Link>
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs text-muted-foreground"
                >
                  {ordinal(idx + 1)}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Botón “Mostrar siguiente” */}
      {items.length > 1 && (
        <div className="mt-4">
          <button
            disabled={!canShowMore}
            onClick={() => setVisibleCount((n) => Math.min(n + 1, items.length))}
            className={cx(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all",
              canShowMore
                ? "border-primary/50 bg-primary/10 text-primary hover:-translate-y-0.5"
                : "border-border text-muted-foreground cursor-not-allowed"
            )}
          >
            {canShowMore ? "Mostrar siguiente" : "Todo listo ✨"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ================== Secciones estándar ================== */
function SectionBlock({ section, loading }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const controls = useAnimation();
  useEffect(() => { if (inView) controls.start("show"); }, [inView]);

  return (
    <section ref={ref}>
      <motion.header initial="hidden" animate={controls} variants={container} className="mb-6">
        <motion.h2 variants={item} className="text-2xl md:text-3xl font-semibold">
          {section.title}
        </motion.h2>
        {section.subtitle && (
          <motion.p variants={item} className="text-muted-foreground mt-1 max-w-3xl">
            {section.subtitle}
          </motion.p>
        )}
      </motion.header>

      {loading ? (
        <GridSkeleton />
      ) : (
        <motion.ul
          initial="hidden"
          animate={controls}
          variants={container}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch"
        >
          {(section.items ?? []).length === 0 && (
            <li className="col-span-full text-sm text-muted-foreground">No hay áreas para mostrar.</li>
          )}
          {(section.items ?? []).map((it) => (
            <motion.li key={it.slug} variants={item} className="h-full">
              <PracticeAreaCard item={it} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}

function PracticeAreaCard({ item }) {
  return (
    <Link
      to={item.to ?? "#"}
      className={cx(
        "group relative block rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm",
        "p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5",
        "h-full flex flex-col"
      )}
    >
      {/* Glow sutil */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.35)" }}
      />

      {/* Cabecera */}
      <div className="flex items-start gap-4">
        {item.icon && (
          <img
            src={item.icon}
            alt=""
            className="h-10 w-10 rounded-md object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="min-w-0">
          <h3
            className="text-lg md:text-xl font-semibold leading-tight"
            style={
              CLAMP
                ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
                : undefined
            }
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p
              className="text-sm text-muted-foreground leading-snug"
              style={
                CLAMP
                  ? { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }
                  : undefined
              }
            >
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Contenido */}
      {item.excerpt && (
        <p
          className="mt-3 text-sm md:text-[15px] text-muted-foreground"
          style={
            CLAMP
              ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }
              : undefined
          }
        >
          {item.excerpt}
        </p>
      )}

      {/* CTA anclado abajo */}
      <div className="mt-auto pt-4 text-sm font-medium text-primary">
        Conocer más →
      </div>
    </Link>
  );
}

function CallToAction() {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-primary/10 to-transparent border border-border/60">
        <h3 className="text-xl md:text-2xl font-semibold">¿Tiene un reto legal? Hablemos</h3>
        <p className="text-muted-foreground mt-1">
          Cuéntenos su caso y le proponemos una ruta clara y accionable.
        </p>
        <Link
          to="/contacto"
          className="inline-flex mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          Contacto
        </Link>
      </div>
    </section>
  );
}

/* ================== Loaders ================== */
function FeaturedSkeleton() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-36 rounded-full bg-[hsl(var(--muted))]" />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-6">
            <div className="h-4 w-40 bg-[hsl(var(--muted))] rounded" />
            <div className="mt-3 grid sm:grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-3 w-full bg-[hsl(var(--muted))] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-6">
          <div className="h-5 w-48 bg-[hsl(var(--muted))] rounded" />
          <div className="mt-3 h-3 w-full bg-[hsl(var(--muted))] rounded" />
          <div className="mt-2 h-3 w-2/3 bg-[hsl(var(--muted))] rounded" />
        </div>
      ))}
    </div>
  );
}

/* ================== Utils ================== */
function ordinal(n) {
  // Etiquetas: Primero, Segundo, Tercero, etc. (mínimo para 1..5)
  const map = ["Primero","Segundo","Tercero","Cuarto","Quinto"];
  return map[n - 1] ?? `#${n}`;
}
