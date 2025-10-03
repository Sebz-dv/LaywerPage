// components/team/TeamFinder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function TeamFinder({
  className = "",
  basePath = "/equipo",
  initialTab = "todos",
  pageSize = 9,
}) {
  const [tab, setTab] = useState(initialTab); // 'juridico' | 'no-juridico' | 'todos'
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [facets, setFacets] = useState({ cargos: [], areas: [], ciudades: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce para nombre
  const debouncedNombre = useDebounce(nombre, 250);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (tab !== "todos") p.set("tab", tab);
    if (debouncedNombre) p.set("nombre", debouncedNombre);
    if (cargo) p.set("cargo", cargo);
    if (area) p.set("area", area);
    if (ciudad) p.set("ciudad", ciudad);
    p.set("per_page", String(pageSize));
    p.set("page", String(page));
    return p.toString();
  }, [tab, debouncedNombre, cargo, area, ciudad, page, pageSize]);

  // Fetch
  useEffect(() => {
    let abort = new AbortController();
    setLoading(true);
    setError("");

    fetch(`${API_URL}/team?${query}`, { signal: abort.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const { data, meta } = json;
        setLastPage(meta?.last_page ?? 1);
        setFacets({
          cargos: meta?.facets?.cargos ?? [],
          areas: meta?.facets?.areas ?? [],
          ciudades: meta?.facets?.ciudades ?? [],
        });
        // Si page===1 reiniciamos; si no, agregamos
        setItems((prev) => (page === 1 ? data : [...prev, ...data]));
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Error");
      })
      .finally(() => setLoading(false));

    return () => abort.abort();
  }, [query, page]);

  // Resetear page al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [tab, debouncedNombre, cargo, area, ciudad]);

  const canLoad = page < lastPage;

  return (
    <section className={cx("w-full", className)}>

      {/* Tabs */}
      <div className="mt-4 inline-flex rounded-xl border border-[hsl(var(--border))] p-1 bg-[hsl(var(--card))]">
        {[
          { id: "juridico", label: "Jurídico" },
          { id: "no-juridico", label: "No Jurídico" },
          { id: "todos", label: "Todos" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              tab === t.id
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--fg))]"
                : "text-[hsl(var(--fg))/0.85] hover:bg-[hsl(var(--muted))]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
            Nombre
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Ana, Andrés…"
            className="w-full rounded-xl px-3 py-2 border outline-none bg-[hsl(var(--card))] text-[hsl(var(--fg))]
                       border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        <Select
          label="CARGO"
          value={cargo}
          onChange={setCargo}
          options={facets.cargos}
        />
        <Select
          label="ÁREA"
          value={area}
          onChange={setArea}
          options={facets.areas}
        />
        <Select
          label="CIUDAD"
          value={ciudad}
          onChange={setCiudad}
          options={facets.ciudades}
        />
      </div>

      {/* Resultados */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => {
          const slug = p.slug ?? slugify(p.nombre);
          return (
            <article
              key={slug + i}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm group"
            >
              <div className="aspect-[4/3] w-full rounded-lg bg-[hsl(var(--muted))] grid place-items-center overflow-hidden">
                {p.foto_url ? (
                  <img
                    src={p.foto_url}
                    alt={p.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[hsl(var(--fg))/0.5] text-sm">
                    Foto
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{p.nombre}</h3>
              <p className="text-sm text-[hsl(var(--fg))/0.85]">{p.cargo}</p>
              <p className="text-sm text-[hsl(var(--fg))/0.7]">
                {p.area} · {p.ciudad}
              </p>
              <div className="mt-4">
                <Link
                  to={`${basePath}/${slug}`}
                  className={cx(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium border",
                    "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                    "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  )}
                >
                  Ver Perfil
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 12h10M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          );
        })}

        {/* Skeletons */}
        {loading &&
          items.length === 0 &&
          Array.from({ length: pageSize }).map((_, k) => (
            <div
              key={k}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 animate-pulse"
            >
              <div className="aspect-[4/3] w-full rounded-lg bg-[hsl(var(--muted))]" />
              <div className="mt-4 h-4 w-2/3 bg-[hsl(var(--muted))] rounded" />
              <div className="mt-2 h-3 w-1/2 bg-[hsl(var(--muted))] rounded" />
              <div className="mt-2 h-3 w-1/3 bg-[hsl(var(--muted))] rounded" />
            </div>
          ))}
      </div>

      {/* Estado vacío / error */}
      {!loading && items.length === 0 && (
        <p className="mt-6 text-sm text-[hsl(var(--fg))/0.7]">
          {error
            ? `Error: ${error}`
            : "Sin resultados para los filtros actuales."}
        </p>
      )}

      {/* Cargar más */}
      {items.length > 0 && (
        <div className="mt-6 flex justify-center">
          {canLoad ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-medium border",
                "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              )}
            >
              {loading ? "Cargando..." : "Cargar más"}
            </button>
          )  : (
            <span className="text-sm text-[hsl(var(--fg))/0.7]"> 
            </span>
          )}
        </div>
      )}
    </section>
  );
}

// Subcomponentes auxiliares
function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-3 py-2 border outline-none
                   bg-[hsl(var(--card))] text-[hsl(var(--fg))]
                   border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
      >
        <option value="">Todas</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t.current);
  }, [value, delay]);
  return v;
}
