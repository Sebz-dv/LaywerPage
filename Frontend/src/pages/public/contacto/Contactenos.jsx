// src/pages/public/contacto/Contactenos.jsx
import React, { useEffect, useMemo, useState, useId } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { practiceAreasService } from "../../../services/practiceAreasService";
import { sendContact } from "../../../services/contactService";
import { settingsService } from "../../../services/settingsService";

// ⬇️ imagen del hero
import hero from "../../../assets/about/hero.jpg";

/* ======== UI base ======== */
const inputBase =
  "mt-1 block w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2 text-foreground shadow-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60";
const labelBase = "text-sm font-medium text-foreground";
const errorText = "mt-1 text-xs text-red-600";

function Field({ id, label, children, error, required }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className={labelBase}>
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {children}
      {error ? <p className={errorText}>{error}</p> : null}
    </div>
  );
}

/* ======== Helpers (ligeros) ======== */
function Phones({ phones }) {
  const raw = Array.isArray(phones)
    ? phones
    : String(phones || "").split(/\s*[;,]\s*|\s+[–-]\s+/);

  const items = raw
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ label: p, href: `tel:${p.replace(/[^\d+]/g, "")}` }));

  if (!items.length) return null;

  return (
    <ul className="space-y-2 text-sm">
      {items.map((it, i) => (
        <li key={i} className="leading-6">
          <a
            href={it.href}
            className="inline-flex items-center rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-xs hover:bg-background/60 transition"
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Addresses({ settings }) {
  const splitAddresses = (input) => {
    const raw = String(input || "");
    const temp = raw.split("||").join("//");
    const parts = temp
      .split("//")
      .map((p) => p.trim())
      .filter(Boolean);

    return parts.map((p) => {
      const idx = p.indexOf(":");
      if (idx > -1) {
        const label = p.slice(0, idx).trim();
        const address = p.slice(idx + 1).trim();
        return { label: label || (settings?.site_name || "Sede"), address };
      }
      return { label: settings?.site_name || "Sede", address: p };
    });
  };

  const list = Array.isArray(settings?.addresses)
    ? settings.addresses
    : settings?.address
    ? splitAddresses(settings.address)
    : [];

  if (!list.length) return null;

  return (
    <ul className="space-y-4 text-sm">
      {list.slice(0, 8).map((a, i) => (
        <li key={i} className="rounded-xl border border-border/60 bg-background/40 p-4">
          {a.label ? (
            <div className="text-sm font-semibold text-foreground mb-1">{a.label}</div>
          ) : null}
          <div className="text-muted-foreground">{a.address}</div>
          <a
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs hover:bg-background/60 transition"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
          >
            Ver en Google Maps
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ======== Utils ======== */
const cx = (...xs) => xs.filter(Boolean).join(" ");

const T = {
  h1: "text-5xl sm:text-6xl md:text-7xl",
  h2: "text-4xl sm:text-5xl",
  pLg: "text-xl sm:text-2xl",
};

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function Container({ className = "", children }) {
  return <div className={cx("mx-auto max-w-7xl px-4 md:px-6 lg:px-8", className)}>{children}</div>;
}

/* ======== Página ======== */
export default function Contactenos() {
  const titleId = useId();

  // Areas
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // Settings para teléfonos/direcciones
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    compania: "",
    area: "", // SLUG
    mensaje: "",
    acepta: false,
    website: "", // honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(/** @type {null|{ok:boolean,msg:string}} */ (null));

  /* Cargar áreas */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await practiceAreasService.list();
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = arr
          .map((it) =>
            it && typeof it === "object" ? { slug: it.slug, title: it.title } : null
          )
          .filter(Boolean);
        if (!cancelled) setAreas(mapped);
      } catch {
        if (!cancelled) setAreas([]);
      } finally {
        if (!cancelled) setLoadingAreas(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Cargar settings (teléfonos + direcciones) */
  useEffect(() => {
    let mounted = true;
    settingsService
      .get()
      .then((s) => mounted && setSettings(s || {}))
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("[Contacto] settings error:", e);
        setSettingsError(e);
        setSettings({});
      });
    return () => {
      mounted = false;
    };
  }, []);

  function setVal(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  const disabled = useMemo(
    () => submitting || !form.acepta || (form.website ?? "").trim() !== "",
    [submitting, form.acepta, form.website]
  );

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";

    const tel = form.telefono.trim();
    const telOk = /^\+?[0-9()\-.\s]{7,25}$/.test(tel);
    if (!tel) e.telefono = "Ingresa un número de contacto";
    else if (!telOk) e.telefono = "Teléfono inválido";

    if (!form.mensaje.trim()) e.mensaje = "Cuéntanos tu caso";
    if (!form.area.trim()) e.area = "Selecciona un área";
    if (!form.acepta) e.acepta = "Debes aceptar la Política de Datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setStatus(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await sendContact({
        name: form.nombre,
        email: form.correo,
        telefono: form.telefono,
        company: form.compania,
        practice_area: form.area, // SLUG
        message: form.mensaje,
        consent: !!form.acepta,
        website: form.website ?? "",
      });
      setStatus({ ok: true, msg: "¡Gracias! Te contactaremos pronto." });
      setForm({
        nombre: "",
        correo: "",
        telefono: "",
        compania: "",
        area: "",
        mensaje: "",
        acepta: false,
        website: "",
      });
      setErrors({});
    } catch (e) {
      const be = e?.response?.data;
      const beErrors = be?.errors || {};
      if (beErrors && typeof beErrors === "object") {
        const mapped = {};
        if (beErrors.name) mapped.nombre = beErrors.name[0];
        if (beErrors.email) mapped.correo = beErrors.email[0];
        if (beErrors.telefono) mapped.telefono = beErrors.telefono[0];
        if (beErrors.company) mapped.compania = beErrors.company[0];
        if (beErrors.practice_area) mapped.area = beErrors.practice_area[0];
        if (beErrors.message) mapped.mensaje = beErrors.message[0];
        if (beErrors.consent) mapped.acepta = beErrors.consent[0];
        setErrors(mapped);
        setStatus({ ok: false, msg: "Revisa los campos marcados." });
      } else {
        setStatus({
          ok: false,
          msg: e?.message || "No se pudo enviar. Intenta nuevamente.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* === HERO full-bleed === */}
      <section className="relative">
        {/* Fondo (imagen + overlay + brillo) */}
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          animate={{ scale: [1.05, 1, 1.05] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={hero}
            alt="Equipo legal trabajando"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
          />

          {/* Barrido brillante */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 -left-1/3 w-1/3 z-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.35) 45%, rgba(255,255,255,.55) 50%, rgba(255,255,255,.35) 55%, transparent 100%)",
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
            animate={{ x: ["0%", "200%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Overlay de color de marca */}
          <div
            className="absolute inset-0 mix-blend-multiply z-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)/.85) 0%, hsl(var(--accent)/.42) 100%)",
            }}
          />
        </motion.div>

        {/* Contenido del hero */}
        <Container className="relative z-10 py-24 sm:py-28">
          <motion.p
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="text-xs sm:text-sm tracking-[.18em] uppercase font-semibold text-white/80"
          >
            CONTACTO
          </motion.p>

          <motion.h1
            id={titleId}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.h1,
              "mt-2 font-display font-semibold tracking-[0.03em] text-white text-balance drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
            )}
            style={{
              letterSpacing: "0.04em",
              fontKerning: "normal",
              fontOpticalSizing: "auto",
              textRendering: "optimizeLegibility",
            }}
          >
            ¿Tiene un reto legal? Hablemos
          </motion.h1>

          <motion.p
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className={cx(
              T.pLg,
              "mt-6 max-w-4xl text-white/95 tracking-[0.02em] leading-relaxed"
            )}
            style={{ wordSpacing: "0.06em" }}
          >
            Asesoría especializada, representación judicial y acompañamiento estratégico.
          </motion.p>
        </Container>

        {/* Degradado al contenido */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* === CONTENIDO === */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        {/* Migas */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Contáctenos</span>
        </nav>

        {/* Grid principal */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Formulario */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm md:p-8"
          >
            <form onSubmit={onSubmit} noValidate>
              <Field id="nombre" label="Nombre" error={errors.nombre} required>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  className={inputBase}
                  value={form.nombre}
                  onChange={(e) => setVal("nombre", e.target.value)}
                  aria-invalid={!!errors.nombre}
                  placeholder="Tu nombre completo"
                />
              </Field>

              <Field id="correo" label="Correo" error={errors.correo} required>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  className={inputBase}
                  value={form.correo}
                  onChange={(e) => setVal("correo", e.target.value)}
                  aria-invalid={!!errors.correo}
                  placeholder="tucorreo@empresa.com"
                />
              </Field>

              <Field id="telefono" label="Teléfono" error={errors.telefono} required>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={25}
                  pattern="^\\+?[0-9()\\-.\\s]{7,25}$"
                  title="Ingresa un teléfono válido (puede incluir +, espacios, paréntesis y guiones)."
                  className={inputBase}
                  value={form.telefono}
                  onChange={(e) => setVal("telefono", e.target.value)}
                  aria-invalid={!!errors.telefono}
                  placeholder="+57 601 317 4628"
                />
              </Field>

              <Field id="compania" label="Compañía">
                <input
                  id="compania"
                  name="compania"
                  type="text"
                  className={inputBase}
                  value={form.compania}
                  onChange={(e) => setVal("compania", e.target.value)}
                  placeholder="Nombre de tu empresa (opcional)"
                />
              </Field>

              <Field id="area" label="Área de práctica" error={errors.area} required>
                <select
                  id="area"
                  name="area"
                  className={`${inputBase} pr-10`}
                  value={form.area}
                  onChange={(e) => setVal("area", e.target.value)}
                  aria-invalid={!!errors.area}
                >
                  <option value="" disabled>
                    {loadingAreas ? "Cargando áreas…" : "Selecciona un área de práctica"}
                  </option>
                  {areas.map(({ slug, title }) => (
                    <option key={slug} value={slug}>
                      {title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="mensaje" label="Mensaje" error={errors.mensaje} required>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={6}
                  className={`${inputBase} resize-y`}
                  value={form.mensaje}
                  onChange={(e) => setVal("mensaje", e.target.value)}
                  aria-invalid={!!errors.mensaje}
                  placeholder="Cuéntenos brevemente su caso o consulta"
                />
              </Field>

              {/* Honeypot */}
              <div aria-hidden className="hidden">
                <label htmlFor="website">Tu sitio web</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setVal("website", e.target.value)}
                />
              </div>

              {/* Consentimiento */}
              <div className="mb-6 flex items-start gap-3">
                <input
                  id="acepta"
                  name="acepta"
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-border/60 text-primary focus:ring-primary/60"
                  checked={form.acepta}
                  onChange={(e) => setVal("acepta", e.target.checked)}
                  aria-invalid={!!errors.acepta}
                />
                <label htmlFor="acepta" className="text-sm text-foreground/90">
                  He leído la{" "}
                  <Link
                    to="/politica-de-datos"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Política de Tratamiento de Datos Personales
                  </Link>{" "}
                  y autorizo el tratamiento de mis datos con base en la política.
                </label>
              </div>
              {errors.acepta ? <p className={errorText}>{errors.acepta}</p> : null}

              {/* Estado */}
              {status ? (
                <div
                  className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                    status.ok
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-red-300 bg-red-50 text-red-800"
                  }`}
                >
                  {status.msg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={disabled}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Enviando…" : "Enviar"}
              </button>
            </form>
          </motion.section>

          {/* Lado derecho: info dinámica desde settings */}
          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="space-y-6"
          >
            {/* Direcciones */}
            <section className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
              <h2 className="mb-1 text-xl font-semibold text-foreground">Nuestras oficinas</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Tenemos presencia en varias ciudades. Escríbenos o visítanos.
              </p>
              {settings ? (
                <Addresses settings={settings} />
              ) : (
                <p className="text-sm text-muted-foreground">Cargando…</p>
              )}
              {settingsError ? (
                <p className="mt-2 text-xs text-red-600">No se pudieron cargar las direcciones.</p>
              ) : null}
            </section>

            {/* Contacto */}
            <section className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold text-foreground">Contacto</h2>
              {settings?.phone ? (
                <>
                  <h5 className="text-sm font-medium text-foreground/90 mb-2">Teléfonos</h5>
                  <Phones phones={settings.phone} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Agrega teléfonos en Settings para mostrarlos aquí.
                </p>
              )}
            </section>
          </motion.aside>
        </div>
      </div>
    </>
  );
}
