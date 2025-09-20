// components/intro/FeaturesGrid.jsx
import React from "react";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

const DEFAULT_FEATURES = [
  { t: "Gestión de casos", d: "Organiza expedientes, documentos y estados." },
  { t: "Agenda inteligente", d: "Audiencias, reuniones y recordatorios." },
  { t: "Contactos", d: "Clientes, contrapartes y equipos." },
  { t: "Publicaciones", d: "Blog y boletines legales." },
  { t: "Reportes", d: "Indicadores y actividad del estudio." },
  { t: "Seguridad", d: "Autenticación JWT con cookies HTTPOnly." },
];

export default function FeaturesGrid({ features = DEFAULT_FEATURES, className = "" }) {
  return (
    <section id="features" className={className}>
      <h2 className="text-xl sm:text-2xl font-semibold">Características</h2>
      <p className="mt-2 text-[hsl(var(--fg))/0.75]">
        Todo lo que necesitas para operar un bufete moderno, en un solo lugar.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <article
            key={i}
            className={cx(
              "group rounded-xl p-5 border transition-colors",
              "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
              "hover:border-[hsl(var(--fg))/0.25] hover:bg-[hsl(var(--muted))]"
            )}
          >
            <div
              className={cx(
                "h-10 w-10 rounded-lg border grid place-items-center",
                "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
              )}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[hsl(var(--fg))]" aria-hidden="true">
                <path d="M6 7h12M6 12h12M6 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>

            <h3 className="mt-4 font-semibold text-[hsl(var(--fg))]">{f.t}</h3>
            <p className="mt-2 text-sm text-[hsl(var(--fg))/0.75]">{f.d}</p>

            <div className="mt-4 h-px bg-[hsl(var(--border))] group-hover:bg-[hsl(var(--fg))/0.2] transition-colors" />
          </article>
        ))}
      </div>
    </section>
  );
}
