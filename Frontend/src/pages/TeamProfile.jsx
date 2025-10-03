// pages/TeamProfile.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { teamService } from "../services/teamService";
import { teamProfileService } from "../services/teamProfileService"; // asegúrate de tenerlo

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

// Ajusta si tu backend no corre en 8000
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const resolveUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_ORIGIN}${u}`);
const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="%23f1f5f9"/><circle cx="80" cy="60" r="28" fill="%23e2e8f0"/><rect x="36" y="100" width="88" height="32" rx="16" fill="%23e2e8f0"/></svg>';

export default function TeamProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const [person, setPerson] = useState(null); // {nombre, cargo, area, ciudad, tipo, foto_url, ...}
  const [profile, setProfile] = useState(null); // {email, idiomas[], perfil, educacion[], experiencia[], reconocimientos[]}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const [{ data: p }, prof] = await Promise.all([
          teamService.getBySlug(slug),
          safeGetProfile(slug),
        ]);
        if (aborted) return;
        setPerson(p);
        setProfile(prof);
      } catch (e) {
        if (aborted) return;
        setErr(e?.response?.data?.message || e.message || "No se pudo cargar el perfil.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [slug]);

  const foto = useMemo(() => (person?.foto_url ? resolveUrl(person.foto_url) : null), [person]);

  if (loading) return <Skeleton />;

  if (err) {
    return (
      <div className="theme-law mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
        >
          <p className="text-red-600 font-medium">{err}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm border bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            Volver
          </button>
        </motion.div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="theme-law mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
        >
          <p>Perfil no encontrado.</p>
          <Link
            to="/equipo"
            className="mt-4 inline-block rounded-xl px-4 py-2 text-sm border bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          >
            Volver al equipo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="theme-law mx-auto max-w-6xl px-4 py-10">
      {/* Migas */}
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="text-sm text-[hsl(var(--fg))/0.7]"
      >
        <Link to="/" className="hover:underline underline-offset-4">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/equipo" className="hover:underline underline-offset-4">Nuestro Equipo</Link>
        <span className="mx-2">/</span>
        <span className="text-[hsl(var(--fg))]">{person.nombre}</span>
      </motion.nav>

      {/* HERO con foto grande a la izquierda */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReduced ? { duration: 0.2 } : { type: "spring", stiffness: 420, damping: 34 }}
        className="mt-6 relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))] p-6 md:p-8"
      >
        {/* background blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[hsl(var(--accent))]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[hsl(var(--ring))]/20 blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[minmax(220px,272px)_1fr] items-center">
          <ProfilePhoto src={foto} alt={person.nombre} />

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{person.nombre}</h1>
            <p className="mt-2 text-[hsl(var(--fg))/0.85]">
              {person.cargo}
              {person.area ? ` · ${person.area}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
              <Badge>{person.ciudad || "—"}</Badge>
              {person.tipo && <Badge variant="soft" className="capitalize">{person.tipo.replace("-", " ")}</Badge>}
              {Array.isArray(profile?.idiomas) && profile.idiomas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.idiomas.map((lang, i) => (
                    <Badge key={`${lang}-${i}`} variant="outline">{lang}</Badge>
                  ))}
                </div>
              )}

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="ml-auto inline-flex items-center gap-2 rounded-xl border bg-white/40 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-sm border-[hsl(var(--border))] hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                >
                  {profile.email}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* LAYOUT PRINCIPAL */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Perfil largo */}
        <SectionCard
          title="Perfil"
          animate
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.24 }}
            className="whitespace-pre-wrap leading-relaxed text-[hsl(var(--fg))/0.9]"
          >
            {profile?.perfil || "Este profesional aún no tiene un perfil detallado."}
          </motion.p>
        </SectionCard>

        {/* Aside sticky */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <SectionCard title="Información" animate>
            <ul className="mt-3 space-y-2 text-sm">
              <InfoRow label="Ciudad" value={person.ciudad || "—"} />
              <InfoRow label="Área" value={person.area || "—"} />
              <InfoRow label="Tipo" value={person.tipo?.replace("-", " ") || "—"} className="capitalize" />
            </ul>
            <Link
              to="/equipo"
              className="mt-4 inline-flex rounded-xl px-3 py-2 text-sm border bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Volver al listado
            </Link>
          </SectionCard>
        </aside>
      </div>

      {/* Columnas con listas / timelines */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <TimelineCard title="Educación" items={toItems(profile?.educacion)} />
        <TimelineCard title="Experiencia" items={toItems(profile?.experiencia)} />
        <TimelineCard title="Reconocimientos" items={toItems(profile?.reconocimientos)} />
      </div>
    </div>
  );
}

/** --------------------- UI PRIMITIVES --------------------- */
function Skeleton() {
  return (
    <div className="theme-law mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded animate-pulse" />
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(220px,272px)_1fr]">
        <div className="h-[272px] w-[272px] max-w-full bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-6 w-2/3 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-[hsl(var(--muted))] rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-40 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
        <div className="h-40 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

function SectionCard({ title, children, className, animate }) {
  const content = (
    <section className={cx(
      "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6",
      className
    )}>
      {title && <h2 className="font-semibold text-lg tracking-tight">{title}</h2>}
      <div className={cx(title && "mt-3")}>{children}</div>
    </section>
  );

  if (!animate) return content;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className={cx("rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6", className)}
    >
      {title && <h2 className="font-semibold text-lg tracking-tight">{title}</h2>}
      <div className={cx(title && "mt-3")}>{children}</div>
    </motion.section>
  );
}

function Badge({ children, variant = "solid", className }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
  const styles =
    variant === "outline"
      ? "border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      : variant === "soft"
      ? "bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
      : "bg-[hsl(var(--accent))/0.15] border border-[hsl(var(--accent))/0.3]";
  return <span className={cx(base, styles, className)}>{children}</span>;
}

function InfoRow({ label, value, className }) {
  return (
    <li className={cx("flex items-start justify-between gap-4", className)}>
      <span className="text-[hsl(var(--fg))/0.7]">{label}</span>
      <span className="font-medium text-[hsl(var(--fg))]">{value}</span>
    </li>
  );
}

function TimelineCard({ title, items = [] }) {
  return (
    <SectionCard title={title} animate>
      {items.length > 0 ? (
        <ul className="mt-2 relative">
          {/* línea vertical */}
          <div className="absolute left-4 top-1 bottom-1 w-px bg-[hsl(var(--border))]" />
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.li
                key={`${title}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.22 }}
                className="relative pl-10 pb-4 last:pb-0"
              >
                {/* punto */}
                <span className="absolute left-3 top-1.5 h-3 w-3 rounded-full bg-[hsl(var(--accent))] ring-2 ring-white dark:ring-[hsl(var(--card))]" />
                <p className="font-medium leading-snug">{item.title}</p>
                {item.subtitle && <p className="text-sm text-[hsl(var(--fg))/0.8]">{item.subtitle}</p>}
                {item.meta && <p className="text-xs text-[hsl(var(--fg))/0.6] mt-0.5">{item.meta}</p>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="text-sm text-[hsl(var(--fg))/0.7]">Sin registros.</p>
      )}
    </SectionCard>
  );
}

/** --------------------- Foto con animación y shimmer --------------------- */
function ProfilePhoto({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative h-[272px] w-[272px] max-w-full rounded-2xl overflow-hidden ring-2 ring-[hsl(var(--border))] bg-[hsl(var(--muted))] shadow-sm"
    >
      {/* Shimmer mientras carga */}
      {!loaded && (
        <>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.1s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-[2px] opacity-70" />
        </>
      )}

      <motion.img
        src={err ? FALLBACK_AVATAR : (src || FALLBACK_AVATAR)}
        alt={alt}
        decoding="async"
        loading="lazy"
        className={cx(
          "absolute inset-0 h-full w-full object-cover object-center",
          loaded ? "blur-0" : "blur-[8px]"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErr(true);
          setLoaded(true);
        }}
        initial={{ scale: 1.03, opacity: 0.0 }}
        animate={{ scale: 1.0, opacity: 1 }}
        transition={prefersReduced ? { duration: 0.2 } : { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      />

      {/* Halo sutil al hover */}
      <span className="pointer-events-none absolute inset-0 ring-0 hover:ring-2 ring-[hsl(var(--ring))/0.25] transition-all rounded-2xl" />
    </motion.div>
  );
}

/** --------------------- HELPERS --------------------- */
function toItems(list) {
  if (!Array.isArray(list)) return [];
  return list.map((x) =>
    typeof x === "string"
      ? { title: x }
      : {
          title: x.title ?? x.titulo ?? x.name ?? "—",
          subtitle: x.subtitle ?? x.subtitulo ?? x.role ?? x.detalle ?? undefined,
          meta: x.meta ?? x.periodo ?? x.dates ?? undefined,
        }
  );
}

async function safeGetProfile(slug) {
  try {
    const { data } = await teamProfileService.get(slug);
    return data || null;
  } catch {
    return null;
  }
}

/* ====== CSS util (pegar en tu global si no existe) ======
@keyframes shimmer { 100% { transform: translateX(100%); } }
*/
