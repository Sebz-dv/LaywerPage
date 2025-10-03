// src/pages/admin/SiteSettings.jsx
import React, { useEffect, useState } from "react";
import { settingsService } from "../../services/settingsService.js";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function SocialLinksEditor({ value = [], onChange }) {
  const add = () =>
    onChange([...(value || []), { platform: "", url: "", handle: "" }]);
  const del = (i) => onChange(value.filter((_, x) => x !== i));
  const set = (i, k, v) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Redes sociales</h4>
        <button
          type="button"
          onClick={add}
          className="text-sm px-3 py-1.5 rounded-lg border"
        >
          + Agregar
        </button>
      </div>
      {value.length === 0 && (
        <p className="text-sm text-neutral-500">Sin redes aún.</p>
      )}
      {value.map((r, i) => (
        <div
          key={i}
          className="grid sm:grid-cols-3 gap-3 border rounded-lg p-3"
        >
          <input
            className="input"
            placeholder="Plataforma (Facebook, X, Instagram...)"
            value={r.platform}
            onChange={(e) => set(i, "platform", e.target.value)}
          />
          <input
            className="input col-span-2"
            placeholder="URL completa"
            value={r.url}
            onChange={(e) => set(i, "url", e.target.value)}
          />
          <input
            className="input sm:col-span-2"
            placeholder="@usuario / handle (opcional)"
            value={r.handle || ""}
            onChange={(e) => set(i, "handle", e.target.value)}
          />
          <button type="button" onClick={() => del(i)} className="btn-danger">
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

function FooterBlocksEditor({ value = [], onChange }) {
  const add = () => onChange([...(value || []), { title: "", html: "" }]);
  const del = (i) => onChange(value.filter((_, x) => x !== i));
  const set = (i, k, v) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Bloques del footer</h4>
        <button
          type="button"
          onClick={add}
          className="text-sm px-3 py-1.5 rounded-lg border"
        >
          + Agregar bloque
        </button>
      </div>
      {value.length === 0 && (
        <p className="text-sm text-neutral-500">Sin bloques.</p>
      )}
      {value.map((b, i) => (
        <div key={i} className="space-y-2 border rounded-lg p-3">
          <input
            className="input"
            placeholder="Título"
            value={b.title}
            onChange={(e) => set(i, "title", e.target.value)}
          />
          <textarea
            className="input min-h-[100px]"
            placeholder="HTML/Texto"
            value={b.html || ""}
            onChange={(e) => set(i, "html", e.target.value)}
          />
          <button type="button" onClick={() => del(i)} className="btn-danger">
            Eliminar bloque
          </button>
        </div>
      ))}
    </div>
  );
}

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState(null);
  const [form, setForm] = useState({
    site_name: "",
    email: "",
    phone: "",
    address: "",
    social_links: [],
    footer_blocks: [],
    logo: null,
    logo_url: "",
  });

  useEffect(() => {
    (async () => {
      const s = await settingsService.get();
      setForm((f) => ({
        ...f,
        ...s,
        // asegurar arrays
        social_links: Array.isArray(s.social_links) ? s.social_links : [],
        footer_blocks: Array.isArray(s.footer_blocks) ? s.footer_blocks : [],
        logo: null,
      }));
      setLoading(false);
    })();
  }, []);

  const onFile = (file) => setForm((f) => ({ ...f, logo: file }));
  const onSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrors(null);
    try {
      const payload = { ...form };
      delete payload.logo_url; // no enviar
      const saved = await settingsService.save(payload);
      setForm((f) => ({
        ...f,
        ...saved,
        logo: null,
        social_links: saved.social_links ?? [],
        footer_blocks: saved.footer_blocks ?? [],
      }));
    } catch (err) {
      const data = err?.response?.data;
      setErrors(
        data?.errors || { general: [data?.message || "Error al guardar"] }
      );
      console.error("422 details:", data);
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = async () => {
    await settingsService.deleteLogo();
    setForm((f) => ({ ...f, logo: null, logo_url: "", logo_path: null }));
  };

  if (loading) return <div className="p-6">Cargando configuración…</div>;

  return (
    <form onSubmit={onSave} className="mx-auto max-w-5xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Configuración del sitio
        </h1>
        <p className="text-sm text-neutral-600">
          Logo, datos de contacto, redes y footer.
        </p>
      </header>

      <section className="grid md:grid-cols-[280px,1fr] gap-6">
        {/* Logo */}
        <div className="space-y-3">
          <div className="border rounded-2xl p-4">
            <h3 className="font-medium mb-3">Logo</h3>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-xl border bg-white flex items-center justify-center overflow-hidden">
                {form.logo ? (
                  <img
                    src={URL.createObjectURL(form.logo)}
                    alt="preview"
                    className="object-contain w-full h-full"
                  />
                ) : form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="logo"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-neutral-400">Sin logo</span>
                )}
              </div>
              <div className="space-x-2">
                <label className="inline-flex items-center px-3 py-1.5 rounded-lg border cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  Subir archivo
                </label>
                {(form.logo_url || form.logo) && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="btn-danger"
                  >
                    Quitar logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Datos básicos */}
        <div className="border rounded-2xl p-4 space-y-3">
          <h3 className="font-medium">Datos de la empresa</h3>
          <input
            className="input"
            placeholder="Nombre del sitio / empresa"
            value={form.site_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, site_name: e.target.value }))
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Email de contacto"
              value={form.email || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Teléfono"
              value={form.phone || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <input
            className="input"
            placeholder="Dirección"
            value={form.address || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-4">
          <SocialLinksEditor
            value={form.social_links}
            onChange={(v) => setForm((f) => ({ ...f, social_links: v }))}
          />
        </div>
        <div className="border rounded-2xl p-4">
          <FooterBlocksEditor
            value={form.footer_blocks}
            onChange={(v) => setForm((f) => ({ ...f, footer_blocks: v }))}
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        {errors && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([field, msgs]) =>
                (msgs || []).map((m, i) => <li key={field + i}>{m}</li>)
              )}
            </ul>
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className={cx(
            "px-4 py-2 rounded-lg text-white",
            saving ? "bg-neutral-400" : "bg-black hover:opacity-90"
          )}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
