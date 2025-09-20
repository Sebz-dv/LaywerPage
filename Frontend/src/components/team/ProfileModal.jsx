// ProfileEditor.jsx
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
        if (!aborted)
          setErr(e?.response?.data?.message || e.message || "Error");
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
    <form onSubmit={onSubmit} className="space-y-3">
      {err && (
        <div className="rounded border border-red-300 bg-red-50 text-red-800 px-3 py-2">
          {err}
        </div>
      )}

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <Field label="Idiomas (uno por línea o separados por coma)">
        <textarea
          value={idiomasStr}
          onChange={(e) => setIdiomasStr(e.target.value)}
          rows={2}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <Field label="Perfil">
        <textarea
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
          rows={5}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <Field label="Educación (uno por línea)">
        <textarea
          value={eduStr}
          onChange={(e) => setEduStr(e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <Field label="Experiencia (uno por línea)">
        <textarea
          value={expStr}
          onChange={(e) => setExpStr(e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <Field label="Reconocimientos (uno por línea)">
        <textarea
          value={recStr}
          onChange={(e) => setRecStr(e.target.value)}
          rows={3}
          className="w-full rounded-lg px-3 py-2 border bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium border
                     bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--border))/0.25]"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => onClose?.(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium border
                     bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs mb-1 text-[hsl(var(--fg))/0.7)]">
        {label}
      </label>
      {children}
    </div>
  );
}
