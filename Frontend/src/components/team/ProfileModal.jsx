// src/components/team/ProfileEditor.jsx
import React, { useEffect, useState } from "react";
import { teamProfileService } from "../../services/teamProfileService";

export default function ProfileEditor({ slug, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [idiomasStr, setIdiomasStr] = useState("");
  const [perfil, setPerfil] = useState("");
  const [eduStr, setEduStr] = useState("");
  const [expStr, setExpStr] = useState("");
  const [recStr, setRecStr] = useState("");

  const parseList = (str) =>
    (str || "")
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

  const joinList = (arr = []) => (Array.isArray(arr) ? arr.join("\n") : "");

  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await teamProfileService.get(slug);
        if (!aborted && data) {
          setEmail(data.email ?? "");
          setIdiomasStr(joinList(data.idiomas));
          setPerfil(data.perfil ?? "");
          setEduStr(joinList(data.educacion));
          setExpStr(joinList(data.experiencia));
          setRecStr(joinList(data.reconocimientos));
        }
      } catch (e) {
        if (!aborted) setErr(e?.response?.data?.message || e.message || "Error");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [slug]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr("");
      const payload = {
        email: email || null,
        idiomas: parseList(idiomasStr),
        perfil: perfil || null,
        educacion: parseList(eduStr),
        experiencia: parseList(expStr),
        reconocimientos: parseList(recStr),
      };
      await teamProfileService.save(slug, payload);
      onClose?.(true);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Error guardando");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor scrollable para no salirse del modal/pestaña
    <div className="max-h-[min(70vh,600px)] overflow-y-auto pr-1">
      <form onSubmit={onSubmit} className="space-y-4">
        {err && (
          <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))/0.08] text-[hsl(var(--destructive))] px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="correo@empresa.com"
          />
        </Field>

        <Field
          label="Idiomas"
          hint="Uno por línea o separados por coma"
        >
          <textarea
            value={idiomasStr}
            onChange={(e) => setIdiomasStr(e.target.value)}
            rows={2}
            className="input min-h-[72px]"
            placeholder={"Español\nInglés\nFrancés"}
          />
        </Field>

        <Field label="Perfil">
          <textarea
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            rows={5}
            className="input min-h-[120px]"
            placeholder="Resumen profesional, enfoque, logros clave…"
          />
        </Field>

        <Field
          label="Educación"
          hint="Uno por línea"
        >
          <textarea
            value={eduStr}
            onChange={(e) => setEduStr(e.target.value)}
            rows={3}
            className="input min-h-[96px]"
            placeholder={"Abogado, Universidad X (2015)\nMaestría en…"}
          />
        </Field>

        <Field
          label="Experiencia"
          hint="Uno por línea"
        >
          <textarea
            value={expStr}
            onChange={(e) => setExpStr(e.target.value)}
            rows={3}
            className="input min-h-[96px]"
            placeholder={"Firma A — Asociado\nFirma B — Senior…"}
          />
        </Field>

        <Field
          label="Reconocimientos"
          hint="Uno por línea"
        >
          <textarea
            value={recStr}
            onChange={(e) => setRecStr(e.target.value)}
            rows={3}
            className="input min-h-[96px]"
            placeholder={"Chambers 2024 — Rising Star\nBest Lawyers…"}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => onClose?.(false)}
            className="btn btn-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium">
        {label}
      </label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}
