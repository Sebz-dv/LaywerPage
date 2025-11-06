// TeamFinder.jsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import team from "../../assets/about/team.jpg";

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

// ✅ API base para JSON
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
// ✅ ORIGIN para archivos estáticos
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const resolveUrl = (u) =>
  !u ? "" : u.startsWith("http") ? u : `${API_ORIGIN}${u}`;

/* ================= Hook: debounce ================= */
function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t?.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t?.current);
  }, [value, delay]);
  return v;
}

/* ================= Hook: autoload (IO) ================= */
function useAutoLoadMore(enabled, onLoad) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onLoad()),
      { rootMargin: "400px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [enabled, onLoad]);
  return ref;
}

// Fallback avatar base64
const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>';

/* ================= Component ================= */
export default function TeamFinder({
  className = "",
  basePath = "/equipo",
  initialTab = "todos", // 'juridico' | 'no-juridico' | 'todos'
  pageSize = 6,
  imageFitDefault = "cover", // 'cover' | 'contain'
  title = "Lideramos el cambio porque tenemos al mejor talento",
  description = "Nuestro equipo multidisciplinario combina experiencia pública, privada y académica para ofrecer asesoría integral y confiable.",
}) {
  // ===== Filtros
  const [tab, setTab] = useState(initialTab);
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("");
  const [ciudad, setCiudad] = useState("");

  // ===== Resultados y facetas
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [facets, setFacets] = useState({ cargos: [], areas: [], ciudades: [] });

  // ===== Red
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debouncedNombre = useDebounce(nombre, 250);

  // ===== Preferencia de ajuste de imagen (persistente)
  const [imageFit, setImageFit] = useState(() => {
    const saved = localStorage.getItem("team_image_fit");
    return saved === "cover" || saved === "contain" ? saved : imageFitDefault;
  });
  useEffect(() => {
    localStorage.setItem("team_image_fit", imageFit);
  }, [imageFit]);

  // ===== Query (añadimos pista de orden por id asc) =====
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (tab !== "todos") p.set("tab", tab);
    if (debouncedNombre) p.set("nombre", debouncedNombre);
    if (cargo) p.set("cargo", cargo);
    if (area) p.set("area", area);
    if (ciudad) p.set("ciudad", ciudad);
    p.set("per_page", String(pageSize));
    p.set("page", String(page));
    p.set("order_by", "id");
    p.set("order", "asc");
    return p.toString();
  }, [tab, debouncedNombre, cargo, area, ciudad, page, pageSize]);

  // ===== Fetch =====
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    fetch(`${API_URL}/team?${query}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const { data, meta } = json || {};
        setLastPage(meta?.last_page ?? 1);
        setFacets({
          cargos: meta?.facets?.cargos ?? [],
          areas: meta?.facets?.areas ?? [],
          ciudades: meta?.facets?.ciudades ?? [],
        });

        const normalized = Array.isArray(data) ? data.slice() : [];
        const ordered =
          page === 1
            ? normalized.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
            : normalized;

        setItems((prev) => (page === 1 ? ordered : [...prev, ...ordered]));
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Error");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [query]); // ← depende solo de query (page ya está en query)

  // Reset page al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [tab, debouncedNombre, cargo, area, ciudad]);

  const canLoad = page < lastPage;
  const prefersReduced = useReducedMotion();
  const sentinelRef = useAutoLoadMore(canLoad && !loading, () =>
    setPage((p) => p + 1)
  );

  // ===== Animations =====
  const gridVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: prefersReduced
        ? { duration: 0.2 }
        : { type: "spring", stiffness: 420, damping: 28, mass: 0.6 },
    },
    hover: prefersReduced ? {} : { y: -3, transition: { duration: 0.18 } },
  };

  // Memo de opciones para Select
  const cargosOpts = useMemo(() => facets.cargos, [facets.cargos]);
  const areasOpts = useMemo(() => facets.areas, [facets.areas]);
  const ciudadesOpts = useMemo(() => facets.ciudades, [facets.ciudades]);

  return (
    <section className={cx("w-full", className)}>
      {/* ===== HERO con parallax suave + cristal ===== */}
      <section className="w-screen h-[56svh] md:h-[64svh] relative overflow-hidden left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-[-12px]">
        {/* Fondo con blur y animación leve */}
        <motion.img
          src={team}
          alt="Equipo de Blanco & Ramírez Abogados"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center scale-105 blur-[3px]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          initial={false}
          animate={
            useReducedMotion()
              ? {}
              : { scale: [1.05, 1.1, 1.05], y: [0, -8, 0] }
          }
          transition={
            useReducedMotion()
              ? {}
              : { duration: 18, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* Capa oscura sutil para contraste */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Contenido centrado */}
        <div className="absolute inset-0 grid place-items-center px-4 text-center">
          <header className="max-w-4xl mx-auto">
            <h1 className="font-display text-white text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.08em] leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]">
              {title}
            </h1>
            <p className="mt-4 text-white/90 text-lg md:text-xl leading-relaxed font-subtitle max-w-3xl mx-auto">
              En Blanco &amp; Ramírez Abogados creemos que el verdadero impacto
              nace del trabajo colaborativo y del conocimiento compartido.
              Nuestro equipo combina experiencia pública, privada y académica
              para ofrecer soluciones integrales, éticas y sostenibles que
              generan confianza y resultados duraderos.
            </p>
            <div className="mt-6 mx-auto h-[2px] w-24 bg-white/80" />
          </header>
        </div>
      </section>

      {/* ===== CONTROLES ===== */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mt-2 inline-flex relative rounded-xl border border-[hsl(var(--border))] p-1 bg-[hsl(var(--card))]">
          {[
            { id: "juridico", label: "Jurídico" },
            { id: "no-juridico", label: "No Jurídico" },
            { id: "todos", label: "Todos" },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "relative px-3 py-1.5 text-sm rounded-lg transition-colors z-10",
                  active
                    ? "text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--fg))/0.85] hover:text-[hsl(var(--fg))]"
                )}
                aria-pressed={active}
              >
                {active && (
                  <motion.span
                    layoutId="tabIndicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "hsl(var(--primary))" }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    aria-hidden
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filtros + Ajuste imagen */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="group">
            <label className="block text-xs mb-1 text-muted">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ana, Andrés…"
              className="input"
              aria-label="Filtrar por nombre"
            />
          </div>
          <Select
            label="CARGO"
            value={cargo}
            onChange={setCargo}
            options={cargosOpts}
          />
          <Select
            label="ÁREA"
            value={area}
            onChange={setArea}
            options={areasOpts}
          />
          <Select
            label="CIUDAD"
            value={ciudad}
            onChange={setCiudad}
            options={ciudadesOpts}
          />
          {/* Ajuste imagen */}
          <div className="flex flex-col">
            <label className="block text-xs mb-1 text-muted">
              Ajuste imagen
            </label>
            <div className="inline-flex rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              <button
                onClick={() => setImageFit("cover")}
                className={cx(
                  "px-3 py-2 text-xs transition-colors",
                  imageFit === "cover"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--fg))/0.85] hover:bg-[hsl(var(--muted))]"
                )}
                aria-pressed={imageFit === "cover"}
              >
                Llenar
              </button>
              <button
                onClick={() => setImageFit("contain")}
                className={cx(
                  "px-3 py-2 text-xs transition-colors",
                  imageFit === "contain"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--fg))/0.85] hover:bg-[hsl(var(--muted))]"
                )}
                aria-pressed={imageFit === "contain"}
              >
                Ajustar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chips de filtros activos + Limpiar */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[
            { k: "cargo", v: cargo, l: "Cargo" },
            { k: "area", v: area, l: "Área" },
            { k: "ciudad", v: ciudad, l: "Ciudad" },
            { k: "nombre", v: nombre, l: "Nombre" },
          ]
            .filter((x) => x.v)
            .map((x) => (
              <button
                key={x.k}
                onClick={() => {
                  if (x.k === "cargo") setCargo("");
                  if (x.k === "area") setArea("");
                  if (x.k === "ciudad") setCiudad("");
                  if (x.k === "nombre") setNombre("");
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--fg))] text-xs border border-[hsl(var(--border))]"
                aria-label={`Quitar filtro ${x.l}`}
              >
                <span className="font-medium">{x.l}:</span> {x.v}
                <span aria-hidden>✕</span>
              </button>
            ))}
          {(cargo || area || ciudad || nombre) && (
            <button
              onClick={() => {
                setCargo("");
                setArea("");
                setCiudad("");
                setNombre("");
              }}
              className="ml-1 text-xs underline text-[hsl(var(--fg))/0.9]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid de resultados */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          role="region"
          aria-live="polite"
          aria-label="Resultados del equipo"
        >
          <AnimatePresence>
            {items.map((p, i) => {
              const slug = p.slug ?? slugify(p.nombre);
              const key = p.id ?? slug ?? `row-${i}`;
              const imgSrc = resolveUrl(p.foto_url);
              return (
                <TeamCard
                  key={key}
                  imgSrc={imgSrc}
                  nombre={p.nombre}
                  cargo={p.cargo}
                  area={p.area}
                  ciudad={p.ciudad}
                  href={`${basePath}/${slug}`}
                  variants={cardVariants}
                  imageFit={imageFit}
                />
              );
            })}
          </AnimatePresence>

          {/* Skeletons iniciales */}
          {loading &&
            items.length === 0 &&
            Array.from({ length: pageSize }).map((_, k) => (
              <div
                key={`skeleton-${k}`}
                className="card card-pad overflow-hidden relative"
              >
                <div className="aspect-[4/3] w-full rounded-lg bg-[hsl(var(--muted))] relative overflow-hidden" />
                <div className="mt-4 h-4 w-2/3 bg-[hsl(var(--muted))] rounded" />
                <div className="mt-2 h-3 w-1/2 bg-[hsl(var(--muted))] rounded" />
                <div className="mt-2 h-3 w-1/3 bg-[hsl(var(--muted))] rounded" />
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            ))}
        </motion.div>

        {/* Vacío / error */}
        {!loading && items.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-sm text-muted"
          >
            {error
              ? `Error: ${error}`
              : "Sin resultados para los filtros actuales."}
          </motion.p>
        )}

        {/* Cargar más (auto + fallback botón) */}
        {items.length > 0 && (
          <div className="mt-6 flex flex-col items-center">
            {canLoad ? (
              <>
                <div ref={sentinelRef} className="h-6" aria-hidden />
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="btn btn-outline"
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span className="ml-2">Cargando…</span>
                    </>
                  ) : (
                    "Cargar más"
                  )}
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

/* ===================== Subcomponentes ===================== */
function TeamCard({
  imgSrc,
  nombre,
  cargo,
  area,
  ciudad,
  href,
  variants,
  imageFit,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prefersReduced = useReducedMotion();

  const srcSet = imgSrc ? `${imgSrc} 1x, ${imgSrc} 2x` : undefined;

  return (
    <motion.article
      variants={variants}
      whileHover="hover"
      whileTap={{ scale: prefersReduced ? 1 : 0.995 }}
      layout
      className={[
        "rounded-xl p-5 shadow-sm group transition-shadow",
        "border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        "hover:shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.35)]",
        "hover:border-[hsl(var(--primary)/0.55)]",
      ].join(" ")}
    >
      {/* Imagen */}
      <div
        className={cx(
          "relative aspect-[4/3] w-full rounded-lg overflow-hidden",
          imageFit === "contain"
            ? "bg-[hsl(var(--card))]"
            : "bg-[hsl(var(--primary)/0.06)]"
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
            srcSet={imgError ? undefined : srcSet}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
            transition={
              prefersReduced
                ? { duration: 0.2 }
                : { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }
            }
            className={cx(
              "absolute inset-0 h-full w-full object-center",
              imageFit === "cover" ? "object-cover" : "object-contain",
              imgLoaded ? "blur-0" : "blur-[6px]",
              imageFit === "cover" && imgLoaded
                ? "group-hover:scale-[1.012] transition-transform duration-300 will-change-transform"
                : ""
            )}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[hsl(var(--fg))/0.5] text-sm">
            Foto
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 ring-0 group-hover:ring-2 ring-[hsl(var(--primary))/0.35] transition-all rounded-lg" />
      </div>

      <motion.h3
        className="mt-4 text-lg font-semibold"
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {nombre}
      </motion.h3>
      <p className="text-sm text-[hsl(var(--fg))/0.85]">{cargo}</p>
      <p className="text-sm text-[hsl(var(--fg))/0.7]">
        {area} · {ciudad}
      </p>

      <div className="mt-4">
        <Link
          to={href}
          className={[
            "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium border transition-colors",
            "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-transparent",
            "hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/0.5]",
          ].join(" ")}
        >
          Ver Perfil
          <motion.svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
            initial={false}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.18 }}
          >
            <path
              d="M7 12h10M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        </Link>
      </div>
    </motion.article>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div className="group">
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl px-3 py-2 border outline-none bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] transition-shadow"
          aria-label={label}
        >
          <option value="">Todas</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: value ? 180 : 0 }}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        >
          ▾
        </motion.span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}
