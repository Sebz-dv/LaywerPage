// src/pages/admin/MediaSlotsPage.jsx
"use client";

import React, { useEffect, useState } from "react";
import { mediaService } from "../../../services/mediaService";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

// Slots base que quieres tener siempre
const BASE_SLOT_CONFIG = [
  {
    key: "fundadores_hero",
    label: "Fundadores – Hero",
    description:
      "Imagen principal para la sección de fundadores. Refuerza la identidad del despacho.",
    hint: "Recomendado: 1920x1080 (16:9), formato JPG/WEBP, enfoque en las personas.",
  },
  {
    key: "team_hero",
    label: "Hero – Equipo",
    description:
      "Imagen de fondo para el hero de la sección Equipo / Talento humano.",
    hint: "Recomendado: 1920x1080, JPG/WEBP, equipo en contexto profesional, sin texto incrustado.",
  },
  {
    key: "about_hero",
    label: "Hero – Sobre Nosotros",
    description:
      "Imagen de fondo para el hero de la página 'Sobre Nosotros'. Marca el tono institucional.",
    hint: "Formato horizontal, buen contraste con el texto, evitar elementos muy recargados.",
  },
  {
    key: "about_hero_persons",
    label: "Equipo – Sobre Nosotros",
    description:
      "Imagen destacada del equipo para la sección 'Quiénes somos' / 'Sobre Nosotros'.",
    hint: "Fotografía de equipo, nítida y luminosa. Evitar texto dentro de la imagen.",
  },
  {
    key: "services_hero",
    label: "Hero – Servicios",
    description:
      "Imagen de fondo para el hero donde se presentan los servicios jurídicos.",
    hint: "Formato horizontal, 1920x1080, temática institucional o corporativa, sin texto.",
  },
  {
    key: "contact_services",
    label: "Contacto – Servicios",
    description:
      "Imagen de apoyo visual para la sección de contacto relacionada con servicios.",
    hint: "Imagen cercana y profesional (reuniones, trabajo en equipo), sin textos incrustados.",
  },
  {
    key: "team_talent",
    label: "Equipo de Trabajo – Listado",
    description:
      "Imagen de fondo para la cabecera de la página de talento / listado de equipo.",
    hint: "Fotografía de equipo o ambiente de trabajo, tonos coherentes con la marca.",
  },
  {
    key: "areas_hero",
    label: "Hero – Áreas de práctica",
    description:
      "Imagen principal para la página de Áreas de práctica o servicios especializados.",
    hint: "Imagen conceptual (justicia, instituciones, ciudad, etc.), alto contraste y sin texto.",
  },
  {
    key: "publication_hero",
    label: "Hero – Publicaciones jurídicas",
    description:
      "Imagen de fondo para la cabecera de la página de Publicaciones / artículos jurídicos.",
    hint: "Escena de estudio, lectura o análisis jurídico. Limpia, sin texto en la imagen.",
  },
  {
    key: "blog_hero",
    label: "Hero – Blog / Notas",
    description: "Imagen de fondo para el blog público de notas y comunicados.",
    hint: "Imagen ligera y versátil, que funcione bien con diferentes titulares encima.",
  },
  {
    key: "contact_hero",
    label: "Hero – Contáctenos",
    description:
      "Imagen principal para la página de contacto. Debe transmitir cercanía y confianza.",
    hint: "Recomendado: 1920x1080, encuentro con clientes o equipo en reunión, sin texto incrustado.",
  },
];

const initialSlotState = {
  loading: false,
  saving: false,
  url: null,
  alt: "",
  file: null,
  error: null,
  success: null,
};

export default function MediaSlotsPage() {
  const [slotDefs, setSlotDefs] = useState(BASE_SLOT_CONFIG);
  const [slots, setSlots] = useState({});
  const [globalError, setGlobalError] = useState(null);

  // Estado para crear nuevos slots
  const [showNewSlot, setShowNewSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    key: "",
    label: "",
    description: "",
    hint: "",
  });

  // Inicializar estados base + cargar sus datos
  useEffect(() => {
    BASE_SLOT_CONFIG.forEach((cfg) => {
      setSlots((prev) => ({
        ...prev,
        [cfg.key]: prev[cfg.key] ?? { ...initialSlotState },
      }));
      fetchSlot(cfg.key);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSlotState = (key, patch) => {
    setSlots((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? initialSlotState), ...patch },
    }));
  };

  const fetchSlot = async (key) => {
    updateSlotState(key, { loading: true, error: null, success: null });
    try {
      const data = await mediaService.getByKey(key);
      updateSlotState(key, {
        loading: false,
        url: data?.url || null,
        alt: data?.alt || "",
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        updateSlotState(key, { loading: false, url: null, alt: "" });
      } else {
        console.error(`Error cargando slot ${key}`, err);
        updateSlotState(key, {
          loading: false,
          error: "No se pudo cargar este slot.",
        });
      }
    }
  };

  const handleFileChange = (key, file) => {
    updateSlotState(key, {
      file: file ?? null,
      error: null,
      success: null,
    });
  };

  const handleAltChange = (key, alt) => {
    updateSlotState(key, { alt, error: null, success: null });
  };

  const handleSave = async (key) => {
    const slot = slots[key];
    if (!slot?.file) {
      updateSlotState(key, {
        error: "Selecciona una imagen antes de guardar.",
      });
      return;
    }

    updateSlotState(key, { saving: true, error: null, success: null });

    try {
      const data = await mediaService.uploadByKey(key, slot.file, slot.alt);
      updateSlotState(key, {
        saving: false,
        file: null,
        url: data?.url || slot.url,
        alt: data?.alt || slot.alt,
        success: "Imagen actualizada correctamente.",
      });
    } catch (err) {
      console.error(`Error guardando slot ${key}`, err);
      let msg = "Error guardando la imagen.";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      updateSlotState(key, {
        saving: false,
        error: msg,
        success: null,
      });
    }
  };

  /* ================= CREAR NUEVO SLOT ================= */

  const handleNewSlotChange = (field, value) => {
    if (field === "key") {
      // normalizar key tipo slug
      value = value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 60);
    }
    setNewSlot((prev) => ({ ...prev, [field]: value }));
    setGlobalError(null);
  };

  const handleCreateSlot = (e) => {
    e.preventDefault();
    setGlobalError(null);

    const key = newSlot.key.trim();
    const label = newSlot.label.trim();

    if (!key || !label) {
      setGlobalError("La clave (key) y el título son obligatorios.");
      return;
    }

    const exists = slotDefs.some((s) => s.key === key);
    if (exists) {
      setGlobalError("Ya existe un slot con esa clave.");
      return;
    }

    const newDef = {
      key,
      label,
      description: newSlot.description.trim(),
      hint: newSlot.hint.trim(),
    };

    setSlotDefs((prev) => [...prev, newDef]);
    setSlots((prev) => ({
      ...prev,
      [key]: prev[key] ?? { ...initialSlotState },
    }));

    // cargar si ya hubiera algo configurado en el back con esa key
    fetchSlot(key);

    // limpiar formulario
    setNewSlot({
      key: "",
      label: "",
      description: "",
      hint: "",
    });
    setShowNewSlot(false);
  };

  return (
    <div className="min-h-screen bg-app text-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Encabezado */}
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary font-display">
              Gestión de Imágenes
            </h1>
            <p className="mt-2 text-sm text-muted max-w-2xl font-subtitle">
              Administra las imágenes clave del sitio asignándolas a cada
              sección. Cada <span className="badge badge-accent">slot</span>{" "}
              representa un espacio visual específico (hero, fondo de sección,
              etc.).
            </p>
          </div>

          {/* <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowNewSlot((v) => !v)}
              className={cx(
                "btn btn-accent font-subtitle",
                "shadow-sm hover:-translate-y-[1px] transition-transform"
              )}
            >
              {showNewSlot ? "Cerrar formulario" : "Nuevo slot"}
            </button>
          </div> */}
        </header>

        {/* Formulario para crear nuevos slots */}
        {showNewSlot && (
          <section className="mb-8 card card-pad">
            <form
              onSubmit={handleCreateSlot}
              className="space-y-4 font-subtitle"
            >
              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-soft mb-1">
                    Clave del slot (key)
                  </label>
                  <input
                    type="text"
                    value={newSlot.key}
                    onChange={(e) => handleNewSlotChange("key", e.target.value)}
                    className="input text-sm"
                    placeholder="Ej: practice_litigios, footer_banner, etc."
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Solo minúsculas, números y guion bajo. Se usará en el back
                    como{" "}
                    <code className="font-mono">media-slots/&lt;key&gt;</code>.
                  </p>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-soft mb-1">
                    Título visible en el panel
                  </label>
                  <input
                    type="text"
                    value={newSlot.label}
                    onChange={(e) =>
                      handleNewSlotChange("label", e.target.value)
                    }
                    className="input text-sm"
                    placeholder="Ej: Hero – Práctica de Litigios"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-soft mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={newSlot.description}
                    onChange={(e) =>
                      handleNewSlotChange("description", e.target.value)
                    }
                    className="input text-sm min-h-[70px]"
                    placeholder="Breve explicación de dónde se usa esta imagen."
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-soft mb-1">
                    Hint / recomendaciones (opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={newSlot.hint}
                    onChange={(e) =>
                      handleNewSlotChange("hint", e.target.value)
                    }
                    className="input text-sm min-h-[70px]"
                    placeholder="Resolución sugerida, proporción, tipo de imagen, etc."
                  />
                </div>
              </div>

              {globalError && (
                <p className="text-[11px] text-red-500 bg-red-50/80 border border-red-200 rounded-md px-3 py-2">
                  {globalError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSlot(false);
                    setGlobalError(null);
                  }}
                  className="btn btn-outline text-xs font-subtitle"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-subtitle"
                >
                  Crear slot
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Lista de slots */}
        <div className="grid gap-6 md:grid-cols-2">
          {slotDefs.map((cfg) => {
            const slot = slots[cfg.key] ?? initialSlotState;
            const loading = slot.loading;
            const saving = slot.saving;

            return (
              <section key={cfg.key} className="card card-pad space-y-4">
                {/* Encabezado del slot */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-primary font-display">
                      {cfg.label}
                    </h2>
                    {cfg.description && (
                      <p className="mt-1 text-xs text-muted font-subtitle">
                        {cfg.description}
                      </p>
                    )}
                    {cfg.hint && (
                      <p className="mt-1 text-[11px] text-soft italic font-subtitle">
                        {cfg.hint}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-primary font-mono uppercase tracking-[0.18em] text-[10px]">
                    {cfg.key}
                  </span>
                </div>

                {/* Cuerpo: preview + formulario */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Preview */}
                  <div className="w-full sm:w-1/2">
                    <p className="text-[11px] font-semibold text-soft mb-1 font-subtitle">
                      Imagen actual
                    </p>
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted border border-token flex items-center justify-center">
                      {loading ? (
                        <span className="text-xs text-muted font-subtitle">
                          Cargando...
                        </span>
                      ) : slot.url ? (
                        <img
                          src={slot.url}
                          alt={slot.alt || cfg.label}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[11px] text-muted text-center px-3 font-subtitle">
                          No hay imagen configurada para este slot.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Formulario */}
                  <div className="w-full sm:w-1/2 flex flex-col gap-3 font-subtitle">
                    <div>
                      <label className="block text-[11px] font-semibold text-soft mb-1">
                        Nueva imagen
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(cfg.key, e.target.files?.[0])
                        }
                        className={cx(
                          "input text-[11px] cursor-pointer",
                          "file:mr-3 file:rounded-l-md file:border-0",
                          "file:bg-muted file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-soft",
                          "hover:file:bg-card"
                        )}
                      />
                      {slot.file && (
                        <p className="mt-1 text-[11px] text-success">
                          Archivo seleccionado:{" "}
                          <span className="font-mono">{slot.file.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-soft mb-1">
                        Texto alternativo (alt)
                      </label>
                      <input
                        type="text"
                        value={slot.alt ?? ""}
                        onChange={(e) =>
                          handleAltChange(cfg.key, e.target.value)
                        }
                        className="input text-[12px]"
                        placeholder="Ej: Equipo de abogados en sala de reuniones"
                      />
                    </div>

                    {/* Mensajes de estado */}
                    {slot.error && (
                      <p className="text-[11px] text-red-500 bg-red-50/80 border border-red-200 rounded px-2 py-1">
                        {slot.error}
                      </p>
                    )}
                    {slot.success && (
                      <p className="text-[11px] text-success bg-emerald-50/80 border border-emerald-200 rounded px-2 py-1">
                        {slot.success}
                      </p>
                    )}

                    <div className="mt-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => fetchSlot(cfg.key)}
                        className="btn btn-outline text-[11px]"
                      >
                        Recargar
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSave(cfg.key)}
                        className="btn btn-primary text-[11px]"
                      >
                        {saving ? "Guardando..." : "Guardar imagen"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
