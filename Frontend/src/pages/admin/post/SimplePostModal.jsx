import React, { useEffect, useMemo, useState } from "react";
import postsService from "../../../services/postsService";
import { teamService } from "../../../services/teamService";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const emptyPost = () => ({
  title: "",
  info: "",
  text: "",
  links: [],
  comments: [],
  file: null,
  author: null,
});

// 👉 helper para tomar campos de team_members con distintos nombres
function pickMemberAuthor(m) {
  if (!m) return null;
  const id = m.id ?? m.ID ?? null;
  const name = m.nombre ?? m.name ?? m.display_name ?? "";
  const slug = m.slug ?? m.handle ?? "";
  const photo =
    m.photo_url ??
    m.foto_url ??
    m.avatar_url ??
    m.avatar ??
    m.foto ??
    null;
  return { id, name, slug, photo_url: photo || "" };
}

export function SimplePostModal({ open, onClose, initial, onSaved }) {
  const isEditing = Boolean(initial?.id);
  const [form, setForm] = useState(emptyPost());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMembersLoading(true);
    teamService
      .list({ per_page: 200 })
      .then((res) => {
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setMembers(rows);
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [open]);

  // init/cleanup modal
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title ?? "",
        info: initial.info ?? "",
        text: initial.text ?? "",
        links: Array.isArray(initial.links) ? initial.links : [],
        comments: Array.isArray(initial.comments) ? initial.comments : [],
        // ⚠️ el backend devuelve data.author con photo_url
        author: initial.author
          ? {
              id: initial.author.id ?? null,
              name: initial.author.name ?? "",
              slug: initial.author.slug ?? "",
              photo_url: initial.author.photo_url ?? "",
            }
          : null,
        file: null,
      });
    } else {
      setForm(emptyPost());
    }
    setError("");
  }, [open, initial]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const updateField = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));

  // links
  const addLink = () =>
    updateField("links", [
      ...(form.links || []),
      { label: "", url: "" },
    ]);
  const removeLink = (i) => {
    const next = [...(form.links || [])];
    next.splice(i, 1);
    updateField("links", next);
  };
  const updateLink = (i, key, val) => {
    const next = [...(form.links || [])];
    next[i] = { ...(next[i] || {}), [key]: val };
    updateField("links", next);
  };

  // comments
  const addComment = () =>
    updateField("comments", [
      ...(form.comments || []),
      {
        user: "",
        body: "",
        created_at: new Date().toISOString(),
        imageUrl: "",
        _memberId: "",
      },
    ]);
  const removeComment = (i) => {
    const next = [...(form.comments || [])];
    next.splice(i, 1);
    updateField("comments", next);
  };
  const updateComment = (i, key, val) => {
    const next = [...(form.comments || [])];
    next[i] = { ...(next[i] || {}), [key]: val };
    if (!next[i].created_at)
      next[i].created_at = new Date().toISOString();
    updateField("comments", next);
  };

  // preview del archivo si es imagen
  const [filePreview, setFilePreview] = useState(null);
  useEffect(() => {
    if (!form.file) {
      setFilePreview(null);
      return;
    }
    if (form.file && form.file.type?.startsWith?.("image/")) {
      const url = URL.createObjectURL(form.file);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview(null);
  }, [form.file]);

  // === Validación previa al submit ===
  function validateBeforeSubmit(payload) {
    const bad = (payload.comments || []).find(
      (c) => c?.body && !c?.user
    );
    if (bad)
      return "Si agregas texto en un comentario, también debes indicar el usuario.";
    if (!payload.title?.trim()) return "El título es obligatorio.";
    if (payload.author && !payload.author.name)
      return "El autor del post debe tener nombre.";
    return null;
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setSaving(true);
    setError("");
    try {
      const cleanComments = (form.comments || [])
        .filter((c) => c?.user || c?.body || c?.imageUrl)
        .map((c) => ({
          user: c.user?.trim() || "",
          body: c.body?.trim() || "",
          created_at:
            c.created_at || new Date().toISOString(),
          imageUrl: c.imageUrl?.trim() || "",
        }));

      // ⚠️ Construimos author con photo_url (no avatar_url)
      const authorPayload = form.author
        ? {
            id: form.author.id ?? null,
            name:
              form.author.nombre ||
              form.author.name ||
              "",
            slug: form.author.slug || "",
            photo_url:
              form.author.photo_url ||
              form.author.foto_url ||
              form.author.avatar_url ||
              "",
          }
        : null;

      const payload = {
        title: form.title,
        info: form.info,
        text: form.text,
        links: (form.links || []).filter((l) => l?.url),
        comments: cleanComments,
        file: form.file || null,
        author: authorPayload,
      };

      const vErr = validateBeforeSubmit(payload);
      if (vErr) {
        setError(vErr);
        setSaving(false);
        return;
      }

      const saved = isEditing
        ? await postsService.update(initial.id, payload)
        : await postsService.create(payload);

      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.message;
      const apiErrors = err?.response?.data?.errors;
      setError(
        apiMsg ||
          (apiErrors
            ? JSON.stringify(apiErrors)
            : err?.message) ||
          "Error al guardar"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !saving && onClose?.()}
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-2xl md:mx-auto max-h-[92svh] md:max-h-[80vh] overflow-y-auto rounded-t-2xl md:rounded-2xl card">
        <form
          onSubmit={handleSubmit}
          className="card-pad pt-0 md:pt-0"
        >
          {/* Header sticky */}
          <div className="sticky top-0 z-10 -mx-4 md:-mx-5 pt-4 md:pt-5 pb-3 px-4 md:px-5 border-b border-token bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold font-display">
              {isEditing ? "Editar post" : "Nuevo post"}
            </h3>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="btn btn-outline text-sm px-3 py-1.5"
              disabled={saving}
            >
              Cerrar
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {/* Autor del post */}
            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Autor del post
              </label>
              <div className="flex gap-2">
                <select
                  className="input"
                  value={form.author?.id ?? ""}
                  onChange={(e) => {
                    const m = members.find(
                      (x) =>
                        String(x.id) === e.target.value
                    );
                    updateField("author", pickMemberAuthor(m));
                  }}
                >
                  <option value="">
                    {membersLoading
                      ? "Cargando…"
                      : "— Seleccionar —"}
                  </option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre ||
                        m.name ||
                        `#${m.id}`}
                    </option>
                  ))}
                </select>
              </div>
              {form.author?.photo_url && (
                <div className="mt-2 flex items-center gap-2 text-xs text-soft">
                  <img
                    src={form.author.photo_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-token"
                  />
                  <span>{form.author.name}</span>
                </div>
              )}
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Título *
              </label>
              <input
                className="input"
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                required
              />
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Info
              </label>
              <textarea
                className="input"
                rows={2}
                value={form.info}
                onChange={(e) =>
                  updateField("info", e.target.value)
                }
              />
            </div>

            {/* Texto */}
            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Texto
              </label>
              <textarea
                className="input"
                rows={4}
                value={form.text}
                onChange={(e) =>
                  updateField("text", e.target.value)
                }
              />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-soft">
                  Links
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="text-xs link"
                >
                  Agregar link
                </button>
              </div>
              <div className="space-y-2">
                {(form.links || []).map((l, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      className="input"
                      placeholder="Etiqueta"
                      value={l?.label ?? ""}
                      onChange={(e) =>
                        updateLink(
                          i,
                          "label",
                          e.target.value
                        )
                      }
                    />
                    <input
                      className="input"
                      placeholder="https://..."
                      value={l?.url ?? ""}
                      onChange={(e) =>
                        updateLink(
                          i,
                          "url",
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="btn btn-outline text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comentarios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-soft">
                  Comentarios (JSON simple)
                </label>
                <button
                  type="button"
                  onClick={addComment}
                  className="text-xs link"
                >
                  Agregar comentario
                </button>
              </div>
              <div className="space-y-3">
                {(form.comments || []).map((c, i) => {
                  const requireUser =
                    !!c.body && !c.user;
                  return (
                    <div
                      key={i}
                      className={cx(
                        "card card-pad space-y-2",
                        requireUser &&
                          "border-destructive"
                      )}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Selector de usuario (team) + libre */}
                        <div className="flex gap-2">
                          <select
                            className="input"
                            value={c._memberId ?? ""}
                            onChange={(e) => {
                              const m = members.find(
                                (x) =>
                                  String(x.id) ===
                                  e.target.value
                              );
                              const picked =
                                pickMemberAuthor(m);
                              updateComment(
                                i,
                                "user",
                                picked?.name || ""
                              );
                              updateComment(
                                i,
                                "_memberId",
                                e.target.value
                              );
                            }}
                          >
                            <option value="">
                              {membersLoading
                                ? "Cargando…"
                                : "— Seleccionar de team —"}
                            </option>
                            {members.map((m) => (
                              <option
                                key={m.id}
                                value={m.id}
                              >
                                {m.nombre ||
                                  m.name ||
                                  `#${m.id}`}
                              </option>
                            ))}
                          </select>
                          <input
                            className={cx(
                              "input",
                              requireUser &&
                                "input-error"
                            )}
                            placeholder="o escribe el usuario"
                            value={c?.user ?? ""}
                            onChange={(e) =>
                              updateComment(
                                i,
                                "user",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <input
                          className="input"
                          placeholder="Imagen (URL opcional)"
                          value={c?.imageUrl ?? ""}
                          onChange={(e) =>
                            updateComment(
                              i,
                              "imageUrl",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <input
                        className="input"
                        placeholder="Comentario"
                        value={c?.body ?? ""}
                        onChange={(e) =>
                          updateComment(
                            i,
                            "body",
                            e.target.value
                          )
                        }
                      />
                      {requireUser && (
                        <p className="text-xs text-red-600">
                          Si escribes un comentario,
                          debes indicar el usuario.
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-soft">
                        <span>
                          Fecha:{" "}
                          {new Date(
                            c?.created_at ||
                              Date.now()
                          ).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeComment(i)
                          }
                          className="btn btn-outline text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Archivo del post */}
            <div className="space-y-1.5">
              <label className="block text-sm text-soft">
                Archivo (opcional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="input"
                onChange={(e) =>
                  updateField(
                    "file",
                    e.target.files?.[0] ?? null
                  )
                }
              />
              {filePreview && (
                <div className="mt-2">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-40 rounded-xl border border-token object-contain"
                  />
                </div>
              )}
              {initial?.attachments?.length ? (
                <p className="mt-1 text-xs text-soft">
                  Ya tiene{" "}
                  {
                    initial.attachments
                      .length
                  }{" "}
                  adjunto(s). Subir uno nuevo lo{" "}
                  <span className="font-semibold">
                    agregará
                  </span>
                  .
                </p>
              ) : null}
            </div>

            {/* Error */}
            {error && (
              <div className="card card-pad border-destructive bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Footer acciones */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onClose?.()}
                className="btn btn-outline"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={cx(
                  "btn btn-primary",
                  saving && "opacity-70"
                )}
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Crear"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
