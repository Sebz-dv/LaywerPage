import React from "react";
import { Link } from "react-router-dom";
import {
  FiSettings,
  FiUsers,
  FiFileText,
  FiLayers,
  FiImage,
  FiEdit3,
  FiInfo,
  FiExternalLink,
} from "react-icons/fi";

const cx = (...xs) => xs.filter(Boolean).join(" ");

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-token bg-card p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

function Tile({ to, icon, title, desc, cta = "Abrir" }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      className={cx(
        "group rounded-2xl border border-token bg-card p-5 hover:shadow-lg transition-shadow",
        "hover:border-[hsl(var(--ring))]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-token bg-muted">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted">{desc}</p>
          <div className="mt-3 inline-flex items-center text-sm text-primary">
            {cta}
            <FiExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
      {/* Header */}
      <header className="rounded-3xl border overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" />
        <div className="p-6 md:p-7">
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            Panel de administración
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted">
            Gestiona el contenido del sitio y la configuración visual.{" "}
            <span className="font-medium text-foreground">
              Los cambios publicados se reflejan en la aplicación pública
              automáticamente.
            </span>{" "}
            (tu navegador podría cachear imágenes por unos segundos).
          </p>

          {/* Callouts de comportamiento */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-token bg-muted/60 p-3 text-xs">
              <span className="font-semibold">Borradores: </span>
              crea o edita con tranquilidad; no aparecen públicamente hasta que
              actives <span className="font-medium">Publicado</span>.
            </div>
            <div className="rounded-xl border border-token bg-muted/60 p-3 text-xs">
              <span className="font-semibold">Destacados: </span>
              marca áreas o artículos como <span className="font-medium">featured</span> para
              priorizarlos en la página principal.
            </div>
            <div className="rounded-xl border border-token bg-muted/60 p-3 text-xs">
              <span className="font-semibold">Imágenes y archivos: </span>
              se suben a <span className="font-medium">/storage</span>; si no las ves al instante,
              refresca con <span className="font-medium">Ctrl/Cmd + Shift + R</span>.
            </div>
          </div>
        </div>
      </header>

      {/* Quick stats (dummy place-holders; conecta a tu API si quieres) */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="Áreas de práctica" value="—" hint="Activas / Destacadas" />
        <Stat label="Publicaciones" value="—" hint="Publicadas / Borradores" />
        <Stat label="Integrantes" value="—" hint="Visibles en /equipo" />
      </section>

      {/* Acciones principales */}
      <section className="mt-6">
        <h2 className="text-lg md:text-xl font-semibold">Contenido</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tile
            to="/dash/areas"
            icon={FiLayers}
            title="Áreas de práctica"
            desc="Crea/edita áreas, define orden, activa publicación y 'destacado'. Se reflejan en /servicios."
          />
          <Tile
            to="/dash/articles"
            icon={FiFileText}
            title="Publicaciones"
            desc="Gestiona artículos del blog. Usa portada, categorías y estado publicado/borrador."
          />
          <Tile
            to="/dash/members"
            icon={FiUsers}
            title="Equipo"
            desc="Administra integrantes y perfiles extendidos. Se muestran en /equipo."
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg md:text-xl font-semibold">Marca y apariencia</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tile
            to="/dash/carousel"
            icon={FiImage}
            title="Carrusel"
            desc="Sube/ordena imágenes destacadas para la portada. Los cambios son inmediatos."
          />
          <Tile
            to="/dash/info"
            icon={FiInfo}
            title="Bloques informativos"
            desc="Gestiona secciones rápidas (cards/banners) que aparecen en páginas públicas."
          />
          <Tile
            to="/dash/settings"
            icon={FiSettings}
            title="Configuración del sitio"
            desc="Logo, colores, metadatos y ajustes generales. Se aplican al instante."
          />
        </div>
      </section>

      {/* Notas operativas rápidas */}
      <section className="mt-8">
        <div className="rounded-2xl border border-token bg-card p-5">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <FiEdit3 className="h-5 w-5" />
            Flujo recomendado de edición
          </h3>
          <ol className="mt-3 list-decimal pl-5 text-sm md:text-[15px] space-y-2 text-soft">
            <li>
              Crea o edita el contenido en su sección (ej. un área o un
              artículo) y guarda como <span className="font-medium">borrador</span>.
            </li>
            <li>
              Revisa la vista pública (usa el enlace de previsualización si tu
              módulo lo expone).
            </li>
            <li>
              Activa <span className="font-medium">Publicado</span> y, si aplica, marca como{" "}
              <span className="font-medium">Destacado</span>.
            </li>
            <li>
              Refresca la página pública. Si aún ves lo viejo, fuerza recarga
              con <span className="font-medium">Ctrl/Cmd + Shift + R</span>.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
