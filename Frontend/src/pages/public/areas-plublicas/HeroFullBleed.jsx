import React from "react";

/**
 * HeroFullBleed
 * - Imagen como background cover (infalible, sin <img>)
 * - Fallback degradado si no hay imagen o falla
 * - Overlay para contraste
 * - Barra superior decorativa
 * - Chips y CTAs opcionales
 */
export default function HeroFullBleed({
  coverUrl,                 // string | undefined
  title,                    // string
  summary,                  // string | undefined
  pricingType,              // "fijo" | "hora" | "mixto" | undefined
  fromPrice,                // string | undefined (ej: "$150/h" o "Desde $1.2M")
  category,                 // string | undefined
  eta,                      // string | undefined (ej: "2-3 días")
  primaryCtaHref = "/contacto?topic=cotizacion",
  primaryCtaText = "Solicitar cotización",
  secondaryCtaHref = "/agenda", 
  className = "",           // clases extra opcionales para el <section>
}) {
  return (
    <section
      className={[
        "relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-3 z-10",
        className,
      ].join(" ")}
      aria-labelledby="hero-title"
    >
      <div
        className={[
          "relative isolate",
          "min-h-[90svh] md:min-h-[92svh]",
        ].join(" ")}
      >
        {/* Fondo degradado SIEMPRE presente */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
          }}
        />

        {/* Capa de imagen como background cover (si hay coverUrl) */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: coverUrl ? `url("${coverUrl}")` : "none",
          }}
          aria-hidden
        />

        {/* Barrido suave (CSS puro) */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.38) 45%, rgba(255,255,255,.52) 50%, rgba(255,255,255,.32) 55%, transparent 100%)",
            filter: "blur(10px)",
            mixBlendMode: "soft-light",
            animation: "hero-sweep 6s ease-in-out infinite",
          }}
        />

        {/* Overlay de contraste */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,27,58,.65) 0%, rgba(190,125,35,.28) 100%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* Contenido */}
        <div className="relative z-10 grid place-items-end md:place-items-center min-h-[inherit]">
          <div className="w-full max-w-5xl px-5 md:px-8 pb-8 md:pb-0 mx-auto">
            {title && (
              <h1
                id="hero-title"
                className="text-white font-semibold leading-[1.05] text-balance drop-shadow-[0_10px_28px_rgba(0,0,0,.45)] text-4xl sm:text-5xl md:text-6xl"
                style={{
                  letterSpacing: "0.02em",
                  fontKerning: "normal",
                  fontOpticalSizing: "auto",
                  textRendering: "optimizeLegibility",
                }}
              >
                {title}
              </h1>
            )}

            {summary && (
              <p className="mt-4 md:mt-5 max-w-3xl text-white/95 leading-relaxed text-lg md:text-xl">
                {summary}
              </p>
            )}

            {/* Chips */}
            {(pricingType || category || eta) && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {pricingType && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-3 py-1 text-xs text-white">
                    <span>
                      {pricingType === "fijo"
                        ? "Tarifa fija"
                        : pricingType === "hora"
                        ? "Por hora"
                        : "Mixto"}
                    </span>
                    {fromPrice && (
                      <span className="text-white/80">• {fromPrice}</span>
                    )}
                  </div>
                )}

                {category && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-2.5 py-1 text-xs text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                      <path
                        d="M20 13l-7 7-9-9V4h7l9 9z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
                    </svg>
                    {category}
                  </span>
                )}

                {eta && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-2.5 py-1 text-xs text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
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
                    {eta}
                  </span>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={primaryCtaHref}
                className="btn btn-accent rounded-xl text-base md:text-lg px-4 md:px-5 py-2 md:py-2.5"
              >
                {primaryCtaText}
              </a> 
            </div>
          </div>
        </div>

        {/* Banda superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
      </div>

      {/* Keyframes CSS (barrido) */}
      <style>{`
        @keyframes hero-sweep {
          0%   { transform: translateX(-60%); }
          50%  { transform: translateX(140%); }
          100% { transform: translateX(-60%); }
        }
      `}</style>
    </section>
  );
}
