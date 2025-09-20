import React from "react";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

export default function TeamHero({
  kicker = "Nuestro Equipo",
  title = "Lideramos el cambio porque tenemos al mejor talento",
  description = "El talento individual se potencia cuando comparte un propósito. Cada integrante de nuestro equipo genera impacto y multiplica resultados.",
  className = "",
}) {
  return (
    <section
      className={cx(
        "rounded-2xl p-8 sm:p-10 shadow-sm border",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        className
      )}
    >
      <p className="text-sm tracking-wide uppercase text-[hsl(var(--fg))/0.7]">{kicker}</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-3 text-[hsl(var(--fg))/0.8] max-w-3xl text-pretty">
        {description}
      </p>
    </section>
  );
}
