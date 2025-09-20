import React, { useEffect, useMemo, useRef, useState } from "react";
import { infoBlocksService } from "../../services/infoBlocksService";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function byCustomOrderThenPosition(order = [], a, b) {
  const pos = (k) => {
    const i = order.indexOf(String(k || "").toLowerCase());
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  const ao = pos(a.key),
    bo = pos(b.key);
  if (ao !== bo) return ao - bo;
  const ap = a.position ?? 0,
    bp = b.position ?? 0;
  if (ap !== bp) return ap - bp;
  return (a.id ?? 0) - (b.id ?? 0);
}

const TITLE_SIZES = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

export default function InfoBlocksSection({
  title = "Nosotros",
  subtitle = "Conoce nuestra identidad institucional",
  order = ["mision", "vision", "valores"],
  className,
  showAnchors = true,

  // 🆕 control del tamaño/estilo del título
  titleSize = "2xl", // "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
  titleClassName = "", // override total (opcional)
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [activeKey, setActiveKey] = useState("");

  const containerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const list = await infoBlocksService.list({ onlyPublic: true });
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "No se pudo cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    const normOrder = order.map((s) => String(s).toLowerCase());
    return [...items].sort((a, b) =>
      byCustomOrderThenPosition(normOrder, a, b)
    );
  }, [items, order]);

  // Resaltar anchor activo
  useEffect(() => {
    if (!containerRef.current || sorted.length === 0) return;
    const sections = Array.from(
      containerRef.current.querySelectorAll("[data-infoblock]")
    );
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActiveKey(vis[0].target.getAttribute("data-key") || "");
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.25, 0.5, 0.75] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [sorted.length]);

  const scrollTo = (id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={cx("w-full", className)}>
      <header className="mb-6">
        <h1
          className={cx(
            TITLE_SIZES[titleSize] || "text-2xl",
            "font-semibold tracking-tight",
            titleClassName
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[hsl(var(--fg))/0.7] flex justify-center">
            {subtitle}
          </p>
        )}
        <div className="mt-3">
          {loading ? (
            <span className="text-xs text-[hsl(var(--fg))/0.6]">Cargando…</span>
          ) : (
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-[hsl(var(--border))] px-2 py-1 text-xs hover:bg-[hsl(var(--muted))]"
            >
              Recargar
            </button>
          )}
        </div>
      </header>

      {err && (
        <div className="mb-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[hsl(var(--destructive))] text-sm">
          {String(err)}
        </div>
      )}

      {/* Mobile: chips arriba */}
      {showAnchors && sorted.length > 0 && (
        <nav className="mb-4 lg:hidden overflow-x-auto">
          <ul className="flex gap-2">
            {sorted.map((b) => {
              const id = `info-${(b.key || "").toLowerCase()}`;
              const active = activeKey === (b.key || "").toLowerCase();
              return (
                <li key={`chip-${b.id}`}>
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    className={cx(
                      "rounded-full border px-3 py-1.5 text-xs",
                      "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
                      active
                        ? "text-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                        : "hover:bg-[hsl(var(--muted))]"
                    )}
                    title={b.title}
                  >
                    {b.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop TOC */}
        {showAnchors && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ul className="space-y-1">
                {sorted.map((b) => {
                  const id = `info-${(b.key || "").toLowerCase()}`;
                  const active = activeKey === (b.key || "").toLowerCase();
                  return (
                    <li key={`toc-${b.id}`}>
                      <button
                        type="button"
                        onClick={() => scrollTo(id)}
                        className={cx(
                          "w-full text-left text-sm rounded-lg px-3 py-2 border",
                          active
                            ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--card))]"
                            : "border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                        )}
                        title={b.title}
                      >
                        {b.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}

        {/* Contenido */}
        <div ref={containerRef} className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
              >
                <div className="h-5 w-1/3 rounded bg-[hsl(var(--muted))] mb-3" />
                <div className="h-4 w-full rounded bg-[hsl(var(--muted))] mb-2" />
                <div className="h-4 w-5/6 rounded bg-[hsl(var(--muted))]" />
              </div>
            ))
          ) : sorted.length === 0 ? (
            <p className="text-[hsl(var(--fg))/0.7]">
              No hay información publicada.
            </p>
          ) : (
            sorted.map((b) => {
              const id = `info-${(b.key || "").toLowerCase()}`;
              const key = (b.key || "").toLowerCase();
              return (
                <article
                  key={b.id}
                  id={id}
                  data-infoblock
                  data-key={key}
                  className={cx(
                    "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition",
                    "hover:border-[hsl(var(--ring))] focus-within:border-[hsl(var(--ring))]"
                  )}
                  itemScope
                  itemType="https://schema.org/CreativeWork"
                >
                  <header className="border-b border-[hsl(var(--border))] px-5 py-4">
                    <h3
                      className="text-lg font-semibold leading-tight"
                      itemProp="name"
                    >
                      {b.title}
                    </h3>
                  </header>
                  <div className="px-5 py-4">
                    <div
                      className="text-[hsl(var(--fg))/0.9] leading-relaxed whitespace-pre-line"
                      itemProp="text"
                    >
                      {b.body}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
