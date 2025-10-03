import React from "react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

const Icon = {
  check: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  info: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 10v6m0-9h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  tag: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20 13l-7 7-9-9V4h7l9 9z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
    </svg>
  ),
  clock: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function Button({ as: As = "button", variant = "primary", size = "sm", className, children, ...rest }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]";
  const sizes = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2" }[size];
  const variants = {
    primary: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:translate-y-[-1px] active:translate-y-0 shadow-sm",
    outline: "border hover:bg-black/5 dark:hover:bg-white/5",
    ghost: "hover:bg-black/5 dark:hover:bg-white/5",
    link: "underline underline-offset-4 hover:no-underline px-0",
  }[variant];
  return (
    <As className={cx(base, sizes, variants, className)} {...rest}>
      {children}
    </As>
  );
}

function PriceBadge({ type, from }) {
  const label = type === "fijo" ? "Tarifa fija" : type === "hora" ? "Por hora" : "Mixto";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <span>{label}</span>
      {from && <span className="text-zinc-500 dark:text-zinc-400">• {from}</span>}
    </div>
  );
}

function FAQ({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold">Preguntas frecuentes</h3>
      <div className="mt-4 divide-y overflow-hidden rounded-2xl border">
        {items.map((f, i) => (
          <details key={i} className="group p-4 [&_summary]:cursor-pointer">
            <summary className="flex items-center justify-between font-medium">
              {f.q}
              <span className="ms-4 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs transition group-open:rotate-180">
                ^
              </span>
            </summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function CheckList({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon.check className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="text-sm">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function ScopeTable({ title = "Alcance típico", items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">{title}</h4>
      <div className="mt-2 overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="odd:bg-zinc-50/60 dark:odd:bg-zinc-900/40">
                <td className="p-3 font-medium">{row.label}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlobalCTA({ href = "/contacto" }) {
  return (
    <div className="mt-10 rounded-3xl border bg-gradient-to-br from-[hsl(var(--primary))/6] to-[hsl(var(--accent))/8] p-6 text-center">
      <h3 className="text-lg font-semibold">¿Listo para avanzar?</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Propuesta clara y cerrada tras una evaluación rápida.
      </p>
      <Button as="a" href={href} variant="outline" size="md" className="mt-4">
        Agendar una consulta
      </Button>
    </div>
  );
}

export default function ServiceDetail({ item, related = [] }) {
  if (!item) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Servicio no encontrado.</p>
          <a className="mt-4 inline-block underline" href="/servicios">Volver a servicios</a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
      {/* Breadcrumb */}
      <nav className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
        <a href="/" className="hover:underline">Inicio</a>
        <span className="mx-1">/</span>
        <a href="/servicios" className="hover:underline">Servicios</a>
        <span className="mx-1">/</span>
        <span className="text-foreground">{item.title}</span>
      </nav>

      {/* Header con banda de color */}
      <header className="mt-4 overflow-hidden rounded-3xl border">
        <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
        <div className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{item.title}</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <PriceBadge type={item.pricing_type} from={item.from_price} />
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                  <Icon.tag className="h-4 w-4" /> {item.category}
                </span>
                {item.eta && (
                  <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs">
                    <Icon.clock className="h-4 w-4" /> {item.eta}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button as="a" href="/contacto?topic=cotizacion" variant="primary" size="md">
                Solicitar cotización
              </Button>
              <Button as="a" href="/agenda" variant="outline" size="md">
                Agendar llamada
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <article className="lg:col-span-2">
          {item.bullets?.length ? (
            <>
              <h2 className="text-lg font-semibold">¿Qué incluye?</h2>
              <CheckList items={item.bullets} />
            </>
          ) : null}

          <ScopeTable
            items={
              item.scope ?? [
                { label: "Revisión inicial", value: "Diagnóstico legal y plan de acción." },
                { label: "Documentos", value: "Contratos/formatos adaptados a tu caso." },
                { label: "Acompañamiento", value: "Asesoría durante la ejecución." },
                { label: "Cierre", value: "Checklist final y recomendaciones." },
              ]
            }
          />

          <div className="mt-6 rounded-2xl border p-4">
            <p className="flex items-start gap-2 text-sm">
              <Icon.info className="mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Precios y tiempos referenciales. Propuesta cerrada tras evaluación inicial (rápida y sin compromiso).
              </span>
            </p>
          </div>

          <FAQ items={item.faqs ?? [
            { q: "¿Cuánto tarda?", a: "Solemos entregar plan inicial en 2–5 días hábiles." },
            { q: "¿Trabajo remoto?", a: "Sí, reuniones breves, firmas electrónicas y tableros compartidos." },
            { q: "¿Tarifa plana?", a: "En corporativo, PI y migratorio manejamos paquetes cerrados." },
          ]} />

          <GlobalCTA />
        </article>

        {/* Columna lateral */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border p-5">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">
              Documentos frecuentes
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(item.docs ?? ["Contrato/Acuerdo principal", "Políticas / Anexos", "Carta de instrucciones"]).map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon.check className="mt-0.5 h-4 w-4" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t pt-5">
              <h4 className="text-sm font-semibold">Contacto directo</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                ¿Caso urgente? Te asignamos un abogado hoy.
              </p>
              <Button as="a" href="/contacto?urgente=1" variant="outline" className="mt-3">
                Contacto urgente
              </Button>
            </div>
          </div>

          {related?.length ? (
            <div className="mt-6 rounded-2xl border p-5">
              <h3 className="text-sm font-semibold">Servicios relacionados</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {related.map((r) => (
                  <li key={r.slug} className="flex items-center justify-between gap-2">
                    <a href={`/servicios/${r.slug}`} className="underline underline-offset-4 hover:no-underline">
                      {r.title}
                    </a>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{r.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
