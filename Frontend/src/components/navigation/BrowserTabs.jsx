import React, { useEffect, useMemo, useRef, useState } from "react";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * @param {Object} props
 * @param {{id:string,label:string,element:React.ReactNode}[]} props.tabs
 * @param {string=} props.initialId
 * @param {string=} props.storageKey
 */
export default function BrowserTabs({
  tabs = [],
  initialId,
  storageKey = "ui:browser-tabs",
}) {
  const ids = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const firstId = useMemo(() => ids[0], [ids]);

  const readStored = () => {
    try {
      const v = storageKey ? localStorage.getItem(storageKey) : null;
      if (v && ids.includes(v)) return v;
    } catch {
        // noop
    }
    return undefined;
  };

  const [activeId, setActiveId] = useState(
    () => readStored() ?? initialId ?? firstId
  );
  const listRef = useRef(null);

  useEffect(() => {
    if (!storageKey || !activeId) return;
    try {
      localStorage.setItem(storageKey, activeId);
    } catch {
        // noop
    }
  }, [activeId, storageKey]);

  useEffect(() => {
    // si cambian las tabs y activeId ya no existe, fallback
    if (!ids.includes(activeId)) setActiveId(firstId);
  }, [ids, activeId, firstId]);

  const onKeyDown = (e) => {
    if (!listRef.current) return;
    const idx = ids.indexOf(activeId);
    if (idx < 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveId(ids[(idx + 1) % ids.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveId(ids[(idx - 1 + ids.length) % ids.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveId(ids[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveId(ids[ids.length - 1]);
    }
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Secciones"
        onKeyDown={onKeyDown}
        className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1"
      >
        {tabs.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiveId(t.id)}
              className={cx(
                "relative min-w-[120px] whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium",
                selected
                  ? "bg-[hsl(var(--muted))] ring-1 ring-[hsl(var(--ring))]"
                  : "hover:bg-[hsl(var(--muted))] text-[hsl(var(--fg))/0.85]"
              )}
            >
              {t.label}
              {selected && (
                <span className="pointer-events-none absolute inset-x-4 -bottom-[2px] h-[2px] rounded bg-[hsl(var(--accent))]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={t.id !== activeId}
          >
            {t.element}
          </div>
        ))}
      </div>
    </div>
  );
}
