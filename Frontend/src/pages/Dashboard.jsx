// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import usePageReady from "../hooks/usePageReady.js";
import { teamService } from "../services/teamService";
import ProfileModal from "../components/team/ProfileModal.jsx";
import { MemberForm } from "../components/team/MemberForm";
import { MembersTable } from "../components/team/MembersTable";
import BrowserTabs from "../components/navigation/BrowserTabs.jsx";
import CarouselManager from "../components/images/CarouselManager.jsx";
import InfoBlocksManager from "../components/info/InfoBlocksManager.jsx";
import SiteSettings from "../components/settings/SiteSettings.jsx";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

const EMPTY = { nombre:"", cargo:"", area:"", ciudad:"", tipo:"juridico", foto_url:"" };

export default function Dashboard() {
  const { user } = useAuth();
  const { className: pageClass } = usePageReady();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editingSlug, setEditingSlug] = useState(null);
  const [search, setSearch] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [profileFor, setProfileFor] = useState(null);

  const perPage = 20;

  const load = useCallback(async (query = "") => {
    setLoading(true); setError("");
    try {
      const { data } = await teamService.search({ nombre: query, perPage, sort: "latest" });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Error");
    } finally { setLoading(false); }
  }, [perPage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview); }, [fotoPreview]);

  const revokePreview = () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview); };
  const onFile = (file) => {
    revokePreview();
    setFotoFile(file || null);
    setFotoPreview(file ? URL.createObjectURL(file) : null);
  };
  const resetForm = () => {
    setForm(EMPTY);
    setEditingSlug(null);
    revokePreview();
    setFotoFile(null);
    setFotoPreview(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fields = { ...form };
      delete fields.foto_url;
      const payload = { ...fields, ...(fotoFile ? { foto: fotoFile } : {}) };

      if (editingSlug) {
        const { data: updated } = await teamService.update(editingSlug, payload);
        setItems((prev) => prev.map((it) => (it.slug === editingSlug ? updated : it)));
      } else {
        const { data: created } = await teamService.create(payload);
        if (!search || created.nombre.toLowerCase().includes(search.toLowerCase())) {
          setItems((prev) => [created, ...prev]);
        }
      }
      resetForm();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Error guardando");
    } finally { setLoading(false); }
  };

  const onEdit = (m) => {
    setEditingSlug(m.slug);
    setForm({
      nombre: m.nombre ?? "",
      cargo: m.cargo ?? "",
      area: m.area ?? "",
      ciudad: m.ciudad ?? "",
      tipo: m.tipo ?? "juridico",
      foto_url: m.foto_url ?? "",
    });
    onFile(null);
    if (m.foto_url) {
      const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
      setFotoPreview(m.foto_url.startsWith("http") ? m.foto_url : API_ORIGIN + m.foto_url);
    }
    document.getElementById("crud-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onDelete = async (m) => {
    if (!confirm(`¿Eliminar a ${m.nombre}?`)) return;
    try {
      setLoading(true);
      await teamService.remove(m.slug);
      if (editingSlug === m.slug) resetForm();
      setItems((prev) => prev.filter((it) => it.slug !== m.slug));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Error eliminando");
    } finally { setLoading(false); }
  };

  // --- Tabs (solo tabla/otros módulos dentro) ---
  const MiembrosListTab = useMemo(() => (
    <section className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6" key="miembros-list">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <h2 className="font-semibold">Miembros</h2>
        <div className="sm:ml-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full sm:w-72 rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] outline-none"
          />
          <button
            onClick={() => load(search)}
            className="ml-2 rounded-lg px-3 py-2 text-sm font-medium border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
          >
            Buscar
          </button>
        </div>
      </div>
      <MembersTable
        items={items}
        loading={loading}
        error={error}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenProfile={(slug) => setProfileFor(slug)}
      />
      {profileFor && (
        <ProfileModal slug={profileFor} onClose={() => setProfileFor(null)} />
      )}
    </section>
  ), [items, loading, error, search, profileFor]);

  const CarruselTab = useMemo(() => (
    <section className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6" key="banner">
      <CarouselManager />
    </section>
  ), []);

  const InfoTab = useMemo(() => (
    <section className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6" key="empresa">
      <InfoBlocksManager />
    </section>
  ), []);
  const SettingTab = useMemo(() => (
    <section className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6" key="empresa">
      <SiteSettings />
    </section>
  ), []);

  const tabs = useMemo(() => ([
    { id: "miembros", label: "Miembros", element: MiembrosListTab },
    { id: "banner", label: "Imagenes del Banner", element: CarruselTab },
    { id: "empresa", label: "Empresa", element: InfoTab },
    { id: "settings", label: "Configuracion de Empresa", element: SettingTab },
  ]), [MiembrosListTab, CarruselTab, InfoTab, SettingTab]);

  return (
    <div className={cx("p-6 space-y-6", pageClass)}>
      <header>
        <h1 className="text-2xl font-semibold">Hola, {user?.name} 👋</h1>
        <p className="text-[hsl(var(--fg))/0.8]">Estás dentro. Email: {user?.email}</p>
      </header>

      {/* 🔒 Form SIEMPRE montado */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MemberForm
            key="member-form-sticky"
            form={form}
            setForm={setForm}
            isEditing={Boolean(editingSlug)}
            onSubmit={onSubmit}
            onCancel={resetForm}
            onFile={onFile}
            fotoPreview={fotoPreview}
            FALLBACK_AVATAR={'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>'}
            extraTipoGroups={[
              { label: "Tipo de miembro", options: [
                { label: "Jurídico", value: "juridico" },
                { label: "No Jurídico", value: "no-juridico" },
              ]},
              { label: "Tipo de navegador", options: [
                { label: "Chrome", value: "navegador:chrome" },
                { label: "Firefox", value: "navegador:firefox" },
                { label: "Edge", value: "navegador:edge" },
                { label: "Safari", value: "navegador:safari" },
              ]},
            ]}
          />
        </div>

        {/* Paneles en 2 columnas */}
        <div className="lg:col-span-2">
          <BrowserTabs tabs={tabs} storageKey="dashboard:tabs" />
        </div>
      </section>
    </div>
  );
}
