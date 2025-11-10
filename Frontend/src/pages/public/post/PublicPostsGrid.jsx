// src/pages/public/simple-posts/PublicPostsGrid.jsx
import React, { useEffect, useMemo, useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import postsService from "../../../services/postsService";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import fallbackHero from "../../../assets/about/hero.jpg"; // fallback si no hay adjunto

function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString();
}
const cx = (...xs) => xs.filter(Boolean).join(" ");

function useFadeUpSlow() {
  const prefersReduced = useReducedMotion();
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0)",
        transition: prefersReduced
          ? { duration: 0.35 }
          : { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    [prefersReduced]
  );
}
const staggerSlow = (delay = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, when: "beforeChildren" } },
});

export default function PublicPostsGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const fade = useFadeUpSlow();
  const listId = useId();

  // Parallax suave del hero superior (decorativo)
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1.06, 1]);

  useEffect(() => {
    let alive = true;
    postsService
      .list()
      .then((rows) => alive && setItems(rows))
      .catch((e) => {
        console.error(e);
        if (alive) setErr(e?.message || "Error cargando");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const k = q.toLowerCase();
    return items.filter(
      (it) =>
        (it.title || "").toLowerCase().includes(k) ||
        (it.info || "").toLowerCase().includes(k)
    );
  }, [items, q]);

  return (
    <main className="bg-app min-h-dvh">
      {/* ===== HERO / cabecera de la página ===== */}
      <section className="relative h-[55vh] min-h-[320px] overflow-hidden">
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={fallbackHero}
            alt="Publicaciones"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)/.85) 0%, hsl(var(--accent)/.42) 100%)",
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.35) 45%, rgba(255,255,255,.5) 50%, rgba(255,255,255,.28) 55%, transparent 100%)",
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
            animate={{ x: ["0%", "200%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="relative z-10 h-full">
          <div className="mx-auto h-full max-w-6xl px-4 sm:px-6 flex flex-col justify-end pb-8">
            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              className={cx(
                "font-display text-white drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]",
                "text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[0.03em]"
              )}
              style={{
                letterSpacing: "0.04em",
                fontKerning: "normal",
                fontOpticalSizing: "auto",
                textRendering: "optimizeLegibility",
              }}
            >
              Publicaciones
            </motion.h1>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              className="mt-3 max-w-3xl text-white/95 font-subtitle text-lg md:text-xl"
            >
              Blog con imagen de portada por post. Scrolla sin
              culpa.Conocimiento jurídico aplicado: explicamos lo complejo, para
              que actúes con confianza.
            </motion.p>

            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              className="mt-5 w-full max-w-md"
            >
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título o info…"
                className="input bg-white/95 backdrop-blur text-[hsl(var(--fg))]"
                aria-label="Buscar publicaciones"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== GRID ===== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {loading ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerSlow(0.06)}
            initial="hidden"
            animate="show"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="card overflow-hidden"
              >
                <div className="aspect-[16/9] w-full bg-muted" />
                <div className="p-4">
                  <div className="h-5 w-2/3 bg-muted rounded mb-3" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : err ? (
          <div className="card card-pad border-destructive">
            <p className="text-red-600">{err}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card card-pad text-muted">
            {q
              ? "Sin resultados para tu búsqueda."
              : "No hay publicaciones aún."}
          </div>
        ) : (
          <motion.div
            aria-labelledby={listId}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerSlow(0.08)}
            initial="hidden"
            animate="show"
          >
            <span id={listId} className="sr-only">
              Lista de publicaciones
            </span>

            {filtered.map((it) => {
              // Toma la PRIMERA imagen del arreglo de adjuntos (si existe)
              const cover =
                it.attachments?.find((a) =>
                  (a?.mime || "").startsWith("image/")
                )?.url ||
                it.attachments?.[0]?.url ||
                fallbackHero;

              return (
                <motion.article
                  key={it.id}
                  variants={fade}
                  className={cx(
                    "group card overflow-hidden interactive cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))]"
                  )}
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/public/simple-posts/${it.id}`)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    navigate(`/public/simple-posts/${it.id}`)
                  }
                >
                  {/* Cover image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={cover}
                      alt={it.title || "Imagen de la publicación"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    {/* overlay suave on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>

                  {/* Texto bajo la imagen */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl leading-snug line-clamp-2">
                        {it.title}
                      </h3>
                      <span className="badge shrink-0">
                        {timeAgo(it.created_at)}
                      </span>
                    </div>

                    {it.info && (
                      <p className="mt-2 text-soft line-clamp-3">{it.info}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to={`/public/simple-posts/${it.id}`}
                        className="link font-subtitle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalle →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>
    </main>
  );
}
