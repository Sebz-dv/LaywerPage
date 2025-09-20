// components/ui/Button.jsx
import React from "react";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

export default function Button({ variant = "primary", className = "", ...props }) {
  const base = "rounded-xl px-4 py-2 text-sm font-medium border transition-colors focus:outline-none focus:ring-2";
  const map = {
    primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25] hover:bg-[hsl(var(--primary))/0.92] focus:ring-[hsl(var(--ring))]",
    ghost:   "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] focus:ring-[hsl(var(--ring))]",
    link:    "border-0 px-0 text-[hsl(var(--fg))] hover:underline underline-offset-4 focus:ring-[hsl(var(--ring))]",
  };
  return <button className={cx(base, map[variant], className)} {...props} />;
}
