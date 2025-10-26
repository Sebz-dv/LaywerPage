// components/intro/FeaturesGrid.jsx
import React from "react";
import {
  FaShieldAlt,
  FaGavel,
  FaUniversity,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaHandHoldingUsd,
} from "react-icons/fa";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** Estructura:
 * { t: string, bullets: string[], icon?: ReactNode }
 */
const DEFAULT_FEATURES = [
  {
    t: "Representación y defensa jurídica",
    bullets: [
      "Litigio estratégico en derecho administrativo y constitucional.",
      "Defensa de directivos y funcionarios públicos.",
      "Procesos disciplinarios y fiscales.",
    ],
    icon: <FaShieldAlt />,
  },
  {
    t: "Gerencia y asesoría jurídica",
    bullets: [
      "Elaboración de proyectos normativos.",
      "Consultoría en políticas públicas.",
      "Prevención del daño antijurídico.",
    ],
    icon: <FaGavel />,
  },
  {
    t: "Derecho educativo",
    bullets: [
      "Asesoría a instituciones y entidades del sector.",
      "Defensa de derechos educativos.",
      "Elaboración de protocolos y políticas internas.",
    ],
    icon: <FaUniversity />,
  },
  {
    t: "Obras por impuestos",
    bullets: [
      "Estructuración de proyectos OxI en educación.",
      "Acompañamiento en formulación, aprobación y seguimiento.",
    ],
    icon: <FaHandHoldingUsd />,
  },
  {
    t: "Capacitación y formación",
    bullets: [
      "Talleres sobre contratación estatal, ética pública y riesgos legales.",
      "Programas a la medida para equipos directivos.",
    ],
    icon: <FaChalkboardTeacher />,
  },
  {
    t: "Acompañamiento integral",
    bullets: [
      "Revisión, aprobación y seguimiento a la ejecución.",
      "Gestión de hitos y cierre con enfoque de resultados.",
    ],
    icon: <FaProjectDiagram />,
  },
];

export default function FeaturesGrid({
  features = DEFAULT_FEATURES,
  title = "Servicios Jurídicos",
  subtitle = "Nuestro conocimiento, a su servicio.",
  className = "",
  // Si algún día quieres forzarlo a full-bleed otra vez: pasa fullBg={false} y manejas fuera
  fullBg = true,
}) {
  return (
    <section
      id="features"
      className={cx(
        "w-full",
        fullBg && "bg-[hsl(var(--primary))]",
        className
      )}
    >
      {/* Contenido ajustado */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-semibold font-display tracking-tight text-[hsl(var(--bg))]">
            {title}
          </h2>
          <p className="mt-2 text-[hsl(var(--bg))] opacity-90">{subtitle}</p>
        </header>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={i}
              className={cx(
                "group relative rounded-2xl p-5 border transition",
                "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
                // sintaxis segura para shadow con color y alpha
                "hover:shadow-[0_12px_28px_-16px_hsl(var(--primary)_/_0.35)]",
                "hover:border-[hsl(var(--ring))]"
              )}
            >
              {/* Icono */}
              <div
                className={cx(
                  "h-11 w-11 rounded-xl grid place-items-center",
                  "border border-[hsl(var(--border))]",
                  "bg-[hsl(var(--accent))] text-[hsl(var(--bg))]"
                )}
              >
                {f.icon ?? <FaShieldAlt className="h-5 w-5" />}
              </div>

              {/* Título */}
              <h3 className="mt-4 font-semibold text-[hsl(var(--fg))] text-lg leading-snug">
                {f.t}
              </h3>

              {/* Bullets / descripción */}
              {Array.isArray(f.bullets) ? (
                <ul className="mt-2 space-y-1.5 text-sm text-[hsl(var(--fg)/0.8)]">
                  {f.bullets.map((b, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="mt-[7px] h-[6px] w-[6px] rounded-full bg-[hsl(var(--primary))] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[hsl(var(--fg)/0.8)] whitespace-pre-line">
                  {f.d}
                </p>
              )}

              {/* Divider */}
              <div className="mt-4 h-px bg-[hsl(var(--border))] group-hover:bg-[hsl(var(--fg)/0.2)] transition-colors" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
