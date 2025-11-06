// src/pages/public/areas-plublicas/ServiceDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { practiceAreasService as svc } from "../../../services/practiceAreasService.js";
import { motion } from "framer-motion";
import { servicios } from "../../../data/servicios.js";
import Loader from "../../../components/loader/Loader.jsx";

// ✅ NUEVO: soporte Markdown seguro
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const cx = (...xs) => xs.filter(Boolean).join(" ");

/* ========= Helper: normaliza URL absoluta para imágenes ========= */
function toAbsUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u; // ya es absoluta
  const base = (
    import.meta.env?.VITE_BACKEND_URL || window.location.origin
  ).replace(/\/+$/, "");
  if (u.startsWith("/")) return base + u;
  // típico: 'practice-areas/xx.jpg' subido al disk 'public' => /storage/...
  return `${base}/storage/${u}`;
}

/* ========= Bullets fallback (tu arreglo) ========= */
const DEFAULT_BULLETS = [
  "Procesos sancionatorios",
  "Responsabilidad del Estado",
  "Consultoría en actos administrativos",
];

/* ================= Icons & UI ================= */
const Icon = {
  check: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 10v6m0-9h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  tag: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M20 13l-7 7-9-9V4h7l9 9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  clock: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function Button({
  as: As = "button",
  variant = "primary",
  size = "sm",
  className,
  children,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]";
  const sizes = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2" }[size];
  const variants = {
    primary:
      "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:translate-y-[-1px] active:translate-y-0 shadow-sm",
    outline: "border hover:bg-black/5 dark:hover:bg白/5",
    ghost: "hover:bg-black/5 dark:hover:bg-white/5",
    link: "underline underline-offset-4 hover:no-underline px-0",
  }[variant];
  return (
    <As className={cx(base, sizes, variants, className)} {...rest}>
      {children}
    </As>
  );
}

function PriceBadge({ type, from }) {
  const label =
    type === "fijo" ? "Tarifa fija" : type === "hora" ? "Por hora" : "Mixto";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <span>{label}</span>
      {from && (
        <span className="text-zinc-500 dark:text-zinc-400">• {from}</span>
      )}
    </div>
  );
}

function FAQ({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mt-10">
      <h3 className="text-lg md:text-xl font-semibold">Preguntas frecuentes</h3>
      <div className="mt-4 divide-y overflow-hidden rounded-2xl border">
        {items.map((f, i) => (
          <details key={i} className="group p-4 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between font-medium">
              {f.q}
              <span className="ms-4 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs transition group-open:rotate-180">
                ^
              </span>
            </summary>
            <p className="mt-2 text-[15px] md:text-base text-zinc-600 dark:text-zinc-300">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

function CheckList({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon.check className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="text-[15px] md:text-base">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function ScopeTable({ title = "Alcance típico", items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h4 className="text-sm md:text-base font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">
        {title}
      </h4>
      <div className="mt-2 overflow-hidden rounded-2xl border">
        <table className="w-full text-[15px] md:text-base">
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="odd:bg-zinc-50/60 dark:odd:bg-zinc-900/40">
                <td className="p-3 md:p-3.5 font-medium">{row.label}</td>
                <td className="p-3 md:p-3.5 text-zinc-700 dark:text-zinc-300">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlobalCTA({ href = "/contacto" }) {
  return (
    <div className="mt-10 rounded-3xl border bg-gradient-to-br from-[hsl(var(--primary))/6] to-[hsl(var(--accent))/8] p-6 text-center mb-10">
      <h3 className="text-lg md:text-2xl font-semibold">
        ¿Listo para avanzar?
      </h3>
      <p className="mt-1 text-sm md:text-base text-zinc-600 dark:text-zinc-300">
        Propuesta clara y cerrada tras una evaluación rápida.
      </p>
      <Button as="a" href={href} variant="outline" size="md" className="mt-4">
        Agendar una consulta
      </Button>
    </div>
  );
}

// ============== PAGE (carga por slug con fallback por id) ==============
export default function ServiceDetail() {
  const params = useParams();
  const location = useLocation();

  const routeParam = params.slug ?? params.id ?? "";
  const searchParams = new URLSearchParams(location.search);
  const fallbackId = searchParams.get("id");

  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await svc.get(routeParam, { signal: ac.signal });
        const a = res?.data ?? res;

        // ✅ Nuevo: guardar body
        setItem({
          title: a.title,
          summary: a.subtitle ?? a.excerpt ?? "",
          body: a.body ?? "",
          bullets: Array.isArray(a.bullets) ? a.bullets : [],
          pricing_type: a.pricing_type ?? null,
          from_price: a.from_price ?? null,
          category: a.category ?? "General",
          eta: a.eta ?? null,
          scope: a.scope ?? null,
          faqs: a.faqs ?? null,
          docs: a.docs ?? null,
          cover: a.cover ?? a.image ?? null,
          icon: a.icon ?? a.icon_url ?? null,
          slug: a.slug ?? String(a.id ?? ""),
        });
      } catch (e) {
        const status = e?.response?.status;
        if (status === 404 && fallbackId && !ac.signal.aborted) {
          try {
            const res2 = await svc.get(fallbackId, { signal: ac.signal });
            const a = res2?.data ?? res2;
            setItem({
              title: a.title,
              summary: a.subtitle ?? a.excerpt ?? "",
              body: a.body ?? "",
              bullets: Array.isArray(a.bullets) ? a.bullets : [],
              pricing_type: a.pricing_type ?? null,
              from_price: a.from_price ?? null,
              category: a.category ?? "General",
              eta: a.eta ?? null,
              scope: a.scope ?? null,
              faqs: a.faqs ?? null,
              docs: a.docs ?? null,
              cover: a.cover ?? a.image ?? null,
              icon: a.icon ?? a.icon_url ?? null,
              slug: a.slug ?? String(a.id ?? ""),
            });
          } catch (e2) {
            if (!ac.signal.aborted)
              setErr(
                e2?.response?.data?.message ||
                  e2?.message ||
                  "No se pudo cargar el servicio."
              );
          }
        } else if (!ac.signal.aborted) {
          setErr(
            status === 404
              ? "Este servicio ya no está disponible."
              : e?.response?.data?.message ||
                  e?.message ||
                  "No se pudo cargar el servicio."
          );
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }

      if (!ac.signal.aborted) {
        try {
          const rel = await svc.list(
            { featured: 0, active: 1, per_page: 6 },
            { signal: ac.signal }
          );
          const arr = (rel?.data ?? rel ?? [])
            .filter((r) => (r.slug ?? String(r.id ?? "")) !== routeParam)
            .slice(0, 5);
          setRelated(
            arr.map((r) => ({
              slug: r.slug ?? String(r.id ?? ""),
              title: r.title,
              category: r.category ?? "General",
            }))
          );
        } catch {
          // no pasa nada si falla esto
        }
      }
    })();
    return () => ac.abort();
  }, [routeParam, fallbackId]);

  const coverUrl = useMemo(
    () => toAbsUrl(item?.cover) || toAbsUrl(item?.image) || null,
    [item]
  );
  const iconUrl = useMemo(() => toAbsUrl(item?.icon), [item]);

  // Si error, mostramos error normal
  if (err) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
            {err}
          </p>
          <Link className="mt-4 inline-block underline" to="/servicios">
            Volver a servicios
          </Link>
        </div>
      </section>
    );
  }

  // ===== Overlay: NO quitamos el body; solo lo cubrimos con blur y spinner =====
  // Se monta siempre que loading sea true, vía portal a <body>
  // (El contenido debajo puede ser un shell si aún no hay "item")
  const bulletsList =
    (item?.bullets && item.bullets.length > 0) ? item.bullets : DEFAULT_BULLETS;

  // Si aún no hay item (primera carga), renderizamos un "shell" mínimo
  if (!item) {
    return (
      <>
        {loading && (
          <Loader overlay blur={14} size={48} showLabel label="Cargando servicio…" />
        )}
        <section className="mx-auto w-full max-w-7xl px-4 md:px-6" aria-busy="true">
          {/* Shell ligero para mantener estructura mientras llega la data */}
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-3 z-10">
            <div className="h-[60dvh]" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <article className="lg:col-span-2 space-y-8">
              <section>
                <div className="card card-pad">
                  <div className="h-6 w-1/2 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
                  <div className="mt-3 h-4 w-4/5 rounded bg-zinc-200/50 dark:bg-zinc-800/50" />
                </div>
              </section>
              <section className="card card-pad">
                <div className="h-6 w-1/3 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
                <ul className="mt-4 space-y-2">
                  {bulletsList.map((_, i) => (
                    <li key={i} className="h-4 w-3/4 rounded bg-zinc-200/50 dark:bg-zinc-800/50" />
                  ))}
                </ul>
              </section>
            </article>
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-token bg-card p-5 min-h-[200px]" />
            </aside>
          </div>
        </section>
      </>
    );
  }

  // ===== Contenido normal cuando ya hay item =====
  return (
    <>
      {loading && (
        <Loader overlay blur={14} size={48} showLabel label="Cargando servicio…" />
      )}

      <section className="mx-auto w-full max-w-7xl px-4 md:px-6" aria-busy={loading ? "true" : "false"}>
        {/* Breadcrumb */}
        <nav className="mt-2 text-xs md:text-sm text-zinc-600 dark:text-zinc-300">
          <Link to="/" className="hover:underline">
            Inicio
          </Link>
          <span className="mx-1">/</span>
          <Link to="/servicios" className="hover:underline">
            Servicios
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>

        {/* HERO FULL-BLEED estilo About */}
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-3 z-10">
          <div className="relative h-[60dvh]">
            <motion.div
              className="absolute inset-0 will-change-transform z-0 overflow-hidden"
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            >
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt="Portada del servicio"
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="100vw"
                />
              ) : null}

              <div
                className="absolute inset-0 hidden"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
                }}
              />
              <motion.span
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3 z-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.38) 45%, rgba(255,255,255,.52) 50%, rgba(255,255,255,.32) 55%, transparent 100%)",
                  filter: "blur(10px)",
                  mixBlendMode: "soft-light",
                }}
                animate={{ x: ["0%", "200%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="absolute inset-0 mix-blend-multiply z-10 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(190,125,35,.42) 100%)",
                }}
              />
            </motion.div>

            {/* Contenido encima */}
            <div className="absolute inset-0 z-20 grid place-items-end md:place-items-center">
              <div className="w-full max-w-5xl px-5 md:px-8 pb-8 md:pb-0 mx-auto">
                <h1
                  className={cx(
                    "text-white font-semibold leading-[1.05] text-balance drop-shadow-[0_10px_28px_rgba(0,0,0,.45)]",
                    "text-4xl sm:text-5xl md:text-6xl"
                  )}
                  style={{
                    letterSpacing: "0.02em",
                    fontKerning: "normal",
                    fontOpticalSizing: "auto",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  {item.title}
                </h1>

                {item.summary && (
                  <p className="mt-4 md:mt-5 max-w-3xl text-white/95 leading-relaxed text-lg md:text-xl">
                    {item.summary}
                  </p>
                )}

                {/* Chips */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {item.pricing_type && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-3 py-1 text-xs text-white">
                      <span>
                        {item.pricing_type === "fijo"
                          ? "Tarifa fija"
                          : item.pricing_type === "hora"
                          ? "Por hora"
                          : "Mixto"}
                      </span>
                      {item.from_price && (
                        <span className="text-white/80">• {item.from_price}</span>
                      )}
                    </div>
                  )}
                  {item.category && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-2.5 py-1 text-xs text-white">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path
                          d="M20 13l-7 7-9-9V4h7l9 9z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
                      </svg>
                      {item.category}
                    </span>
                  )}
                  {item.eta && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-2.5 py-1 text-xs text-white">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item.eta}
                    </span>
                  )}
                </div>

                {/* CTA sobre imagen */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href="/contacto?topic=cotizacion"
                    className="btn btn-accent rounded-xl text-base md:text-lg px-4 md:px-5 py-2 md:py-2.5"
                  >
                    Solicitar cotización
                  </a>
                </div>
              </div>
            </div>

            {/* Banda superior FULL-WIDTH */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
          </div>
        </section>

        {/* ===================== Contenido ===================== */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <article className="lg:col-span-2 space-y-8">
            {/* ✅ BODY EN MARKDOWN */}
            {item.body ? (
              <section>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4 font-display tracking-tight">
                  Sobre el servicio
                </h2>
                <div className="card card-pad [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1.5">
                  <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                    {item.body}
                  </ReactMarkdown>
                </div>
              </section>
            ) : null}

            {(bulletsList?.length) ? (
              <section>
                <h2 className="text-4xl md:text-5xl font-semibold mb-5 font-display tracking-tight">
                  ¿Qué incluye?
                </h2>
                <div className="card card-pad">
                  <CheckList items={bulletsList} />
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 font-display">
                Alcance del servicio
              </h3>
              <div className="card card-pad">
                <ScopeTable
                  items={
                    item.scope ?? [
                      { label: "Revisión inicial", value: "Diagnóstico legal y plan de acción." },
                      { label: "Documentos", value: "Contratos/formatos adaptados a tu caso." },
                      { label: "Acompañamiento", value: "Asesoría durante la ejecución." },
                      { label: "Cierre", value: "Checklist final y recomendaciones." },
                    ]
                  }
                />
              </div>

              {/* Nota informativa */}
              <div className="mt-4 rounded-xl border border-token bg-muted/50 p-4">
                <p className="flex items-start gap-2 text-sm md:text-base text-soft">
                  <Icon.info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>
                    Precios y tiempos referenciales. Propuesta cerrada tras
                    evaluación inicial (rápida y sin compromiso).
                  </span>
                </p>
              </div>
            </section>

            <section> 
              <div className="card card-pad">
                <FAQ
                  items={
                    item.faqs ?? [
                      { q: "¿Cuánto tarda?", a: "Solemos entregar plan inicial en 2-5 días hábiles." },
                      { q: "¿Trabajo remoto?", a: "Sí, reuniones breves, firmas electrónicas y tableros compartidos." },
                      { q: "¿Tarifa plana?", a: "En corporativo, PI y migratorio manejamos paquetes cerrados." },
                    ]
                  }
                />
              </div>
            </section>

            <GlobalCTA />
          </article>

          {/* Columna lateral */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-token bg-card p-5">
              {/* Docs */}
              <h3 className="text-sm md:text-base font-semibold tracking-wide text-muted font-subtitle">
                Documentos frecuentes
              </h3>
              <ul className="mt-3 space-y-2 text-sm md:text-[15px]">
                {(item.docs ?? [
                  "Contrato/Acuerdo principal",
                  "Políticas / Anexos",
                  "Carta de instrucciones",
                ]).map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon.check className="mt-0.5 h-4 w-4 text-accent" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              {/* Servicios relacionados */}
              {servicios?.length ? (
                <div className="mt-5 border-t border-token pt-5">
                  <h4 className="text-sm md:text-base font-semibold font-subtitle">
                    Servicios relacionados
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm md:text-[15px]">
                    {servicios.map((s) => (
                      <li key={s.to} className="flex items-center justify-between gap-2">
                        <Link
                          to={s.to}
                          className="link underline underline-offset-4 hover:no-underline"
                          aria-label={`Ver servicio ${s.title}`}
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
