// src/components/TeamHero.jsx
import React, { useId } from "react";

function cx(...xs) {
  return xs
    .flatMap((x) =>
      typeof x === "object" && x
        ? Object.entries(x)
            .filter(([, v]) => Boolean(v))
            .map(([k]) => k)
        : x
    )
    .filter(Boolean)
    .join(" ");
}

export default function TeamHero({
  kicker = "Nuestro Equipo",
  title = "Lideramos el cambio porque tenemos al mejor talento",
  description = "Nuestro equipo multidisciplinario combina experiencia pública, privada y académica para ofrecer asesoría integral y confiable.",
  align = "left", // 'left' | 'center'
  accent = true, // subrayado bajo el título
  actions = [], // [{ label, href, variant: 'primary'|'outline'|'accent' }]
  className = "",
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cx(
        "w-full",
        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
      )}
    >
      {/* Contenido centrado en ancho máximo */}
      <div className={cx("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8")}>
        <div className={cx("p-8 sm:p-10", className)}>
          <header
            className={cx("max-w-3xl", {
              "text-center mx-auto": align === "center",
              "text-left": align === "left",
            })}
          >
            {kicker ? (
              <p className="eyebrow text-xs tracking-[0.18em] uppercase text-white/70 mb-2">
                {kicker}
              </p>
            ) : null}

            <h1
              id={headingId}
              className={cx(
                "font-display text-balance",
                "text-3xl sm:text-4xl md:text-[2.75rem] leading-tight",
                "font-semibold"
              )}
            >
              {title}
            </h1>

            {accent ? (
              <span
                aria-hidden
                className={cx(
                  "mt-3 inline-block h-[3px] w-16 rounded-full bg-white/90",
                  { "mx-auto": align === "center" }
                )}
              />
            ) : null}

            {description ? (
              <p className="mt-4 text-pretty font-subtitle text-base leading-relaxed text-white/90">
                {description}
              </p>
            ) : null}

            {Array.isArray(actions) && actions.length > 0 ? (
              <div
                className={cx("mt-6 flex flex-wrap gap-3", {
                  "justify-center": align === "center",
                })}
              >
                {actions.slice(0, 3).map((a, i) => {
                  const base = "btn";
                  const variant =
                    a.variant === "outline"
                      ? "btn-outline text-white border-white/60 hover:bg-white/10"
                      : a.variant === "accent"
                      ? "btn-accent"
                      : "bg-white text-[hsl(var(--primary))] border border-white hover:brightness-95";
                  return (
                    <a
                      key={i}
                      href={a.href || "#"}
                      className={cx(base, variant)}
                    >
                      {a.label}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </header>
        </div>
      </div>
    </section>
  );
}
