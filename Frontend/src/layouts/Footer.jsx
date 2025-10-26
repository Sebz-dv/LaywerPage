// src/components/layout/Footer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { settingsService } from "../services/settingsService.js";
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaGithub,
  FaGlobe,
} from "react-icons/fa6";
import { motion, useReducedMotion } from "framer-motion";

/* ========= Iconos por plataforma ========= */
const ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  twitter: FaXTwitter,
  x: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  github: FaGithub,
  default: FaGlobe,
};

const PAGES_FROM_ROUTES = [
  { title: "Equipo", href: "/equipo" },
  { title: "Áreas de práctica", href: "/servicios" },
  { title: "Publicaciones", href: "/publicaciones" },
];

/* ========= Aliases ========= */
const PLATFORM_ALIASES = {
  ig: "instagram",
  insta: "instagram",
  fb: "facebook",
  tw: "twitter",
  x: "twitter",
  in: "linkedin",
  yt: "youtube",
  youTube: "youtube",
  tt: "tiktok",
  wa: "whatsapp",
  gh: "github",
  gitHub: "github",
  instagram: "instagram",
  facebook: "facebook",
  twitter: "twitter",
  linkedin: "linkedin",
  tiktok: "tiktok",
  whatsapp: "whatsapp",
  github: "github",
  youtube: "youtube",
};

/* ========= Helpers ========= */
function safeUrl(u = "") {
  const trimmed = String(u).trim();
  if (!trimmed) return "#";
  if (/^(https?:|mailto:|tel:|geo:|sms:|whatsapp:)/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}
function detectPlatformFromHost(url = "") {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("instagram")) return "instagram";
    if (host.includes("facebook")) return "facebook";
    if (host.includes("linkedin")) return "linkedin";
    if (host.includes("youtube")) return "youtube";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("twitter") || host.includes("x.com")) return "twitter";
    if (host.includes("whatsapp")) return "whatsapp";
    if (host.includes("github")) return "github";
  } catch { /* noop */ }
  return "";
}
function normalizePlatform(rawPlatform = "", url = "") {
  const s = String(rawPlatform || "").trim().toLowerCase();
  if (s && PLATFORM_ALIASES[s]) return PLATFORM_ALIASES[s];
  if (s && ICONS[s]) return s;
  const byHost = detectPlatformFromHost(url);
  if (byHost) return byHost;
  return "";
}
function buildUrl(platform, handleRaw) {
  const handle = String(handleRaw || "").replace(/^@/, "");
  if (!platform || !handle) return "";
  switch (platform) {
    case "instagram": return `https://instagram.com/${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "twitter":   return `https://x.com/${handle}`;
    case "linkedin":  return `https://www.linkedin.com/company/${handle}`; // /in/ para perfil
    case "tiktok":    return `https://www.tiktok.com/@${handle}`;
    case "whatsapp":  return /^\+?\d{7,15}$/.test(handle) ? `https://wa.me/${handle.replace(/\D/g, "")}` : "";
    case "github":    return `https://github.com/${handle}`;
    case "youtube":   return `https://www.youtube.com/@${handle}`;
    default: return "";
  }
}
function parseSocialEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string") {
    const text = entry.trim();
    const urlMatch = text.match(/https?:\/\/[^\s)]+/i);
    const url = urlMatch ? urlMatch[0] : "";
    const handleMatch = text.match(/@([A-Za-z0-9._-]+)/);
    const handle = handleMatch ? handleMatch[0] : "";
    const platMatch = text.match(/\b(instagram|ig|facebook|fb|linkedin|in|youtube|yt|tiktok|tt|twitter|x|whatsapp|wa|github|gh)\b/i);
    const rawPlatform = platMatch ? platMatch[0] : "";
    const platform = normalizePlatform(rawPlatform, url);
    const finalUrl = url || buildUrl(platform, handle);
    return { platform, url: finalUrl || "", handle: handle || "", _raw: text };
  }
  if (typeof entry === "object") {
    const platform = normalizePlatform(entry.platform, entry.url);
    const handle = entry.handle ? String(entry.handle).trim() : "";
    const url = entry.url ? String(entry.url).trim() : buildUrl(platform, handle);
    return { platform, url, handle, _raw: entry };
  }
  return null;
}
function dedupeSocials(list) {
  const seen = new Set();
  return list.filter((x) => {
    const key = `${x.platform || "na"}|${(x.handle || x.url || "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function getMapEmbedUrl(s) {
  const direct = s?.map_iframe_url || s?.map_embed_url;
  if (direct) return direct;
  const q = s?.map_query || s?.address || "";
  if (!q) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

/* ========= Variants (Framer Motion) ========= */
const useVariants = () => {
  const prefersReduced = useReducedMotion();
  const fast = prefersReduced ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 32, mass: 0.7 };

  return {
    containerStagger: {
      hidden: {},
      show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: fast },
    },
    hoverLift: prefersReduced ? {} : {
      whileHover: { y: -3 },
      whileTap: { scale: 0.98 },
    },
    iconHover: prefersReduced ? {} : {
      whileHover: { scale: 1.08, rotate: 2 },
      whileTap: { scale: 0.95 },
      transition: { type: "spring", stiffness: 600, damping: 24 },
    },
  };
};

/* ========= Subcomponentes ========= */
function SocialIconButton({ item }) {
  const Icon = ICONS[item.platform] ?? ICONS.default;
  const { iconHover } = useVariants();
  return (
    <motion.a
      href={item.url ? safeUrl(item.url) : "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm transition"
      aria-label={item.platform || "Social"}
      title={item.handle ? `${item.platform} · ${item.handle}` : item.platform}
      {...iconHover}
    >
      <Icon className="text-[18px]" />
    </motion.a>
  );
}

function Phones({ phones }) {
  const raw = Array.isArray(phones) ? phones : String(phones || "").split(/[,;]+/);
  const items = raw.map((p) => p.trim()).filter(Boolean).map((p) => ({
    label: p, href: `tel:${p.replace(/[^\d+]/g, "")}`,
  }));
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {items.map((it, i) => (
        <li key={i}>
          <a
            href={it.href}
            className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15 transition"
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Emails({ emails }) {
  const raw = Array.isArray(emails) ? emails : String(emails || "").split(/[,;]+/);
  const items = raw.map((e) => e.trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {items.map((mail, i) => (
        <li key={i}>
          <a
            className="underline underline-offset-2 hover:text-[hsl(var(--accent))]"
            href={`mailto:${mail}`}
          >
            {mail}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Páginas del sitio */
function PagesList({ s, pages }) {
  const list = useMemo(() => {
    if (pages?.length) return pages;
    const fromSettings = s?.footer_pages ?? s?.menu_footer ?? [];
    return (fromSettings || []).map((it) =>
      typeof it === "string" ? { title: it, href: "#" } : it
    );
  }, [pages, s]);

  if ((!list || !list.length) && !(s?.footer_blocks || []).length) return null;

  if (list?.length) {
    return (
      <nav aria-label="Páginas">
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {list.slice(0, 12).map((p, i) => (
            <li key={i}>
              <a className="text-white/80 hover:text-[hsl(var(--accent))]" href={p.href || "#"}>
                {p.title || "Página"}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // fallback html block
  return (
    <div className="mt-3 grid grid-cols-1 gap-3">
      {(s?.footer_blocks || []).slice(0, 1).map((b, i) => (
        <div
          key={i}
          className="prose prose-sm max-w-none text-white/80
                     [&_a]:text-white/80 [&_a:hover]:text-[hsl(var(--accent))] [&_a]:no-underline
                     [&_ul]:m-0 [&_li]:m-0 [&_li]:py-1"
          dangerouslySetInnerHTML={{ __html: b?.html || "" }}
        />
      ))}
    </div>
  );
}

/** Direcciones */
function Addresses({ s }) {
  const list = Array.isArray(s?.addresses)
    ? s.addresses
    : s?.address
    ? [{ label: s.site_name || "Sede", address: s.address, map_link: s.map_link }]
    : [];

  if (!list.length) return null;

  const hasMap = s?.map_iframe_url || s?.map_embed_url || s?.map_query || s?.address;

  return (
    <div className="space-y-4">
      <ul className="space-y-3 text-[13px] leading-6 text-white/80">
        {list.slice(0, 4).map((a, i) => (
          <li key={i}>
            {a.label ? <div className="text-sm font-semibold text-white">{a.label}</div> : null}
            <div>{a.address}</div>
            {(a.map_link || hasMap) && (
              <a
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15 transition"
                target="_blank"
                rel="noopener noreferrer"
                href={
                  a.map_link ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`
                }
              >
                Ver en Google Maps
              </a>
            )}
          </li>
        ))}
      </ul>

      {/* Mapa pequeño opcional debajo (w-60 h-60) */}
      {hasMap ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="w-60 h-60 mx-auto overflow-hidden rounded-lg">
            <iframe
              src={getMapEmbedUrl(s)}
              title="Mapa"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-60 h-60"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ========= Footer principal ========= */
export default function Footer() {
  const [s, setS] = useState(null);
  const [error, setError] = useState(null);
  const { containerStagger, fadeInUp, hoverLift } = useVariants();

  useEffect(() => {
    let mounted = true;
    settingsService
      .get()
      .then((data) => mounted && setS(data || {}))
      .catch((e) => {
        console.error("[Footer] settings error:", e);
        setError(e);
        setS({});
      });
    return () => { mounted = false; };
  }, []);

  const socials = useMemo(() => {
    const parsed = (s?.social_links ?? []).map(parseSocialEntry).filter(Boolean);
    const filtered = parsed.filter((x) => x.platform || x.url || x.handle);
    return dedupeSocials(filtered).slice(0, 10);
  }, [s]);

  const year = useMemo(() => new Date().getFullYear(), []);
  if (!s) return null;

  const fixed = Boolean(s?.footer_fixed ?? false);
  const footerHeight = s?.footer_height || 260;

  const content = (
    <footer
      role="contentinfo"
      className={[
        "z-[40] text-[hsl(var(--primary-foreground))]",
        "relative",
        // Fondo con gradiente + brillo sutil superior
        "bg-gradient-to-br from-[#1b1b1b] via-[#171717] to-[#121212]",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
        fixed ? "fixed inset-x-0 bottom-0" : "mt-16",
      ].join(" ")}
      style={fixed ? { "--footer-h": `${footerHeight}px` } : undefined}
    >
      {/* Cinta decorativa superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[68px] bg-white/[0.03]"
      />

      <motion.div
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-5"
        variants={containerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Social arriba con stagger */}
        {socials?.length ? (
          <motion.div
            className="flex items-center justify-end gap-2 md:gap-3 pb-4"
            variants={containerStagger}
          >
            {socials.map((r, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <SocialIconButton item={r} />
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Zona principal 3 columnas */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/10 py-8"
          variants={containerStagger}
        >
          {/* Col 1: Logo + Páginas */}
          <motion.div variants={fadeInUp} {...hoverLift}>
            <div className="mb-4">
              {s?.logo_url ? (
                <img
                  src={s.logo_url}
                  alt={s.site_name ? `${s.site_name} logo` : "Logo"}
                  className="h-10 md:h-12 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="font-display text-xl">
                  {s?.site_name || "Tu Sitio"}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Páginas</h4>
            <PagesList s={s} pages={PAGES_FROM_ROUTES} />
          </motion.div>

          {/* Col 2: Contacto */}
          <motion.div variants={fadeInUp} {...hoverLift}>
            <h4 className="text-sm font-semibold text-white mb-3">Contacto</h4>
            {s?.phone ? (
              <>
                <h5 className="text-sm font-medium text-white/90 mb-2">Teléfono</h5>
                <Phones phones={s.phone} />
              </>
            ) : null}
            {s?.email ? (
              <>
                <h5 className="text-sm font-medium text-white/90 mt-4 mb-2">Email</h5>
                <Emails emails={s.email} />
              </>
            ) : null}
            {!s?.phone && !s?.email ? (
              <p className="text-sm text-white/60">Agrega teléfono o correo en settings.</p>
            ) : null}
          </motion.div>

          {/* Col 3: Direcciones + mapa */}
          <motion.div variants={fadeInUp} {...hoverLift}>
            <h4 className="text-sm font-semibold text-white mb-3">Direcciones</h4>
            <Addresses s={s} />
          </motion.div>
        </motion.div>

        {/* Barra legal inferior */}
        <motion.div
          className="border-t border-white/10 pb-5 pt-4"
          variants={fadeInUp}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/70">
              © {year} {s?.site_name || "Tu Sitio"}. Todos los derechos reservados.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {s?.privacy_url ? (
                <a className="hover:text-[hsl(var(--accent))]" href={safeUrl(s.privacy_url)}>
                  Privacidad
                </a>
              ) : null}
              {s?.terms_url ? (
                <a className="hover:text-[hsl(var(--accent))]" href={safeUrl(s.terms_url)}>
                  Términos
                </a>
              ) : null}
              {s?.cookies_url ? (
                <a className="hover:text-[hsl(var(--accent))]" href={safeUrl(s.cookies_url)}>
                  Cookies
                </a>
              ) : null}
              <motion.button
                type="button"
                onClick={() => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-1 hover:text-[hsl(var(--accent))]"
                aria-label="Volver arriba"
                title="Volver arriba"
                whileHover={{ x: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                ↑ Arriba
              </motion.button>
            </nav>
          </div>
          {error ? (
            <p className="mt-2 text-[11px] text-red-300/80">
              No se pudieron cargar algunos datos del footer.
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </footer>
  );

  if (!fixed) return content;
  return (
    <>
      <div aria-hidden style={{ height: footerHeight }} />
      {content}
    </>
  );
}
