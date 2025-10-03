import React, { useMemo, useState } from "react";

/* ========= Mini util ========= */
const cx = (...xs) => xs.filter(Boolean).join(" ");

/* ========= Iconos inline ========= */
const Icon = {
  search: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  chevron: (p) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path
        d="M8 10l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  corporate: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 21h18M5 21V7a2 2 0 0 1 2-2h4v16M13 21V9h4a2 2 0 0 1 2 2v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  labor: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 10h18M6 10V7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M6 10v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  criminal: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M5 21h14M7 21V9l5-5 5 5v12M9.5 13h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  family: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7 11a3 3 0 1 0-3-3M20 8a3 3 0 1 1-3 3M3 21a6 6 0 0 1 12 0M9 21a6 6 0 0 1 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  ip: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 3l2.5 5 5.5.8-4 3.9.9 5.6L12 16l-4.9 2.3.9-5.6-4-3.9L9.5 8 12 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  realestate: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 12l9-7 9 7M5 10v10h14V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  tax: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M6 7h12M6 12h12M6 17h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  immigration: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2v6m0 8v6M4 12h16M6 7l-2-2m14 0l2-2m0 14l2 2M4 18l-2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  compliance: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 4h16v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V4zm4 8l2 2 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  public: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 3a9 9 0 1 0 9 9H12V3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
};

/* ========= Data por defecto (puedes reemplazar por tu API) ========= */
const DEFAULT_SERVICES = [
  {
    id: 1,
    title: "Derecho Corporativo & Startups",
    slug: "corporativo-startups",
    category: "Corporativo",
    icon: "corporate",
    summary:
      "Constitución de sociedades, gobierno corporativo, pactos de socios y rondas de inversión.",
    bullets: [
      "Creación de empresas y SAS",
      "Pactos de socios / vesting / ESOP",
      "Acuerdos de confidencialidad (NDA)",
      "Rondas Seed/Series A: due diligence legal",
    ],
    pricing_type: "mixto", // fijo/hora/mixto
    from_price: "Desde USD 900 (paquetes)",
  },
  {
    id: 2,
    title: "Laboral & Seguridad Social",
    slug: "laboral",
    category: "Laboral",
    icon: "labor",
    summary:
      "Contratos, manuales, comités, despidos con justa causa y litigios.",
    bullets: [
      "Contratos y reglamentos internos",
      "Estructuras de contratación: remoto, freelance, PEO",
      "Investigaciones internas",
      "Defensa en demandas laborales",
    ],
    pricing_type: "fijo",
    from_price: "Desde USD 350",
  },
  {
    id: 3,
    title: "Penal Empresarial",
    slug: "penal-empresarial",
    category: "Penal",
    icon: "criminal",
    summary:
      "Prevención y defensa en delitos económicos, fraude y cibercrimen.",
    bullets: [
      "Asesoría temprana ante Fiscalía",
      "Litigio penal estratégico",
      "Gestionar riesgos y compliance penal",
    ],
    pricing_type: "hora",
    from_price: "USD 150/h",
  },
  {
    id: 4,
    title: "Familia & Sucesiones",
    slug: "familia",
    category: "Familia",
    icon: "family",
    summary:
      "Divorcios, custodia, capitulaciones y herencias sin dramas innecesarios.",
    bullets: [
      "Divorcio (mutuo acuerdo o contencioso)",
      "Cuotas alimentarias y custodia",
      "Capitulaciones matrimoniales",
      "Sucesiones y particiones",
    ],
    pricing_type: "mixto",
    from_price: "Desde USD 400",
  },
  {
    id: 5,
    title: "Propiedad Intelectual & Marcas",
    slug: "propiedad-intelectual",
    category: "Propiedad Intelectual",
    icon: "ip",
    summary:
      "Registro, vigilancia y defensa de marcas, software y derechos de autor.",
    bullets: [
      "Búsqueda fonética y viabilidad",
      "Registro de marca / oposición",
      "Contratos de licencia / cesión",
      "Protección de software y UX",
    ],
    pricing_type: "fijo",
    from_price: "Desde USD 220",
  },
  {
    id: 6,
    title: "Inmobiliario",
    slug: "inmobiliario",
    category: "Inmobiliario",
    icon: "realestate",
    summary:
      "Compraventa, arrendamientos, due diligence y estructuración de proyectos.",
    bullets: [
      "Promesas y escrituras",
      "Revisión de títulos",
      "Arrendamientos y garantías",
      "Fideicomisos y proyectos",
    ],
    pricing_type: "mixto",
    from_price: "Desde USD 500",
  },
  {
    id: 7,
    title: "Tributario",
    slug: "tributario",
    category: "Tributario",
    icon: "tax",
    summary:
      "Planeación fiscal, conceptos y defensa ante la administración tributaria.",
    bullets: [
      "Planeación para empresas y founders",
      "Conceptos y diagnósticos",
      "Atención a requerimientos",
      "Litigios tributarios",
    ],
    pricing_type: "hora",
    from_price: "USD 180/h",
  },
  {
    id: 8,
    title: "Migratorio",
    slug: "migratorio",
    category: "Migratorio",
    icon: "immigration",
    summary:
      "Visas, permisos, nacionalidad y cumplimiento migratorio corporativo.",
    bullets: [
      "Visas de trabajo / inversión",
      "Permisos especiales",
      "Nacionalidad / residencia",
      "Políticas internas de movilidad",
    ],
    pricing_type: "fijo",
    from_price: "Desde USD 300",
  },
  {
    id: 9,
    title: "Compliance & Datos",
    slug: "compliance-datos",
    category: "Compliance",
    icon: "compliance",
    summary:
      "Programas de cumplimiento, habeas data, privacidad y ciberseguridad legal.",
    bullets: [
      "Mapa de riesgos y matrices",
      "Políticas de privacidad (GDPR/LPDP)",
      "Gestión de incidentes de seguridad",
      "Capacitaciones ejecutivas",
    ],
    pricing_type: "mixto",
    from_price: "Paquetes a medida",
  },
  {
    id: 10,
    title: "Contratación Pública",
    slug: "contratacion-publica",
    category: "Público",
    icon: "public",
    summary:
      "Pliegos, ofertas, audiencias y defensa en controversias contractuales.",
    bullets: [
      "Estrategia y estructuración de propuestas",
      "Observaciones y audiencias",
      "Ejecución y modificaciones",
      "Acciones y controversias",
    ],
    pricing_type: "hora",
    from_price: "USD 160/h",
  },
];
/* ========= UI helpers ========= */
function Button({
  as: As = "button",
  variant = "primary",
  size = "sm",
  className,
  children,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]";
  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
  }[size];
  const variants = {
    primary:
      "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:translate-y-[-1px] active:translate-y-0 shadow-sm",
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

function Chip({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={cx(
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "hover:bg-black/5 dark:hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}

function PriceBadge({ type, from }) {
  const label =
    type === "fijo" ? "Tarifa fija" : type === "hora" ? "Por hora" : "Mixto";
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
        {label}
      </span>
      {from && (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{from}</span>
      )}
    </div>
  );
}

/* ========= Card ========= */
function ServiceCard({ item, onSelect }) {
  const I = Icon[item.icon] ?? Icon.corporate;
  return (
    <article className="group relative rounded-2xl border bg-[hsl(var(--card))]/70 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
      {/* Borde degradado sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[hsl(var(--primary))/20]" />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl p-2 ring-1 ring-black/5 dark:ring-white/10">
            <I className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {item.summary}
            </p>
          </div>
        </div>

        {item.bullets?.length ? (
          <ul className="mt-4 space-y-1 ps-6 text-sm text-zinc-700 dark:text-zinc-300 list-disc">
            {item.bullets.slice(0, 4).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <PriceBadge type={item.pricing_type} from={item.from_price} />
          <div className="flex gap-2">
            <Button as="a" href={`/servicios/${item.slug}`} variant="ghost">
              Ver detalle
            </Button>
            <Button onClick={() => onSelect?.(item)} variant="primary">
              Cotizar
            </Button>
          </div>
        </div>
      </div>

      <span className="absolute right-3 top-3 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] tracking-wide text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
        {item.category}
      </span>
    </article>
  );
}

/* ========= Vista principal ========= */
export default function ServicesView({ items = DEFAULT_SERVICES, onSelect }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(items.map((x) => x.category)))],
    [items]
  );

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return items.filter((x) => {
      const inCat = cat === "Todas" || x.category === cat;
      if (!k) return inCat;
      const haystack = [x.title, x.summary, x.category, ...(x.bullets || [])]
        .join(" ")
        .toLowerCase();
      return inCat && haystack.includes(k);
    });
  }, [items, q, cat]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Servicios Legales
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Tranquilidad jurídica con criterio de negocio. Sin humo. Sin drama.
        </p>
      </div>

      {/* Controles */}
      <div className="mt-6 flex flex-col gap-3">
        {/* Buscador */}
        <div className="relative w-full sm:max-w-md">
          <Icon.search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: 'marcas', 'divorcio', 'contrato'…"
            className="w-full rounded-xl border bg-white/70 dark:bg-zinc-900/70 px-10 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Categorías pill (scroll en mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {categories.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ServiceCard key={item.id} item={item} onSelect={onSelect} />
        ))}
        {!filtered.length && (
          <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Sin coincidencias. Prueba con otro término o cambia la categoría.
          </div>
        )}
      </div>

      {/* CTA global */}
      <div className="mt-8 rounded-3xl border bg-gradient-to-br from-[hsl(var(--primary))/6] to-[hsl(var(--accent))/8] p-6 text-center">
        <h3 className="text-lg font-semibold">¿No ves tu caso aquí?</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Cuéntanos el contexto y armamos un plan sin letra chiquita.
        </p>
        <Button
          as="a"
          href="/contacto"
          variant="outline"
          size="md"
          className="mt-4"
        >
          Agenda una consulta
        </Button>
      </div>
    </section>
  );
}
