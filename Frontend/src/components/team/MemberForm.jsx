import React, { memo, useCallback } from "react";
import { TipoSelector } from "./TipoSelector";

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
  // Asegura strings para no entrar en controlado↔no controlado
  const safe = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();          // evita refresh o cierres raros
      e.stopPropagation();         // no burbujea a atajos globales
      onSubmit?.(e);
    },
    [onSubmit]
  );

  const isValid =
    safe(form?.nombre) &&
    safe(form?.cargo) &&
    safe(form?.area) &&
    safe(form?.ciudad) &&
    safe(form?.tipo);

  const patch = useCallback(
    (k) => (v) => setForm((f) => ({ ...f, [k]: v })),
    [setForm]
  );

  return (
    <form
      id="crud-form"
      onSubmit={handleSubmit}
      className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-4 space-y-3"
      onKeyDown={(e) => {
        // Evita que Enter/ESC disparen handlers globales del modal/router
        e.stopPropagation();
      }}
    >
      <h2 className="font-semibold">
        {isEditing ? "Editar miembro" : "Crear miembro"}
      </h2>

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
      <Input
        label="Área"
        value={safe(form?.area)}
        onChange={patch("area")}
        required
      />
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

      {/* Foto */}
      <div>
        <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7)]">
          Foto
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile?.(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:bg-[hsl(var(--card))] file:text-[hsl(var(--fg))] file:border-[hsl(var(--border))] hover:file:bg-[hsl(var(--muted))]"
        />
        {fotoPreview && (
          <div className="mt-2">
            <img
              src={fotoPreview}
              alt="preview"
              className="h-24 w-24 object-cover rounded-md border border-[hsl(var(--border))]"
              onError={(e) => {
                if (FALLBACK_AVATAR) e.currentTarget.src = FALLBACK_AVATAR;
              }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className="rounded-lg px-4 py-2 text-sm font-medium border bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25] hover:bg-[hsl(var(--primary))/0.92] disabled:opacity-60"
        >
          {isEditing ? "Guardar cambios" : "Crear"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

// Input memorizado: no pierde foco en rerenders del padre
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
