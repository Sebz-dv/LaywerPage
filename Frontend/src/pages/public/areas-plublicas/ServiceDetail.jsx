// src/pages/public/areas-plublicas/ServiceDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { practiceAreasService as svc } from "../../../services/practiceAreasService.js";
import { motion } from "framer-motion";

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

// ================= Icons & UI =================
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
    outline: "border hover:bg-black/5 dark:hover:bg-white/5",
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
        setItem({
          title: a.title,
          summary: a.subtitle ?? a.excerpt ?? "",
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

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="rounded-2xl border p-8 text-center">Cargando…</div>
      </section>
    );
  }

  if (err || !item) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300">
            {err || "Servicio no encontrado."}
          </p>
          <Link className="mt-4 inline-block underline" to="/servicios">
            Volver a servicios
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
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
        {/* Capa base con altura fija */}
        <div className="relative h-[90dvh] md:h-[92dvh]">
          {/* Capa animada */}
          <motion.div
            className="absolute inset-0 will-change-transform z-0 overflow-hidden"
            animate={{ rotate: [0, 1.2, 0, -1.2, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Imagen de fondo ocupando TODO */}
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Personas trabajando en equipo"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="100vw"
              />
            ) : null}

            {/* Fallback degradado (invisible si carga la imagen) */}
            <div
              className="absolute inset-0 hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
              }}
            />

            {/* Barrido blanco opcional */}
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

            {/* Overlay para contraste de texto */}
            <div
              className="absolute inset-0 mix-blend-multiply z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(13,27,58,.85) 0%, rgba(190,125,35,.42) 100%)",
              }}
            />

            {/* Icono enorme si NO hay imagen */}
            {!coverUrl && iconUrl && (
              <div className="absolute inset-0 grid place-items-center opacity-25 z-0">
                <img
                  src={iconUrl}
                  alt=""
                  className="w-52 h-52 object-contain"
                />
              </div>
            )}
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
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
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
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
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
                <a
                  href="/agenda"
                  className="btn btn-outline rounded-xl text-base md:text-lg px-4 md:px-5 py-2 md:py-2.5 text-white border-white/70 hover:bg-white/10"
                >
                  Agendar llamada
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
        <article className="lg:col-span-2">
          {item.bullets?.length ? (
            <>
              <h2 className="text-5xl md:text-5xl font-semibold mb-6">
                ¿Qué incluye?
              </h2>
              <CheckList items={item.bullets} />
            </>
          ) : null}

          <ScopeTable
            items={
              item.scope ?? [
                {
                  label: "Revisión inicial",
                  value: "Diagnóstico legal y plan de acción.",
                },
                {
                  label: "Documentos",
                  value: "Contratos/formatos adaptados a tu caso.",
                },
                {
                  label: "Acompañamiento",
                  value: "Asesoría durante la ejecución.",
                },
                {
                  label: "Cierre",
                  value: "Checklist final y recomendaciones.",
                },
              ]
            }
          />

          <div className="mt-8 rounded-2xl border p-4">
            <p className="flex items-start gap-2 text-sm md:text-base">
              <Icon.info className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Precios y tiempos referenciales. Propuesta cerrada tras
                evaluación inicial (rápida y sin compromiso).
              </span>
            </p>
          </div>

          <FAQ
            items={
              item.faqs ?? [
                {
                  q: "¿Cuánto tarda?",
                  a: "Solemos entregar plan inicial en 2–5 días hábiles.",
                },
                {
                  q: "¿Trabajo remoto?",
                  a: "Sí, reuniones breves, firmas electrónicas y tableros compartidos.",
                },
                {
                  q: "¿Tarifa plana?",
                  a: "En corporativo, PI y migratorio manejamos paquetes cerrados.",
                },
              ]
            }
          />

          <GlobalCTA />
        </article>

        {/* Columna lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border p-5">
            <h3 className="text-sm md:text-base font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">
              Documentos frecuentes
            </h3>
            <ul className="mt-3 space-y-2 text-sm md:text-[15px]">
              {(
                item.docs ?? [
                  "Contrato/Acuerdo principal",
                  "Políticas / Anexos",
                  "Carta de instrucciones",
                ]
              ).map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon.check className="mt-0.5 h-4 w-4" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            {related?.length ? (
              <div className="mt-5 border-t pt-5">
                <h4 className="text-sm md:text-base font-semibold">
                  Servicios relacionados
                </h4>
                <ul className="mt-3 space-y-2 text-sm md:text-[15px]">
                  {related.map((r) => (
                    <li
                      key={r.slug}
                      className="flex items-center justify-between gap-2"
                    >
                      <Link
                        to={`/servicios/${r.slug}`}
                        className="underline underline-offset-4 hover:no-underline"
                      >
                        {r.title}
                      </Link>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {r.category}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
