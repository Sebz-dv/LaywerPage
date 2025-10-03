import React from "react";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}
 
export function TipoSelector({
  label = "Tipo",
  value,
  onChange,
  required = false,
  groups = [],
}) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
        {label}
        {required && " *"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cx(
          "w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))]",
          "border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] outline-none"
        )}
      >
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
