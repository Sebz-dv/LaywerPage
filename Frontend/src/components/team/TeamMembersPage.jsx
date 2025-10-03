// src/pages/team/TeamMembersPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MembersTable } from "../../components/team/MembersTable.jsx";
import { MemberForm } from "../../components/team/MemberForm.jsx";
import ProfileEditor from "../../components/team/ProfileEditor.jsx";
import { teamService } from "../../services/teamService.js";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const resolveUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_ORIGIN}${u}`);
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
      area: "",
      ciudad: "",
      tipo: "",
      foto_url: "",
    }),
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  // Carga inicial
  const load = useCallback(async (abortSignal) => {
    try {
      setLoading(true);
      const res = await teamService.search({ perPage: 50, signal: abortSignal });
      // Soporta {data: []} y [] plano
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
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
    } else {
      setFotoPreview(null);
    }
  }, []);

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
      area: m.area ?? "",
      ciudad: m.ciudad ?? "",
      tipo: m.tipo ?? "",
      foto_url: m.foto_url ?? "",
    });
    setFotoFile(null);
    setFotoPreview(m.foto_url ? resolveUrl(m.foto_url) : null);
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
      // el backend espera key 'foto' para el File
      if (fotoFile) payload.foto = fotoFile;

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

  // Abrir/Cerrar Perfil
  const openProfile = useCallback((slug) => {
    setProfileSlug(slug);
    setProfileOpen(true);
  }, []);
  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    setTimeout(() => setProfileSlug(null), 100);
  }, []);

  // Tipos del selector
  const extraTipoGroups = useMemo(
    () => [
      {
        label: "Tipo de Miembro",
        options: [
          { value: "", label: "— Selecciona un tipo —" }, // placeholder
          { value: "juridico", label: "Jurídico" },
          { value: "no-juridico", label: "No Jurídico" },
        ],
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Header + CTA */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Equipo</h1>
        <button
          onClick={openCreate}
          className="rounded-lg px-4 py-2 text-sm font-medium border bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25] hover:bg-[hsl(var(--primary))/0.92]"
        >
          Nuevo miembro
        </button>
      </div>

      {/* Tabla */}
      <MembersTable
        items={items}
        loading={loading}
        error={error}
        onEdit={openEdit}
        onDelete={handleDelete}
        onOpenProfile={openProfile}
      />

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
        {profileSlug && (
          <ProfileEditor
            slug={profileSlug} 
          />
        )}
      </Modal>
    </div>
  );
}

/** Modal accesible, sin dependencias. Escape cierra.
 *  Overlay usa onMouseDown para evitar cierre accidental por click fantasma. */
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
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onMouseDown={onClose}
      />
      {/* Contenido */}
      <div
        className="relative z-10 w-full max-w-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] shadow-xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md px-2 py-1 text-sm border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            aria-label="Cerrar modal"
            title="Cerrar"
          >
            ×
          </button>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
