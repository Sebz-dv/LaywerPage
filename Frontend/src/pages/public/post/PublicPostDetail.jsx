// src/pages/public/simple-posts/PublicPostDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import postsService from "../../../services/postsService";
import { teamService } from "../../../services/teamService";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import fallbackHero from "../../../assets/about/hero.jpg";

const cx = (...xs) => xs.filter(Boolean).join(" ");

function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString();
}
function readingTime(text) {
  if (!text) return null;
  const words = String(text).trim().split(/\s+/).length || 0;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min`;
}
function useFadeUpSlow() {
  const prefersReduced = useReducedMotion();
  return useMemo(
    () => ({
      hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
      show: {
        opacity: 1,
        y: 0,
        filter: "blur(0)",
        transition: prefersReduced
          ? { duration: 0.35 }
          : { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    [prefersReduced]
  );
}

const letterAvatar = (name = "U") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='#eef2ff'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial' font-size='72' fill='#3730a3'>${(
      name || "U"
    )
      .trim()
      .charAt(0)
      .toUpperCase()}</text></svg>`
  )}`;

/* ===== Helpers ===== */
function isImage(att = {}) {
  const m = String(att.mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;
  const u = String(att.url || att.path || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|avif|svg)$/.test(u);
}

export default function PublicPostDetail() {
  // ✅ ahora es slug (porque tu ruta es /public/simple-posts/:slug)
  const { slug } = useParams();

  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [author, setAuthor] = useState(null);
  const fade = useFadeUpSlow();

  // Parallax suave del hero
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1.06, 1]);

  /* ========= Fetch post (PUBLICO por SLUG) ========= */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    setPost(null);
    setAuthor(null);

    postsService
      .getBySlug(slug) // ✅ PUBLICO: por slug
      .then((p) => {
        if (!alive) return;
        setPost(p);
        if (p?.title) document.title = `${p.title} · Publicaciones`;
      })
      .catch((e) => {
        console.error(e);
        if (alive) setErr(e?.message || "No se pudo cargar");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [slug]);

  /* ========= Resolver autor ========= */
  useEffect(() => {
    setAuthor(null);
    const rawAuthor = post?.author;
    if (!rawAuthor) return;

    if (
      typeof rawAuthor === "object" &&
      (rawAuthor.name || rawAuthor.slug || rawAuthor.avatar_url)
    ) {
      setAuthor(rawAuthor);
      return;
    }

    const idOrSlug =
      typeof rawAuthor === "number" || typeof rawAuthor === "string"
        ? String(rawAuthor)
        : null;

    if (!idOrSlug) return;

    const ac = new AbortController();
    teamService
      .get(idOrSlug, { signal: ac.signal })
      .then((person) => setAuthor(person))
      .catch((e) => {
        console.warn("No se pudo resolver autor con teamService.get:", e);
        setAuthor(null);
      });

    return () => ac.abort();
  }, [post?.author]);

  const rtime = useMemo(() => readingTime(post?.text), [post?.text]);

  const heroUrl = useMemo(() => {
    const list = Array.isArray(post?.attachments) ? post.attachments : [];
    const img = list.find(isImage);
    return img?.url || fallbackHero;
  }, [post?.attachments]);

  async function handleShare() {
    try {
      const shareData = {
        title: post?.title || "Publicación",
        text: post?.info || "",
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Enlace copiado al portapapeles");
      }
    } catch {
      //
    }
  }
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado");
    } catch {
      //
    }
  }

  return (
    <main className="bg-app min-h-dvh">
      {/* ===== HERO ===== */}
      <section className="relative h-[50svh] min-h-[260px] overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img
            src={heroUrl}
            alt="Detalle de publicación"
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
        </motion.div>

        <div className="relative z-10 h-full">
          <div className="mx-auto h-full max-w-5xl lg:max-w-6xl px-4 sm:px-6 flex flex-col justify-end pb-6">
            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              className={cx(
                "mt-4 font-display text-white drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]",
                "text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.03em]",
                "break-words [word-break:break-word] [overflow-wrap:anywhere] text-balance"
              )}
              style={{
                letterSpacing: "0.04em",
                fontKerning: "normal",
                fontOpticalSizing: "auto",
                textRendering: "optimizeLegibility",
              }}
            >
              {loading ? "Cargando…" : post?.title || "—"}
            </motion.h1>

            {!loading && post?.info && (
              <motion.p
                variants={fade}
                initial="hidden"
                animate="show"
                className={cx(
                  "mt-2 font-subtitle text-base sm:text-lg text-white/95",
                  "max-w-none lg:max-w-4xl",
                  "break-words [word-break:break-word] [overflow-wrap:anywhere]"
                )}
              >
                {post.info}
              </motion.p>
            )}

            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              className="flex items-center justify-between gap-3"
            >
              <Link
                to="/public/simple-posts"
                className={cx(
                  "inline-flex items-center justify-center sm:justify-start gap-2 rounded-full mt-2",
                  "px-2   text-sm  ",
                  "bg-secondary text-white shadow-md",
                  "hover:bg-[#4374b8] hover:shadow-lg",
                  "transition-colors transition-shadow"
                )}
              >
                <span className="text-lg">←</span>
                <span>Ver todas las publicaciones</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO ===== */}
      <section className="mx-auto max-w-5xl lg:max-w-6xl px-4 sm:px-6 py-8">
        {loading ? (
          <div className="card card-pad">
            <div className="h-6 w-2/3 bg-muted rounded mb-3" />
            <div className="h-4 w-1/2 bg-muted rounded mb-2" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded mt-3" />
          </div>
        ) : err ? (
          <div className="card card-pad">
            <p className="text-red-600">{err}</p>
            <div className="mt-3">
              <button className="btn btn-primary" onClick={() => navigate(0)}>
                Reintentar
              </button>
            </div>
          </div>
        ) : !post ? (
          <div className="card card-pad text-muted">No encontrado.</div>
        ) : (
          <article
            className={cx(
              "card card-pad space-y-8",
              "break-words [word-break:break-word] [overflow-wrap:anywhere]"
            )}
          >
            {/* Meta / acciones */}
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Autor */}
                {author ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        author.avatar_url ||
                        letterAvatar(author.name || author.slug)
                      }
                      alt={author.name || "Autor"}
                      className="h-10 w-10 rounded-full border object-cover flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {author.slug ? (
                          <Link className="link" to={`/equipo/${author.slug}`}>
                            {author.name || author.slug}
                          </Link>
                        ) : (
                          author.name || "Autor"
                        )}
                      </div>
                      <div className="text-xs text-soft">
                        Publicado {timeAgo(post.created_at)}
                        {rtime ? ` · ${rtime} de lectura` : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-soft">
                    Publicado {timeAgo(post.created_at)}
                    {rtime ? ` · ${rtime} de lectura` : ""}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="btn btn-outline" onClick={handleShare}>
                  Compartir
                </button>
                <button className="btn btn-outline" onClick={handleCopyLink}>
                  Copiar enlace
                </button>
              </div>
            </motion.div>

            {/* Texto principal */}
            {post.text && (
              <motion.section
                variants={fade}
                initial="hidden"
                animate="show"
                className={cx(
                  "prose prose-neutral dark:prose-invert max-w-none",
                  "prose-img:max-w-full prose-img:h-auto",
                  "prose-table:w-full prose-table:overflow-x-auto",
                  "prose-a:break-words prose-code:break-words"
                )}
              >
                <p className="whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere]">
                  {post.text}
                </p>
              </motion.section>
            )}

            {/* Enlaces */}
            {(post.links?.length || 0) > 0 && (
              <motion.section
                variants={fade}
                initial="hidden"
                animate="show"
                className="mt-2"
              >
                <h3 className="font-display text-lg mb-3">Enlaces</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {post.links.map((l, i) => (
                    <li key={i} className="card card-pad">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="link font-subtitle break-words [word-break:break-word] [overflow-wrap:anywhere]"
                        title={l.url}
                      >
                        {l.label || l.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Comentarios */}
            {(post.comments?.length || 0) > 0 && (
              <motion.section
                variants={fade}
                initial="hidden"
                animate="show"
                className="mt-2"
              >
                <h3 className="font-display text-lg mb-3">Comentarios</h3>
                <ul className="space-y-3">
                  {post.comments.map((c, i) => {
                    const img = c?.image?.url || c?.imageUrl || null;
                    return (
                      <li
                        key={c.id || i}
                        className="rounded-xl border p-3 flex gap-3 break-words [word-break:break-word] [overflow-wrap:anywhere]"
                      >
                        <img
                          src={letterAvatar(c?.user || "U")}
                          alt={c?.user || "Usuario"}
                          className="h-9 w-9 rounded-full border object-cover flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium truncate">
                              {c?.user || "Anónimo"}
                            </div>
                            <div className="text-xs text-soft whitespace-nowrap">
                              {timeAgo(c?.created_at)}
                            </div>
                          </div>
                          {c?.body && (
                            <p className="mt-1 text-sm break-words [word-break:break-word] [overflow-wrap:anywhere]">
                              {c.body}
                            </p>
                          )}
                          {img && (
                            <div className="mt-2">
                              <img
                                src={img}
                                alt="Imagen del comentario"
                                className="max-h-56 max-w-full rounded-lg border object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
