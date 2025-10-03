// src/components/layout/Footer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { settingsService } from "../services/settingsService.js";
import {
  FaInstagram, FaFacebook, FaXTwitter, FaLinkedin, FaYoutube,
  FaTiktok, FaWhatsapp, FaGithub, FaGlobe,
} from "react-icons/fa6";

/* ========= Iconos por plataforma ========= */
const ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  twitter: FaXTwitter, x: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  github: FaGithub,
  default: FaGlobe,
};

/* ========= Aliases / sinónimos ========= */
const PLATFORM_ALIASES = {
  ig: "instagram", insta: "instagram",
  fb: "facebook",
  tw: "twitter", x: "twitter",
  in: "linkedin", linkedin: "linkedin",
  yt: "youtube", youTube: "youtube",
  tiktok: "tiktok", tt: "tiktok",
  wa: "whatsapp", whatsapp: "whatsapp",
  gh: "github", gitHub: "github",
  instagram: "instagram", facebook: "facebook", twitter: "twitter", github: "github",
};

/* ========= Helpers ========= */
function safeUrl(u = "") {
  const trimmed = String(u).trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
    case "instagram": return `https://instagram.com/${handle}`;
    case "facebook":  return `https://facebook.com/${handle}`;
    case "twitter":   return `https://x.com/${handle}`;
    case "linkedin":  return `https://www.linkedin.com/company/${handle}`;
    case "tiktok":    return `https://www.tiktok.com/@${handle}`;
    case "whatsapp":  return /^\+?\d{7,15}$/.test(handle) ? `https://wa.me/${handle.replace(/\D/g,"")}` : "";
    case "github":    return `https://github.com/${handle}`;
    case "youtube":   return `https://www.youtube.com/@${handle}`;
    default: return "";
  }
}

/** Parser tolerante: acepta string u objeto { platform, url, handle } */
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

/* ========= Subcomponentes ========= */
function SocialLink({ platform, url, handle }) {
  const Icon = ICONS[platform] ?? ICONS.default;
  const href = url ? safeUrl(url) : "#";
  const name = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Sitio";
  const label = handle ? `${name} (${handle.replace(/^@/,'@')})` : name;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))]/70
                 bg-[hsl(var(--card))] px-3 py-1.5 text-sm transition
                 hover:shadow-sm hover:border-[hsl(var(--ring))]/50 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/60"
    >
      <Icon className="text-base shrink-0" />
      <span className="truncate max-w-[12rem]">
        {name}{handle ? ` · ${handle.replace(/^@/,'@')}` : ""}
      </span>
    </a>
  );
}

function FooterLinkList({ title, html }) {
  return (
    <div>
      {title ? <h4 className="text-sm font-semibold text-[hsl(var(--fg))] mb-3">{title}</h4> : null}
      <div
        className="prose prose-sm max-w-none text-[hsl(var(--fg))]/80
                   [&_a]:text-[hsl(var(--fg))]/80 [&_a:hover]:text-[hsl(var(--brand))] [&_a]:no-underline
                   [&_ul]:m-0 [&_li]:m-0 [&_li]:py-1"
        dangerouslySetInnerHTML={{ __html: html || "" }}
      />
    </div>
  );
}

/* ========= Footer principal ========= */
export default function Footer() {
  const [s, setS] = useState(null);
  useEffect(() => { settingsService.get().then(setS).catch(() => setS({})); }, []);

  const socials = useMemo(() => {
    const raw = s?.social_links ?? [];
    return raw.map(parseSocialEntry).filter(Boolean).filter(x => x.platform || x.url || x.handle);
  }, [s]);

  const year = useMemo(() => new Date().getFullYear(), []);

  if (!s) return null;

  return (
    <footer role="contentinfo" className="mt-16 border-t border-[hsl(var(--border))]/60 bg-[hsl(var(--bg))]">
      {/* Banda superior (CTA ligera opcional) */}
      {s?.cta_text && s?.cta_link ? (
        <div className="border-b border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <a
              href={safeUrl(s.cta_link)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--fg))] hover:text-[hsl(var(--brand))]"
            >
              {s.cta_text}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      ) : null}

      {/* Cuerpo */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Marca / resumen */}
          <div className="md:col-span-1">
            {s.logo_url ? (
              <img
                src={s.logo_url}
                alt={s.site_name ? `${s.site_name} logo` : "Logo"}
                className="h-10 object-contain mb-4"
                loading="lazy"
              />
            ) : null}

            {s.site_name ? (
              <p className="text-base font-semibold text-[hsl(var(--fg))]">{s.site_name}</p>
            ) : null}

            {(s.tagline || s.description) ? (
              <p className="mt-2 text-sm text-[hsl(var(--fg))]/70 leading-relaxed">
                {s.tagline || s.description}
              </p>
            ) : null}

            {/* Datos de contacto */}
            <ul className="mt-4 space-y-1.5 text-sm text-[hsl(var(--fg))]/75">
              {s.address ? <li>{s.address}</li> : null}
              {(s.phone || s.email) ? (
                <li>
                  {s.phone ? <span>{s.phone}</span> : null}
                  {s.phone && s.email ? <span> · </span> : null}
                  {s.email ? (
                    <a className="hover:text-[hsl(var(--brand))]" href={`mailto:${s.email}`}>{s.email}</a>
                  ) : null}
                </li>
              ) : null}
            </ul>

            {/* Redes */}
            {socials.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {socials.map((r, i) => (
                  <SocialLink key={`${r.platform}-${i}`} platform={r.platform} url={r.url} handle={r.handle} />
                ))}
              </div>
            ) : null}
          </div>

          {/* Bloques de enlaces (hasta 3 columnas en md) */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(s.footer_blocks || []).slice(0, 6).map((b, i) => (
              <FooterLinkList key={i} title={b.title} html={b.html} />
            ))}

            {/* Newsletter simple (opcional) */}
            {s?.newsletter?.enabled ? (
              <div className="sm:col-span-2 lg:col-span-1">
                <h4 className="text-sm font-semibold text-[hsl(var(--fg))] mb-3">
                  {s.newsletter.title || "Suscríbete"}
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const email = new FormData(form).get("email");
                    // TODO: integra tu endpoint real
                    console.info("Newsletter signup:", email);
                    form.reset();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    inputMode="email"
                    placeholder={s.newsletter.placeholder || "Tu correo"}
                    className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]
                               px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]/60"
                    aria-label="Correo para suscripción"
                  />
                  <button
                    type="submit"
                    className="rounded-xl px-4 py-2 text-sm font-medium
                               bg-[hsl(var(--brand))] text-[hsl(var(--brand-contrast))]
                               hover:opacity-95 active:scale-[0.99] transition"
                  >
                    {s.newsletter.cta || "Unirme"}
                  </button>
                </form>
                {s.newsletter.note ? (
                  <p className="mt-2 text-xs text-[hsl(var(--fg))]/60">{s.newsletter.note}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Barra legal inferior */}
      <div className="border-t border-[hsl(var(--border))]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-between">
          <p className="text-xs text-[hsl(var(--fg))]/60">
            © {year} {s.site_name || "Tu Sitio"}. Todos los derechos reservados.
          </p>

          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {s?.privacy_url ? (
              <a className="hover:text-[hsl(var(--brand))]" href={safeUrl(s.privacy_url)}>Privacidad</a>
            ) : null}
            {s?.terms_url ? (
              <a className="hover:text-[hsl(var(--brand))]" href={safeUrl(s.terms_url)}>Términos</a>
            ) : null}
            {s?.cookies_url ? (
              <a className="hover:text-[hsl(var(--brand))]" href={safeUrl(s.cookies_url)}>Cookies</a>
            ) : null}
            {/* Back to top (UX nice-to-have) */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-[hsl(var(--brand))]"
              aria-label="Volver arriba"
              title="Volver arriba"
            >
              ↑ Arriba
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
