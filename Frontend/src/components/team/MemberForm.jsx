import React, { memo, useCallback, useMemo } from "react";
import { TipoSelector } from "./TipoSelector";

/* ===== Helpers ===== */
const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

function titleCase(s = "") {
  return s
    .toLowerCase()
    .replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function parseAreasFromText(text = "") {
  const parts = String(text)
    .split(/\r?\n|[;,|]+|\s-\s/gi)
    .map((x) => x.trim())
    .filter(Boolean)
    .map(titleCase);

  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

function formatAreasToText(arr = []) {
  return (Array.isArray(arr) ? arr : []).join("\n");
}

export function MemberForm({
  form,
  setForm,
  isEditing = false,
  onSubmit,
  onCancel,
  onFile,
  fotoPreview,
  FALLBACK_AVATAR,
  extraTipoGroups,
}) {
  const patch = useCallback(
    (k) => (v) => setForm((f) => ({ ...f, [k]: v })),
    [setForm]
  );

  const areasText = useMemo(() => formatAreasToText(form?.areas || []), [form?.areas]);
  const updateAreasFromText = useCallback(
    (txt) => setForm((f) => ({ ...f, areas: parseAreasFromText(txt) })),
    [setForm]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSubmit?.(e);
    },
    [onSubmit]
  );

  const hasAreas = Array.isArray(form?.areas) && form.areas.length > 0;
  const tipoOk =
    safe(form?.tipo) &&
    (form?.tipo !== "otro" || (safe(form?.tipo_otro).trim().length > 0));
  const isValid =
    safe(form?.nombre) &&
    safe(form?.cargo) &&
    hasAreas &&
    safe(form?.ciudad) &&
    tipoOk;

  const currentPreview =
    fotoPreview || form?.foto_url || FALLBACK_AVATAR || undefined;

  return (
    <form
  id="crud-form"
  onSubmit={handleSubmit}
  className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-4 sm:p-5 space-y-4 max-w-5xl w-full"
  onKeyDown={(e) => e.stopPropagation()}
>

  {/* GRID RESPONSIVE: 1 col en mobile, 2 col en md+ */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Nombre"
      value={safe(form?.nombre)}
      onChange={patch("nombre")}
      required
      autoComplete="name"
    />

    <Input
      label="Cargo"
      value={safe(form?.cargo)}
      onChange={patch("cargo")}
      required
    />

    {/* Áreas (textarea) → ocupa 2 columnas */}
    <div className="md:col-span-2">
      <Textarea
        label="Áreas"
        value={areasText}
        onChange={updateAreasFromText}
        placeholder={[
          "Una por línea. Ejemplos:",
          "Tributario",
          "Corporativo",
          "Litigios",
          "",
          "También puedes separar con ';', ',' , '|' o ' - ' (con espacios).",
        ].join("\n")}
        required
      />

      {hasAreas ? (
        <ul
          className="
            mt-2 flex flex-wrap gap-2
            [&>*]:shrink-0
            max-h-28 overflow-y-auto pr-1
            md:max-h-none md:overflow-visible
          "
        >
          {form.areas.map((a, i) => (
            <li key={`${a}-${i}`} className="badge">
              {a}
              <button
                type="button"
                className="ml-2 text-xs opacity-70 hover:opacity-100"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    areas: f.areas.filter((_, idx) => idx !== i),
                  }))
                }
                aria-label={`Quitar ${a}`}
                title={`Quitar ${a}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-muted">
          Escribe cada área en una línea. También se aceptan <code>;</code>,{" "}
          <code>,</code>, <code>|</code> y <code>" - "</code> (con espacios).
        </p>
      )}
    </div>

    <Input
      label="Ciudad"
      value={safe(form?.ciudad)}
      onChange={patch("ciudad")}
      required
      autoComplete="address-level2"
    />

    <TipoSelector
      label="Tipo"
      value={safe(form?.tipo)}
      onChange={patch("tipo")}
      required
      groups={extraTipoGroups}
    />

    {form?.tipo === "otro" && (
      <div className="md:col-span-2">
        <Input
          label="Especifica el tipo"
          value={safe(form?.tipo_otro)}
          onChange={patch("tipo_otro")}
          required
          placeholder="Ej. Consultor externo"
        />
      </div>
    )}

    {/* Foto + preview: en mobile vertical, en md+ dos columnas alineadas */}
    <div className="md:col-span-2">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
        <div>
          <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
            Foto
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile?.(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:bg-[hsl(var(--card))] file:text-[hsl(var(--fg))] file:border-[hsl(var(--border))] hover:file:bg-[hsl(var(--muted))]"
          />
        </div>

        {currentPreview && (
          <div className="sm:justify-self-end">
            <img
              src={currentPreview}
              className="h-24 w-24 object-cover rounded-md border border-[hsl(var(--border))]"
              onError={(e) => {
                if (FALLBACK_AVATAR) e.currentTarget.src = FALLBACK_AVATAR;
              }}
              alt="Vista previa de la foto"
            />
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Botones: stack en mobile, inline en sm+ */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
    <button
      type="submit"
      disabled={!isValid}
      className="rounded-lg px-4 py-2 text-sm font-medium border transition-colors
                 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                 border-[hsl(var(--border))/0.25]
                 hover:brightness-95 disabled:opacity-60"
    >
      {isEditing ? "Guardar cambios" : "Crear"}
    </button>

    <button
      type="button"
      onClick={onCancel}
      className="rounded-lg px-4 py-2 text-sm font-medium border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
    >
      Cancelar
    </button>
  </div>
</form>

  );
}

/* ===== Inputs ===== */

const Input = memo(function Input({
  label,
  value = "",
  onChange,
  required = false,
  placeholder,
  type = "text",
  autoComplete = "off",
}) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        name={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        spellCheck={false}
        className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] outline-none"
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  );
});

const Textarea = memo(function Textarea({
  label,
  value = "",
  onChange,
  required = false,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7]">
        {label}
        {required && " *"}
      </label>
      <textarea
        name={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] outline-none min-h-[7.5rem]"
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  );
});
