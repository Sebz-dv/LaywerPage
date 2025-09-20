import React from "react";

const DEFAULT_STATS = [
  {
    k: "+150",
    label: "Abogados",
    desc: "Expertos que transforman el derecho con visión y soluciones estratégicas.",
  },
  {
    k: "+100",
    label: "Profesionales",
    desc: "Especialistas en otras áreas que amplían nuestra perspectiva y hacen más poderosas nuestras soluciones.",
  },
  {
    k: "15",
    label: "Socios",
    desc: "Líderes con visión, enfoque sectorial e innovador.",
  },
  {
    k: "5",
    label: "Oficinas",
    desc: "Presencia en Quito, Bogotá, Medellín, Cali, Barranquilla, con alcance nacional.",
  },
];

function cx(...xs) { return xs.filter(Boolean).join(" "); }

export default function TeamKpis({ stats = DEFAULT_STATS, className = "" }) {
  return (
    <section className={cx("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s, i) => (
        <article
          key={i}
          className="rounded-2xl p-5 border bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-sm"
        >
          <div className="text-3xl font-semibold">{s.k}</div>
          <div className="mt-1 font-medium">{s.label}</div>
          <p className="mt-2 text-sm text-[hsl(var(--fg))/0.75]">{s.desc}</p>
        </article>
      ))}
    </section>
  );
}
