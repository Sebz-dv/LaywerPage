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
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ========= Colores de marca ========= */
const BRAND_BLUE = "#0C2E63";

/* ========= Aliados a mostrar en el footer ========= */
const FOOTER_ALLIES = [
  {
    name: "Verú Torres",
    href: "https://www.verutorrespartners.com/",
  },
  // agrega más aliados aquí
];

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

// Colores de marca por plataforma (para iconos)
const BRAND_COLORS = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  x: "#1DA1F2",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  tiktok: "#010101",
  whatsapp: "#25D366",
  github: "#181717",
  default: "#9AA0A6",
};

function hexToRgba(hex, alpha = 0.15) {
  const m = String(hex || "").trim().replace(/^#/, "");
  const h = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const PAGES_FROM_ROUTES = [
  { title: "Inicio", href: "/" },
  { title: "Equipo", href: "/equipo" },
  { title: "Sobre Nosotros", href: "/about-us" },
  { title: "Áreas de práctica", href: "/servicios" },
  { title: "Publicaciones", href: "/publicaciones" },
  { title: "Blog", href: "/public/simple-posts" },
  { title: "Contáctanos", href: "/contacto" },
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
  } catch {
    /* noop */
  }
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
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/company/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "whatsapp":
      return /^\+?\d{7,15}$/.test(handle) ? `https://wa.me/${handle.replace(/\D/g, "")}` : "";
    case "github":
      return `https://github.com/${handle}`;
    case "youtube":
      return `https://www.youtube.com/@${handle}`;
    default:
      return "";
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
    const platMatch = text.match(
      /\b(instagram|ig|facebook|fb|linkedin|in|youtube|yt|tiktok|tt|twitter|x|whatsapp|wa|github|gh)\b/i
    );
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

/* ========= Tema (oscuro/claro) ========= */
function useIsDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (root.classList.contains("dark")) return true;
      if (window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    const update = () => {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setIsDark(root.classList.contains("dark") || prefersDark);
    };

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", update);

    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });

    update();
    return () => {
      mq?.removeEventListener?.("change", update);
      obs.disconnect();
    };
  }, []);

  return isDark;
}

/* ========= Variants (Framer Motion) ========= */
const useVariants = () => {
  const prefersReduced = useReducedMotion();
  const fast = prefersReduced
    ? { duration: 0.2 }
    : { type: "spring", stiffness: 500, damping: 32, mass: 0.7 };

  return {
    containerStagger: {
      hidden: {},
      show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: fast },
    },
    hoverLift: prefersReduced
      ? {}
      : {
          whileHover: { y: -3 },
          whileTap: { scale: 0.98 },
        },
    iconHover: prefersReduced
      ? {}
      : {
          whileHover: { scale: 1.08, rotate: 2 },
          whileTap: { scale: 0.95 },
          transition: { type: "spring", stiffness: 600, damping: 24 },
        },
  };
};

/* ========= Cache in-memory para settings =========
   - evita fetch en cada navegación / remount
   - TTL para refrescar cada cierto tiempo
*/
let __settingsMemo = null;
let __settingsMemoAt = 0;
let __settingsInflight = null;
const SETTINGS_TTL_MS = 60_000; // 1 minuto (ajústalo)

async function getSettingsCached() {
  const now = Date.now();
  if (__settingsMemo && now - __settingsMemoAt < SETTINGS_TTL_MS) return __settingsMemo;
  if (__settingsInflight) return __settingsInflight;

  __settingsInflight = Promise.resolve()
    .then(() => settingsService.get())
    .then((data) => {
      __settingsMemo = data || {};
      __settingsMemoAt = Date.now();
      return __settingsMemo;
    })
    .catch((e) => {
      // no rompas: devuelve algo y deja que el footer pinte
      console.error("[Footer] settings error:", e);
      // No sobreescribimos memo “bueno” si ya existía
      return __settingsMemo || {};
    })
    .finally(() => {
      __settingsInflight = null;
    });

  return __settingsInflight;
}

/* ========= Subcomponentes ========= */
function SocialIconButton({ item, isDark, iconHover }) {
  const Icon = ICONS[item.platform] ?? ICONS.default;
  const color = BRAND_COLORS[item.platform] || BRAND_COLORS.default;
  const borderColor = hexToRgba(color, 0.35);
  const bg = hexToRgba(color, isDark ? 0.10 : 0.08);
  const bgHover = hexToRgba(color, isDark ? 0.16 : 0.14);

  return (
    <motion.a
      href={item.url ? safeUrl(item.url) : "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition
                  ${isDark ? "text-white" : "text-zinc-900"}`}
      aria-label={item.platform || "Social"}
      title={item.handle ? `${item.platform} · ${item.handle}` : item.platform}
      style={{ color, border: `1px solid ${borderColor}`, backgroundColor: bg }}
      whileHover={{ y: -3, backgroundColor: bgHover }}
      whileTap={{ scale: 0.98 }}
      {...iconHover}
    >
      <Icon className="text-[18px]" />
    </motion.a>
  );
}

function Phones({ phones, isDark }) {
  const raw = Array.isArray(phones) ? phones : String(phones || "").split(/\s*[;,]\s*|\s+[–-]\s+/);

  const items = raw
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const href = `tel:${p.replace(/[^\d+]/g, "")}`;
      return { label: p, href };
    });

  if (!items.length) return null;

  return (
    <ul className={`space-y-2 text-sm ${isDark ? "text-white/80" : "text-zinc-700"}`}>
      {items.map((it, i) => (
        <li key={i} className="leading-6">
          <a
            href={it.href}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition
              ${
                isDark
                  ? "border border-white/15 bg-white/10 hover:bg-white/15 text-white"
                  : "border border-zinc-300/80 bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              }`}
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Emails({ emails, isDark }) {
  const raw = Array.isArray(emails) ? emails : String(emails || "").split(/[,;]+/);
  const items = raw
    .map((e) => String(e).trim())
    .filter(Boolean)
    .map((mail) => ({ label: mail, href: `mailto:${mail}` }));

  if (!items.length) return null;

  return (
    <ul className={`space-y-2 text-sm ${isDark ? "text-white/80" : "text-zinc-700"}`}>
      {items.map((it, i) => (
        <li key={i} className="leading-6">
          <a
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs transition
              ${
                isDark
                  ? "border border-white/15 bg-white/10 hover:bg-white/15 text-white"
                  : "border border-zinc-300/80 bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
              }`}
            href={it.href}
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Páginas del sitio */
function PagesList({ s, pages, isDark }) {
  const list = useMemo(() => {
    if (pages?.length) return pages;
    const fromSettings = s?.footer_pages ?? s?.menu_footer ?? [];
    return (fromSettings || []).map((it) => (typeof it === "string" ? { title: it, href: "#" } : it));
  }, [pages, s]);

  if ((!list || !list.length) && !(s?.footer_blocks || []).length) return null;

  if (list?.length) {
    return (
      <nav aria-label="Páginas">
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {list.slice(0, 12).map((p, i) => (
            <li key={i}>
              <div className="flex items-center justify-between gap-2">
                <a
                  className={`inline-flex items-center gap-2 transition
                    ${isDark ? "text-white/80 hover:text-[hsl(var(--accent))]" : "text-zinc-700 hover:text-[hsl(var(--accent))]"}`}
                  href={p.href || "#"}
                  aria-label={`Abrir página individual: ${p.title || "Página"}`}
                >
                  <span
                    aria-hidden
                    className={`inline-block h-1.5 w-1.5 rounded-full ${isDark ? "bg-white/60" : "bg-zinc-500/70"}`}
                  />
                  <span>{p.title || "Página"}</span>
                </a>
              </div>
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
          className={`prose prose-sm max-w-none
                     [&_a]:no-underline [&_ul]:m-0 [&_li]:m-0 [&_li]:py-1
                     ${
                       isDark
                         ? "text-white/80 [&_a]:text-white/80 [&_a:hover]:text-[hsl(var(--accent))]"
                         : "text-zinc-700 [&_a]:text-zinc-700 [&_a:hover]:text-[hsl(var(--accent))]"
                     }`}
          dangerouslySetInnerHTML={{ __html: b?.html || "" }}
        />
      ))}
    </div>
  );
}

/** Direcciones */
function Addresses({ s, isDark }) {
  const splitAddresses = (input) => {
    const raw = String(input || "");
    const temp = raw.split("||").join("//");
    const parts = temp
      .split("//")
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.map((p) => {
      const idx = p.indexOf(":");
      if (idx > -1) {
        const label = p.slice(0, idx).trim();
        const address = p.slice(idx + 1).trim();
        return { label: label || (s?.site_name || "Sede"), address };
      }
      return { label: s?.site_name || "Sede", address: p };
    });
  };

  const list = Array.isArray(s?.addresses) ? s.addresses : s?.address ? splitAddresses(s.address) : [];
  if (!list.length) return null;

  return (
    <div className="space-y-4">
      <ul className={`space-y-3 text-[13px] leading-6 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
        {list.slice(0, 6).map((a, i) => (
          <li key={i}>
            {a.label ? (
              <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{a.label}</div>
            ) : null}
            <div>{a.address}</div>
            <a
              className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition
                ${
                  isDark
                    ? "border border-white/15 bg-white/10 hover:bg-white/15 text-white"
                    : "border border-zinc-300/80 bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                }`}
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
            >
              Ver en Google Maps
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ========= Modal de políticas / legales ========= */
function LegalModal({ open, onClose, brandName }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Header modal */}
            <div
              className="px-5 md:px-7 py-4 flex items-center justify-between border-b"
              style={{ backgroundColor: "#071a35", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-[0.16em]">Avisos legales</p>
                <h3 className="text-sm md:text-base font-bold text-white mt-0.5">
                  Políticas de privacidad y términos de uso
                </h3>
              </div>
              <button type="button" onClick={onClose} className="text-white/70 hover:text:white text-sm font-semibold px-2">
                Cerrar
              </button>
            </div>

            {/* Contenido */}
            <div className="px-5 md:px-7 py-4 max-h-[70vh] overflow-y-auto text-neutral-800 text-sm md:text-[15px] leading-relaxed">
              <SectionTitle>1. Responsables del tratamiento de datos</SectionTitle>
              <p className="mb-3">
                {brandName} actúa como responsable del tratamiento de la información personal recolectada a través de
                este sitio web y de los canales asociados a la prestación de sus servicios jurídicos.
              </p>

              <SectionTitle>2. Finalidad del tratamiento</SectionTitle>
              <p className="mb-2">
                La información suministrada por los usuarios podrá ser utilizada, entre otros, para las siguientes
                finalidades:
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Atender consultas, solicitudes y comunicaciones remitidas por los usuarios.</li>
                <li>Gestionar la relación contractual o precontractual con clientes y aliados.</li>
                <li>Cumplir obligaciones legales y regulatorias aplicables a la firma.</li>
                <li>Remitir información relevante sobre servicios jurídicos y actualizaciones normativas, cuando el usuario lo autorice.</li>
              </ul>

              <SectionTitle>3. Derechos de los titulares</SectionTitle>
              <p className="mb-2">Los titulares de la información podrán ejercer, entre otros, los siguientes derechos:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Conocer, actualizar y rectificar sus datos personales.</li>
                <li>Solicitar la supresión de sus datos cuando resulte procedente.</li>
                <li>Revocar la autorización otorgada para el tratamiento, en los casos que aplique.</li>
                <li>Presentar quejas ante la autoridad competente por infracciones a la normativa de protección de datos.</li>
              </ul>

              <SectionTitle>4. Conservación de la información</SectionTitle>
              <p className="mb-3">
                Los datos personales serán conservados por el tiempo necesario para cumplir las finalidades indicadas y
                las exigencias legales o contractuales aplicables a la firma.
              </p>

              <SectionTitle>5. Uso del sitio web</SectionTitle>
              <p className="mb-3">
                El contenido publicado en este sitio tiene fines informativos y no constituye asesoría jurídica específica.
                Cualquier decisión debe adoptarse con base en una consulta directa y personalizada con profesionales de la firma.
              </p>

              <SectionTitle>6. Actualizaciones</SectionTitle>
              <p className="mb-1">
                {brandName} podrá modificar estas políticas en cualquier momento para atender cambios normativos o institucionales.
                Las versiones actualizadas serán publicadas en este mismo espacio.
              </p>

              <p className="mt-4 text-xs text-neutral-500 italic">
                Si desea ejercer sus derechos como titular de datos o conocer la versión completa de nuestras políticas, puede comunicarse
                a través de los canales oficiales de contacto de la firma.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }) {
  return (
    <h4 className="mt-3 mb-1 font-semibold text-sm md:text-[15px]" style={{ color: BRAND_BLUE }}>
      {children}
    </h4>
  );
}

/* ========= Footer principal ========= */
export default function Footer() {
  // ✅ render inmediato: no bloquees el footer esperando settings
  const [s, setS] = useState(() => ({}));
  const [error, setError] = useState(null);
  const [legalOpen, setLegalOpen] = useState(false);

  const { containerStagger, fadeInUp, hoverLift, iconHover } = useVariants();
  const isDark = useIsDark();

  useEffect(() => {
    let mounted = true;

    getSettingsCached()
      .then((data) => {
        if (!mounted) return;
        setS(data || {});
      })
      .catch((e) => {
        console.error("[Footer] settings error:", e);
        if (!mounted) return;
        setError(e);
        setS((prev) => prev || {});
      });

    return () => {
      mounted = false;
    };
  }, []);

  const socials = useMemo(() => {
    const parsed = (s?.social_links ?? []).map(parseSocialEntry).filter(Boolean);
    const filtered = parsed.filter((x) => x.platform || x.url || x.handle);
    return dedupeSocials(filtered).slice(0, 10);
  }, [s]);

  const year = useMemo(() => new Date().getFullYear(), []);

  const fixed = Boolean(s?.footer_fixed ?? false);
  const footerHeight = s?.footer_height || 260;

  const wrapperText = isDark ? "text-white" : "text-zinc-900";
  const fgMuted = isDark ? "text-white/80" : "text-zinc-700";
  const borderSoft = isDark ? "border-white/10" : "border-zinc-200";

  const baseBg = isDark
    ? "bg-gradient-to-br from-[#1b1b1b] via-[#171717] to-[#121212]"
    : "bg-gradient-to-br from-white via-white to-zinc-50";

  const topSheen = isDark ? "before:via-white/25" : "before:via-zinc-300/80";

  const content = (
    <>
      <footer
        role="contentinfo"
        className={[
          "z-[40]",
          "relative",
          baseBg,
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent",
          topSheen,
          "before:to-transparent",
          fixed ? "fixed inset-x-0 bottom-0" : "mt-16",
          wrapperText,
        ].join(" ")}
        style={fixed ? { "--footer-h": `${footerHeight}px` } : undefined}
      >
        {/* Cinta decorativa superior */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[68px] ${isDark ? "bg-white/[0.03]" : "bg-zinc-900/[0.02]"}`}
        />

        <motion.div
          className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-5"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Social arriba */}
          {socials?.length ? (
            <motion.div className="flex items-center justify-end gap-2 md:gap-3 pb-4" variants={containerStagger}>
              {socials.map((r, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <SocialIconButton item={r} isDark={isDark} iconHover={iconHover} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}

          {/* Zona principal: 4 columnas en desktop */}
          <motion.div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 ${borderSoft} border-t`}
            variants={containerStagger}
          >
            {/* Col 1: Logo + Páginas */}
            <motion.div variants={fadeInUp} {...hoverLift}>
              <div className="mb-4 flex items-center gap-3">
                {s?.logo_url ? (
                  <img
                    src={s.logo_url}
                    alt={s.site_name ? `${s.site_name} logo` : "Logo"}
                    className="h-10 md:h-12 object-contain shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <span
                  className={`font-display text-lg md:text-xl font-semibold tracking-tight ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {s?.site_name || "Blanco & Ramírez"}
                </span>
              </div>

              <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>Páginas</h4>
              <PagesList s={s} pages={PAGES_FROM_ROUTES} isDark={isDark} />
            </motion.div>

            {/* Col 2: Aliados */}
            <motion.div variants={fadeInUp} {...hoverLift}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>Aliados</h4>
              {FOOTER_ALLIES.length ? (
                <ul className="space-y-1.5 text-sm">
                  {FOOTER_ALLIES.map((ally) => (
                    <li key={ally.name}>
                      <a
                        href={ally.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline underline-offset-2 decoration-[0.08em] hover:text-[hsl(var(--accent))] ${
                          isDark ? "text-white/80" : "text-zinc-700"
                        }`}
                      >
                        {ally.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${fgMuted}`}>Pronto anunciaremos nuestros aliados.</p>
              )}
            </motion.div>

            {/* Col 3: Contacto */}
            <motion.div variants={fadeInUp} {...hoverLift}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>Contacto</h4>

              {s?.phone ? (
                <>
                  <h5 className={`text-sm font-medium mb-2 ${isDark ? "text-white/90" : "text-zinc-800"}`}>Teléfono</h5>
                  <Phones phones={s.phone} isDark={isDark} />
                </>
              ) : null}

              {s?.email ? (
                <>
                  <h5 className={`text-sm font-medium mt-4 mb-2 ${isDark ? "text-white/90" : "text-zinc-800"}`}>Email</h5>
                  <Emails emails={s.email} isDark={isDark} />
                </>
              ) : null}

              {!s?.phone && !s?.email ? <p className={`text-sm ${fgMuted}`}>Agrega teléfono o correo en settings.</p> : null}
            </motion.div>

            {/* Col 4: Direcciones */}
            <motion.div variants={fadeInUp} {...hoverLift}>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>Direcciones</h4>
              <Addresses s={s} isDark={isDark} />
            </motion.div>
          </motion.div>

          {/* Barra legal inferior */}
          <motion.div className={`pb-5 pt-4 ${borderSoft} border-t`} variants={fadeInUp}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-xs ${isDark ? "text-white/70" : "text-zinc-600"}`}>
                © {year} {s?.site_name || "Tu Sitio"}.{" "}
                <button
                  type="button"
                  onClick={() => setLegalOpen(true)}
                  className="underline underline-offset-2 decoration-[0.08em] hover:text-[hsl(var(--accent))] transition-colors"
                >
                  Todos los derechos reservados.
                </button>
              </p>

              <nav aria-label="Legal" className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${fgMuted}`}>
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
                  className={`inline-flex items-center gap-1 hover:text-[hsl(var(--accent))] ${isDark ? "text-white/80" : "text-zinc-700"}`}
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
              <p className={`mt-2 text-[11px] ${isDark ? "text-red-300/80" : "text-red-600/80"}`}>
                No se pudieron cargar algunos datos del footer.
              </p>
            ) : null}
          </motion.div>
        </motion.div>
      </footer>

      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} brandName={s?.site_name || "Tu Sitio"} />
    </>
  );

  if (!fixed) return content;

  return (
    <>
      <div aria-hidden style={{ height: footerHeight }} />
      {content}
    </>
  );
}
