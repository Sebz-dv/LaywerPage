// src/pages/team/TeamMembersPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MembersTable } from "../../components/team/MembersTable.jsx";
import { MemberForm } from "../../components/team/MemberForm.jsx";
import ProfileEditor from "../../components/team/ProfileEditor.jsx";
import { teamService } from "../../services/teamService.js";
import { resolveAssetUrl } from "../../lib/origin"; // ✅ usar helper centralizado

const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>';

export default function TeamMembersPage() {
  // Data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(null);

  // Modal Perfil
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSlug, setProfileSlug] = useState(null);

  // Form & file/preview
  const emptyForm = useMemo(
    () => ({
      nombre: "",
      cargo: "",
      areas: [], // ← array JSON
      ciudad: "",
      tipo: "",
      tipo_otro: "", // ← para "otro"
      foto_url: "",
    }),
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const load = useCallback(async (abortSignal) => {
    try {
      setLoading(true);
      const res = await teamService.search({ perPage: 50, signal: abortSignal });
      const rows = Array.isArray(res) ? res : res?.data ?? [];
      setItems(rows);
      setError("");
    } catch (e) {
      setError(e?.message ?? "No se pudieron cargar los miembros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // Preview al seleccionar archivo
  const handleFile = useCallback((file) => {
    setFotoFile(file || null);
    if (file) setFotoPreview(URL.createObjectURL(file));
    else setFotoPreview(null);
  }, []);

  // Limpia objectURL cuando cambie o al desmontar
  useEffect(() => {
    return () => {
      if (fotoPreview && fotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  // Abrir crear
  const openCreate = useCallback(() => {
    setIsEditing(false);
    setCurrentSlug(null);
    setForm(emptyForm);
    setFotoFile(null);
    setFotoPreview(null);
    setModalOpen(true);
  }, [emptyForm]);

  // Abrir editar
  const openEdit = useCallback((m) => {
    setIsEditing(true);
    setCurrentSlug(m.slug);
    setForm({
      nombre: m.nombre ?? "",
      cargo: m.cargo ?? "",
      // compatibilidad: si aún tienes 'area' string en datos viejos
      areas: Array.isArray(m.areas)
        ? m.areas
        : m.areas
        ? [m.areas]
        : m.area
        ? [m.area]
        : [],
      ciudad: m.ciudad ?? "",
      tipo: m.tipo ?? "",
      tipo_otro: "",
      foto_url: m.foto_url ?? "",
    });
    setFotoFile(null);
    setFotoPreview(m.foto_url ? resolveAssetUrl(m.foto_url) : null);
    setModalOpen(true);
  }, []);

  // Cerrar modal CRUD y limpiar
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setFotoFile(null);
      setFotoPreview(null);
      setIsEditing(false);
      setCurrentSlug(null);
    }, 100);
  }, [emptyForm]);

  // Submit (crear/editar)
  const handleSubmit = useCallback(async () => {
    try {
      const payload = { ...form };

      // Garantiza array limpio para 'areas'
      payload.areas = Array.isArray(payload.areas)
        ? payload.areas.filter(Boolean)
        : payload.areas
        ? [payload.areas]
        : [];

      // Manejo de 'otro'
      if (payload.tipo !== "otro") {
        delete payload.tipo_otro;
      }

      // Archivo
      if (fotoFile) payload.foto = fotoFile; // key que espera el backend

      if (isEditing && currentSlug) {
        const saved = await teamService.update(currentSlug, payload);
        setItems((prev) => prev.map((it) => (it.slug === currentSlug ? saved : it)));
      } else {
        const saved = await teamService.create(payload);
        setItems((prev) => [saved, ...prev]);
      }
      closeModal();
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "No se pudo guardar");
    }
  }, [form, fotoFile, isEditing, currentSlug, closeModal]);

  // Eliminar
  const handleDelete = useCallback(async (m) => {
    if (!confirm(`¿Eliminar a ${m.nombre}? Esta acción es irreversible.`)) return;
    try {
      await teamService.remove(m.slug);
      setItems((prev) => prev.filter((it) => it.slug !== m.slug));
    } catch (e) {
      alert(e?.response?.data?.message ?? e?.message ?? "No se pudo eliminar");
    }
  }, []);

  // Perfil
  const openProfile = useCallback((slug) => {
    setProfileSlug(slug);
    setProfileOpen(true);
  }, []);
  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    setTimeout(() => setProfileSlug(null), 100);
  }, []);

  // Tipos del selector (incluye "Otro…")
  const extraTipoGroups = useMemo(
    () => [
      {
        label: "Tipo de Miembro",
        options: [
          { value: "", label: "— Selecciona un tipo —" },
          { value: "juridico", label: "Jurídico" },
          { value: "no-juridico", label: "No Jurídico" },
          { value: "otro", label: "Otro…" },
        ],
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Header + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Equipo</h1>
          <p className="text-sm text-muted">Gestiona miembros, perfiles y fotos.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          Nuevo miembro
        </button>
      </div>

      {/* Tabla */}
      <div className="card card-pad">
        <MembersTable
          items={items}
          loading={loading}
          error={error}
          onEdit={openEdit}
          onDelete={handleDelete}
          onOpenProfile={openProfile}
          resolveUrl={resolveAssetUrl} // ✅ usa helper centralizado (evita localhost)
          fallbackAvatar={FALLBACK_AVATAR}
        />
      </div>

      {/* Modal CRUD */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        ariaLabel={isEditing ? "Editar miembro" : "Crear miembro"}
      >
        <MemberForm
          form={form}
          setForm={setForm}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          onFile={handleFile}
          fotoPreview={fotoPreview}
          FALLBACK_AVATAR={FALLBACK_AVATAR}
          extraTipoGroups={extraTipoGroups}
        />
      </Modal>

      {/* Modal Perfil */}
      <Modal open={profileOpen} onClose={closeProfile} ariaLabel="Editar perfil">
        {profileSlug && <ProfileEditor slug={profileSlug} />}
      </Modal>
    </div>
  );
}

/** Modal accesible estilizado con tus tokens */
function Modal({ open, onClose, ariaLabel, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* Overlay con tokens */}
      <div
        className="absolute inset-0 bg-[hsl(var(--fg)/0.45)] backdrop-blur-[2px]"
        onMouseDown={onClose}
      />

      {/* Contenido */}
      <div
        className="relative z-10 w-full max-w-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="card">
          {/* Header del modal */}
          <div className="flex items-center justify-between card-pad pb-0">
            <h2 className="text-base font-semibold">{ariaLabel}</h2>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline px-2 py-1"
              aria-label="Cerrar modal"
              title="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="card-pad pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
