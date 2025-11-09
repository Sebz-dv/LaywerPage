// TeamFinderMini.jsx
"use client";
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../../lib/api"; // ✅ Importar api
import { resolveAssetUrl } from "../../lib/origin"; // ✅ Importar helper

/* ================= Utils ================= */
const cx = (...xs) => xs.filter(Boolean).join(" ");
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Fallback avatar base64 (gris)
const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>';

/* ================= Componente principal ================= */
export default function TeamFinderMini({
  className = "",
  basePath = "/equipo",
  pageSize = 6,
  ctaHref = "/equipo",
  ctaLabel = "Conoce más de nuestro equipo",
  imageFit = "cover",
}) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    // ✅ Usar axios en lugar de fetch
    api
      .get("/team", {
        params: {
          per_page: pageSize,
          page: 1,
          order_by: "id",
          order: "asc",
        },
        signal: ctrl.signal,
      })
      .then((response) => {
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        const ordered = data.slice().sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));
        setItems(ordered.slice(0, pageSize));
      })
      .catch((e) => {
        if (e.name !== "AbortError" && e.name !== "CanceledError") {
          setError(e.message || "Error");
        }
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [pageSize]);

  return (
    <section className={cx("w-full", className)}>
      {/* Grid (6) */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => {
            const slug = p.slug ?? slugify(p.nombre);
            const key = p.id ?? slug ?? `row-${i}`;
            const imgSrc = resolveAssetUrl(p.foto_url); // ✅ Usar helper
            return (
              <MiniTeamCard
                key={key}
                imgSrc={imgSrc}
                nombre={p.nombre}
                cargo={p.cargo}
                area={p.area}
                ciudad={p.ciudad}
                href={`${basePath}/${slug}`}
                imageFit={imageFit}
              />
            );
          })}

          {/* Skeletons */}
          {loading &&
            items.length === 0 &&
            Array.from({ length: pageSize }).map((_, k) => (
              <div
                key={`mini-skeleton-${k}`}
                className="card card-pad overflow-hidden relative rounded-xl p-5 border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="aspect-[4/3] w-full rounded-lg bg-[hsl(var(--muted))] relative overflow-hidden" />
                <div className="mt-4 h-4 w-2/3 bg-[hsl(var(--muted))] rounded" />
                <div className="mt-2 h-3 w-1/2 bg-[hsl(var(--muted))] rounded" />
                <div className="mt-2 h-3 w-1/3 bg-[hsl(var(--muted))] rounded" />
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ))}
        </div>

        {/* Vacío / error */}
        {!loading && items.length === 0 && (
          <p className="mt-6 text-sm text-muted">
            {error ? `Error: ${error}` : "Sin perfiles por ahora."}
          </p>
        )}

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <Link
            to={ctaHref}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-colors",
              "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent",
              "hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/0.5]"
            )}
          >
            {ctaLabel}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M7 12h10M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ===================== Subcomponentes internos ===================== */
function MiniTeamCard({ imgSrc, nombre, cargo, area, ciudad, href, imageFit }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <motion.article
      whileHover={prefersReduced ? undefined : { y: -3 }}
      whileTap={{ scale: prefersReduced ? 1 : 0.995 }}
      className={cx(
        "rounded-xl p-5 shadow-sm transition-shadow",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        "hover:shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.35)]",
        "hover:border-[hsl(var(--primary)/0.55)]"
      )}
    >
      {/* Imagen */}
      <div
        className={cx(
          "relative aspect-[4/3] w-full rounded-lg overflow-hidden",
          imageFit === "contain" ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--primary)/0.06)]"
        )}
      >
        {!imgLoaded && (
          <>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.1s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-[2px] opacity-70" />
          </>
        )}
        {imgSrc ? (
          <motion.img
            src={imgError ? FALLBACK_AVATAR : imgSrc}
            alt={nombre}
            decoding="async"
            loading="lazy"
            draggable="false"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            initial={{ opacity: 0, scale: imageFit === "cover" ? 1.015 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReduced ? { duration: 0.2 } : { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            className={cx(
              "absolute inset-0 h-full w-full object-center",
              imageFit === "cover" ? "object-cover" : "object-contain",
              imgLoaded ? "blur-0" : "blur-[6px]"
            )}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[hsl(var(--fg))/0.5] text-sm">
            Foto
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 ring-0 ring-offset-0" />
      </div>

      <h3 className="mt-4 text-lg font-semibold">{nombre}</h3>
      <p className="text-sm text-[hsl(var(--fg))/0.85]">{cargo}</p>
      <p className="text-sm text-[hsl(var(--fg))/0.7]">
        {area} · {ciudad}
      </p>

      <div className="mt-4">
        <Link
          to={href}
          className={cx(
            "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent",
            "hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/0.5]"
          )}
        >
          Ver Perfil
          <motion.svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" initial={false} whileHover={{ x: 2 }} transition={{ duration: 0.18 }}>
            <path d="M7 12h10M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </motion.svg>
        </Link>
      </div>
    </motion.article>
  );
}