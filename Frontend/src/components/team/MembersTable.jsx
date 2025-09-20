// src/components/team/MembersTable.jsx
import React from "react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const resolveUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_ORIGIN}${u}`);
const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>';

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * @param {{
 *  items: Array<any>,
 *  loading?: boolean,
 *  error?: string,
 *  onEdit: (m:any)=>void,
 *  onDelete: (m:any)=>void,
 *  onOpenProfile: (slug:string)=>void
 * }} props
 */
export function MembersTable({
  items = [],
  loading = false,
  error = "",
  onEdit,
  onDelete,
  onOpenProfile,
}) {
  return (
    <div className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-4">
      <div className="mt-2 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b border-[hsl(var(--border))]">
              <Th>Foto</Th>
              <Th>Nombre</Th>
              <Th>Cargo</Th>
              <Th>Área</Th>
              <Th>Ciudad</Th>
              <Th>Tipo</Th>
              <Th className="w-56">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.slug} className="border-b border-[hsl(var(--border))]">
                <Td>
                  {m.foto_url ? (
                    <img
                      src={resolveUrl(m.foto_url)}
                      alt={m.nombre}
                      className="h-10 w-10 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-[hsl(var(--muted))]" />
                  )}
                </Td>
                <Td>{m.nombre}</Td>
                <Td>{m.cargo}</Td>
                <Td>{m.area}</Td>
                <Td>{m.ciudad}</Td>
                <Td className="capitalize">{m.tipo?.replace("-", " ")}</Td>
                <Td>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onEdit?.(m)}
                      className="rounded-lg px-3 py-1.5 border text-xs bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onOpenProfile?.(m.slug)}
                      className="rounded-lg px-3 py-1.5 border text-xs bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => onDelete?.(m)}
                      className="rounded-lg px-3 py-1.5 border text-xs bg-red-600/90 text-white border-red-600 hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && items.length === 0 && (
          <p className="py-6 text-[hsl(var(--fg))/0.7]">Cargando…</p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="py-6 text-[hsl(var(--fg))/0.7]">Sin resultados.</p>
        )}
        {error && <p className="py-3 text-red-600">Error: {error}</p>}
      </div>
    </div>
  );
}

function Th({ children, className }) {
  return (
    <th className={cx("px-3 py-2 text-[hsl(var(--fg))/0.7] font-medium", className)}>
      {children}
    </th>
  );
}
function Td({ children, className }) {
  return <td className={cx("px-3 py-2 align-middle", className)}>{children}</td>;
}
