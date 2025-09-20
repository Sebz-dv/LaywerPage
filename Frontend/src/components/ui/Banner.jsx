// components/ui/Banner.jsx
// Banner accesible, estilado con tus tokens HSL, con soporte para acciones y cierre
import React, { useState } from "react";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * props:
 * - title?: string
 * - description?: React.ReactNode
 * - children?: React.ReactNode (contenido extra debajo de description)
 * - icon?: React.ReactNode
 * - actions?: Array<{ label: string, onClick?: ()=>void, href?: string, variant?: 'primary'|'ghost' }>
 * - dismissible?: boolean
 * - onDismiss?: ()=>void
 * - variant?: 'neutral'|'info'|'success'|'warning'|'danger'
 * - accentColor?: string (CSS color) — prioriza sobre variant
 * - compact?: boolean (reduce paddings)
 * - sticky?: boolean (sticky top)
 * - floating?: boolean (glass + shadow)
 * - className?: string
 */
export default function Banner({
  title,
  description,
  children,
  icon,
  actions = [],
  dismissible = false,
  onDismiss,
  variant = "neutral",
  accentColor,
  compact = false,
  sticky = false,
  floating = false,
  className,
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const tone = getTone(variant);
  const accent = accentColor ?? tone.accent;
  const role = variant === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={variant === "danger" ? "assertive" : "polite"}
      className={cx(
        "relative w-full rounded-2xl border",
        "border-[hsl(var(--border))]",
        floating
          ? "backdrop-blur bg-[hsl(var(--card))]/80 shadow-lg"
          : "bg-[hsl(var(--card))]",
        sticky ? "sticky top-0 z-40" : "",
        compact ? "px-4 py-3" : "px-6 py-4",
        className
      )}
      style={{
        // barra lateral y foco usan este acento
        ["--banner-accent"]: accent,
      }}
    >
      {/* barra de acento a la izquierda */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
        style={{ background: "var(--banner-accent)" }}
      />

      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
        {/* icono */}
        {icon ? (
          <div className="mt-0.5 h-5 w-5 text-[hsl(var(--fg))] opacity-90">
            {icon}
          </div>
        ) : (
          <div className="mt-0.5 h-5 w-5" />
        )}

        {/* texto */}
        <div>
          {title && (
            <h3 className="font-semibold leading-snug tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-[hsl(var(--fg))/0.9] leading-relaxed">
              {description}
            </p>
          )}
          {children && <div className="mt-2 text-sm">{children}</div>}

          {/* acciones (debajo en mobile) */}
          {actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((a, i) =>
                a.href ? (
                  <a key={i} href={a.href} className={buttonCls(a.variant)}>
                    {a.label}
                  </a>
                ) : (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className={buttonCls(a.variant)}
                  >
                    {a.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* cerrar */}
        {dismissible ? (
          <button
            onClick={() => {
              setOpen(false);
              onDismiss?.();
            }}
            className={cx(
              "ml-2 inline-flex h-8 w-8 items-center justify-center rounded-xl",
              "border border-[hsl(var(--border))]",
              "bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
            )}
            aria-label="Cerrar aviso"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ) : (
          <span className="w-8" />
        )}
      </div>
    </div>
  );
}

function buttonCls(variant = "primary") {
  return cx(
    "rounded-xl px-3 py-1.5 text-sm font-medium",
    variant === "primary"
      ? "bg-[hsl(var(--accent))/0.15] border border-[hsl(var(--accent))/0.3] hover:bg-[hsl(var(--accent))/0.25]"
      : "border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
  );
}

function getTone(variant) {
  switch (variant) {
    case "info":
      return { accent: "hsl(var(--ring))" };
    case "success":
      return { accent: "#16a34a" }; // verde (puedes mapear a tokens si los tienes)
    case "warning":
      return { accent: "#ca8a04" }; // dorado/ámbar
    case "danger":
      return { accent: "#dc2626" }; // rojo
    case "neutral":
    default:
      return { accent: "hsl(var(--accent))" };
  }
}
