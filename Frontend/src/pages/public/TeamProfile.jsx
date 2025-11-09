// pages/TeamProfile.jsx — versión mejorada ++ (foto derecha, header mini, progreso, vCard, share)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { teamService } from "../../services/teamService";
import { teamProfileService } from "../../services/teamProfileService";
import { resolveAssetUrl } from "../../lib/origin"; // ✅ Importar helper

/* ===================== Utils ===================== */
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ✅ Usar helper centralizado
const resolveUrl = (u) => resolveAssetUrl(u);

const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 160 200"><rect width="160" height="200" rx="16" fill="%23f1f5f9"/><circle cx="80" cy="70" r="30" fill="%23e2e8f0"/><rect x="28" y="120" width="104" height="52" rx="16" fill="%23e2e8f0"/></svg>';

/* ===================== Page ===================== */
export default function TeamProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const heroRef = useRef(null);
  const progressRef = useRef(null); 

  const [person, setPerson] = useState(null); // {nombre, cargo, area, ciudad, tipo, foto_url, ...}
  const [profile, setProfile] = useState(null); // {email, idiomas[], perfil, educacion[], experiencia[], reconocimientos[], linkedin, phone}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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
        setErr(
          e?.response?.data?.message ||
            e.message ||
            "No se pudo cargar el perfil."
        );
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [slug]);

  const foto = useMemo(
    () => (person?.foto_url ? resolveUrl(person.foto_url) : null),
    [person]
  );
  const displayName = person?.nombre || slug;

  /* ===== Scroll progress + mini header ===== */
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const sc = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight || 1;
      const pct = Math.min(100, Math.max(0, (sc / max) * 100));
      if (progressRef.current) progressRef.current.style.width = pct + "%";
      const heroHeight = heroRef.current?.offsetHeight ?? 280;
      setScrolled(sc > heroHeight * 0.55);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ===== Keyboard shortcuts ===== */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "b") navigate(-1);
      if (e.key === "p") window.print();
      if (e.key === "c" && profile?.email)
        window.location.href = `mailto:${profile.email}`;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, profile?.email]);

  /* ===== JSON-LD schema (Person) ===== */
  const jsonLd = useMemo(() => {
    if (!person) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: person.nombre,
      jobTitle: person.cargo,
      worksFor: person.area
        ? { "@type": "Organization", name: person.area }
        : undefined,
      homeLocation: person.ciudad,
      email: profile?.email ? `mailto:${profile.email}` : undefined,
      image: foto,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      knowsLanguage: Array.isArray(profile?.idiomas)
        ? profile.idiomas
        : undefined,
    };
  }, [person, profile, foto]);

  if (loading) return <Skeleton />;

  if (err) {
    return (
      <div className="theme-law mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-pad"
        >
          <p className="text-red-600 font-medium">{err}</p>
          <button onClick={() => navigate(-1)} className="btn btn-outline mt-4">
            Volver
          </button>
        </motion.div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="theme-law mx-auto max-w-6xl px-4 py:10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-pad"
        >
          <p>Perfil no encontrado.</p>
          <Link to="/equipo" className="btn btn-outline mt-4 inline-flex">
            Volver al equipo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Top progress */}
      <div className="fixed left-0 right-0 top-0 z-[60] bg-[hsl(var(--muted))]">
        <div
          ref={progressRef}
          className="h-full w-0 bg-[hsl(var(--accent))] transition-[width] duration-150"
        />
      </div>

      {/* Mini header sticky */}
      <div
        className={cx(
          "fixed left-3 right-3 top-16 z-[55] transition-all",
          scrolled
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-6xl rounded-xl border border-token bg-[hsl(var(--card)/0.9)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--card)/0.65)] px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={foto || FALLBACK_AVATAR}
              alt={displayName}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="truncate font-medium">{displayName}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {profile?.email && (
              <a
                className="btn btn-primary h-8 px-3"
                href={`mailto:${profile.email}`}
              >
                Contactar
              </a>
            )}
            <button
              className="btn btn-outline h-8 px-3"
              onClick={() => setShareOpen((s) => !s)}
            >
              Compartir
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14 mt-4">
        {/* Migas */}
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="text-sm text-muted"
        >
          <Link to="/" className="link">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link to="/equipo" className="link">
            Nuestro Equipo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(var(--fg))]">{person.nombre}</span>
        </motion.nav>

        {/* ======= HERO editorial split (texto izq, foto der) ======= */}
        <motion.header
          ref={heroRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReduced
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 420, damping: 34 }
          }
          className="relative mt-6 overflow-hidden rounded-3xl border border-token bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]"
        >
          {/* Edge glow + blobs brand */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-[hsl(var(--accent)/0.15)]" />
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[hsl(var(--secondary))]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[hsl(var(--accent))]/20 blur-3xl" />

          <div className="relative grid gap-0 md:grid-cols-2">
            {/* Lado texto */}
            <div className="p-6 md:p-10 lg:p-12 mt-32">
              <div className="inline-flex items-center gap-2 rounded-full border border-token bg-[hsl(var(--card))] px-3 py-1 text-xs text-muted">
                  Perfil profesional
              </div>

              <h1 className="mt-4 text-4xl/tight md:text-5xl font-semibold tracking-[0.15em] font-display">
                {person.nombre}
              </h1>

              <p className="mt-6 text-lg font-subtitle text-soft">
                {person.cargo}
                {person.area ? (
                  <span className="text-muted"> · {person.area}</span>
                ) : null}
              </p>

              {/* Chips / facts */}
              <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3 text-base md:text-lg">
                {[
                  person.ciudad || "—",
                  person.tipo ? person.tipo.replace("-", " ") : null,
                  ...(Array.isArray(profile?.idiomas) ? profile.idiomas : []),
                ]
                  .filter(Boolean)
                  .map((text, i) => (
                    <Badge
                      key={`chip-${i}`}
                      variant="outline"
                      className="text-lg md:text-base px-3 py-1"
                    >
                      {text}
                    </Badge>
                  ))}
              </div>

              {/* Acciones rápidas */}
              <div className="mt-6 flex flex-wrap gap-3">
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="btn btn-primary"
                  >
                    Contactar
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                  >
                    LinkedIn
                  </a>
                )}

                <button
                  className="btn btn-outline"
                  onClick={() => sharePage(`Perfil: ${displayName}`)}
                >
                  Compartir
                </button>
              </div>
            </div>

            {/* Lado foto — sticky en desktop */}
            <div className="relative">
              <ProfilePhoto src={foto} alt={person.nombre} />
            </div>
          </div>
        </motion.header>

        {/* ======= Cuerpo (todo debajo del hero) ======= */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Col principal izquierda */}
          <div className="lg:col-span-8">
            <SectionCard id="perfil" title="Perfil" animate>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.24 }}
                className="prose max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:tracking-tight"
              >
                <p className="whitespace-pre-wrap text-[hsl(var(--fg))/0.92]">
                  {profile?.perfil ||
                    "Este profesional aún no tiene un perfil detallado."}
                </p>
              </motion.div>
            </SectionCard>

            {/* Timelines en 2 columnas responsivas */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <TimelineCard
                title="Educación"
                items={toItems(profile?.educacion)}
              />
              <TimelineCard
                title="Experiencia"
                items={toItems(profile?.experiencia)}
              />
            </div>

            <div className="mt-6">
              <TimelineCard
                title="Reconocimientos"
                items={toItems(profile?.reconocimientos)}
              />
            </div>
          </div>

          {/* Aside derecha (sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 h-fit">
            <SectionCard title="Información" animate>
              <ul className="mt-3 space-y-2 text-sm">
                <InfoRow label="Ciudad" value={person.ciudad || "—"} />
                <InfoRow label="Área" value={person.area || "—"} />
                <InfoRow
                  label="Tipo"
                  value={person.tipo?.replace("-", " ") || "—"}
                  className="capitalize"
                />
              </ul>
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="btn btn-primary mt-4 w-full"
                >
                  Contactar
                </a>
              )}
            </SectionCard>

            {/* Tarjeta visual con tono de marca */}
            <div className="mt-6">
              <div className="card card-pad bg-gradient-to-br from-[hsl(var(--secondary))/0.12] to-[hsl(var(--accent))/0.10]">
                <h3 className="text-base font-semibold">Idiomas</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.isArray(profile?.idiomas) &&
                  profile.idiomas.length > 0 ? (
                    profile.idiomas.map((lang, i) => (
                      <Badge key={`lang-${i}`} variant="solid">
                        {lang}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted">No especificado</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* JSON-LD inline */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Share popover minimal */}
      {shareOpen && (
        <div
          className="fixed z-[70] inset-0 grid place-items-center bg-black/20 p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="card card-pad max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold">Compartir perfil</h3>
            <div className="mt-3 grid gap-2">
              <button
                className="btn btn-outline"
                onClick={() => sharePage(`Perfil: ${displayName}`)}
              >
                Nativo del navegador
              </button>
              <button className="btn btn-outline" onClick={() => copyUrl()}>
                Copiar enlace
              </button>
              {profile?.email && (
                <a
                  className="btn btn-primary"
                  href={`mailto:?subject=${encodeURIComponent(
                    "Interesante perfil: " + displayName
                  )}&body=${encodeURIComponent(window.location.href)}`}
                >
                  Enviar por correo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== UI ===================== */
function Skeleton() {
  return (
    <div className="theme-law mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded animate-pulse" />
      <div className="mt-6 grid gap-0 md:grid-cols-2 overflow-hidden rounded-3xl border border-token">
        <div className="p-8 space-y-3">
          <div className="h-10 w-3/4 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-5 w-1/2 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-5 w-2/5 bg-[hsl(var(--muted))] rounded animate-pulse" />
          <div className="h-10 w-2/5 bg-[hsl(var(--muted))] rounded animate-pulse" />
        </div>
        <div className="relative min-h-[360px] bg-[hsl(var(--muted))] animate-pulse" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-40 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
        <div className="h-40 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

function SectionCard({ id, title, children, className, animate }) {
  const base = "card card-pad";
  if (!animate) {
    return (
      <section id={id} className={cx(base, className)}>
        {title && (
          <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        )}
        <div className={cx(title && "mt-3")}>{children}</div>
      </section>
    );
  }
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className={cx(base, className)}
    >
      {title && (
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
      )}
      <div className={cx(title && "mt-3")}>{children}</div>
    </motion.section>
  );
}

function Badge({ children, variant = "soft", className }) {
  const base = "badge";
  const map = {
    soft: base,
    outline: cx(base, "bg-[hsl(var(--card))]"),
    solid: "badge-accent",
    primary: "badge-primary",
  };
  return (
    <span className={cx(map[variant] || base, className)}>{children}</span>
  );
}

function InfoRow({ label, value, className }) {
  return (
    <li className={cx("flex items-start justify-between gap-4", className)}>
      <span className="text-muted">{label}</span>
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
          <div className="absolute left-4 top-1 bottom-1 w-px border-token" />
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
                {item.subtitle && (
                  <p className="text-sm text-[hsl(var(--fg))/0.8]">
                    {item.subtitle}
                  </p>
                )}
                {item.meta && (
                  <p className="text-xs text-[hsl(var(--fg))/0.6] mt-0.5">
                    {item.meta}
                  </p>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="text-sm text-muted">Sin registros.</p>
      )}
    </SectionCard>
  );
}

/* ============= Foto a la derecha: ocupa toda la columna, relación elegante ============= */
function ProfilePhoto({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative h-full">
      <motion.figure
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-[4/5] md:aspect-[4/5] lg:aspect-[5/6] w-full overflow-hidden md:rounded-3xl border-l md:border-l-0 border-token bg-[hsl(var(--muted))]"
      >
        {/* Shimmer */}
        {!loaded && (
          <>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.1s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-[2px] opacity-70" />
          </>
        )}

        <motion.img
          src={err ? FALLBACK_AVATAR : src || FALLBACK_AVATAR}
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
          initial={{ scale: 1.04, opacity: 0.0 }}
          animate={{ scale: 1.0, opacity: 1 }}
          transition={
            prefersReduced
              ? { duration: 0.2 }
              : { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
          }
        />

        {/* Halo sutil al hover */}
        <span className="pointer-events-none absolute inset-0 ring-0 hover:ring-2 ring-[hsl(var(--ring))/0.25] transition-all md:rounded-3xl" />
      </motion.figure>
    </div>
  );
}

/* ===================== Helpers ===================== */
function toItems(list) {
  if (!Array.isArray(list)) return [];
  return list.map((x) =>
    typeof x === "string"
      ? { title: x }
      : {
          title: x.title ?? x.titulo ?? x.name ?? "—",
          subtitle:
            x.subtitle ?? x.subtitulo ?? x.role ?? x.detalle ?? undefined,
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

async function sharePage(title = "Perfil") {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = title;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // share cancelled or failed
    }
  } else {
    await copyToClipboard(url);
    alert("Enlace copiado al portapapeles");
  }
}

async function copyUrl() {
  const url = typeof window !== "undefined" ? window.location.href : "";
  await copyToClipboard(url);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}