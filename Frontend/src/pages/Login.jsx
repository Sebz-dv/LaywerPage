// pages/Login.jsx
import React, { useEffect, useRef, useState, forwardRef, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { useAuth } from "../context/useAuth.js";
import Loader from "../components/Loader.jsx";
import usePageReady from "../hooks/usePageReady.js";
import { useRouteLoading } from "../hooks/useRouteLoading.js";

/* ================= Helpers ================= */
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ====== Estilos para autofill (usa tus tokens) ====== */
function AutofillFix() {
  return (
    <style>{`
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-text-fill-color: var(--fg-hex);
        -webkit-box-shadow: 0 0 0px 1000px var(--card-hex) inset;
        transition: background-color 5000s ease-in-out 0s;
        caret-color: var(--fg-hex);
      }
      /* evitar zoom en iOS al enfocar (font-size >= 16px) */
      input { font-size: 16px; }
    `}</style>
  );
}

/* ============ Input con label flotante + slots/errores (tokenizado) ============ */
const InputFL = forwardRef(function InputFL(
  {
    id,
    label,
    type = "text",
    value,
    onChange,
    onKeyUp,
    autoComplete,
    inputMode,
    icon: LeftIcon,
    rightSlot,
    error,
    hint,
    disabled = false,
    size = "md",
    className,
    name,
    required = true,
    spellCheck = false,
    enterKeyHint,
  },
  ref
) {
  const rid = useId();
  const inputId = id || `in-${rid}`;
  const hasIcon = !!LeftIcon;

  // Alturas fijas por tamaño para centrar bien el icono y el contenido
  const sizes = {
    sm: {
      h: "h-10",
      text: "text-sm",
      icon: "h-4 w-4",
      radius: "rounded-lg",
      labelTop: "top-2",
    },
    md: {
      h: "h-12",
      text: "text-base",
      icon: "h-5 w-5",
      radius: "rounded-xl",
      labelTop: "top-3",
    },
    lg: {
      h: "h-14",
      text: "text-base",
      icon: "h-5 w-5",
      radius: "rounded-2xl",
      labelTop: "top-3.5",
    },
  }[size];

  return (
    <div className={cn("relative", className)}>
      {/* Icono: centrado verticalmente en el alto fijo del input */}
      {hasIcon && (
        <LeftIcon
          aria-hidden
          className={cn(
            "absolute left-3 top-[22px] -translate-y-1/2 pointer-events-none",
            "text-[hsl(var(--fg)/0.7)] peer-focus:text-[hsl(var(--fg))]",
            sizes.icon
          )}
        />
      )}

      {/* Input con altura fija (h-10/12/14) para centrar verticalmente */}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        autoComplete={autoComplete}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        spellCheck={spellCheck}
        required={required}
        disabled={disabled}
        placeholder=" "
        aria-invalid={!!error}
        aria-errormessage={error ? `${inputId}-error` : undefined}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        className={cn(
          "peer w-full outline-none transition-all",
          sizes.text,
          sizes.radius,
          sizes.h,
          hasIcon ? "pl-10 pr-11" : "px-4 pr-11",
          "bg-[hsl(var(--card)/0.92)] text-[hsl(var(--fg))] placeholder-transparent",
          "border border-[hsl(var(--border))] shadow-sm",
          "focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]",
          error && "ring-2 ring-rose-400 border-rose-300",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      />

      {/* Label más arriba por defecto, y aún más arriba al foco/lleno */}
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute transition-all",
          hasIcon ? "left-10" : "left-4",
          sizes.labelTop,
          "text-sm text-[hsl(var(--fg)/0.65)]",
          // estado elevado (foco o con valor)
          "peer-focus:top-[-18px] peer-[&:not(:placeholder-shown)]:top-[-18px]",
          "peer-focus:text-xs peer-[&:not(:placeholder-shown)]:text-xs",
          "peer-focus:text-[hsl(var(--fg))]"
        )}
      >
        {label}
      </label>

      {/* Slot derecho (ej. botón mostrar/ocultar pass) */}
      {rightSlot && (
        <div className="absolute right-2 top-[24px] -translate-y-1/2 flex items-center gap-2">
          {rightSlot}
        </div>
      )}

      {/* Hint / error */}
      <div className="mt-1 min-h-[1.25rem]">
        {error ? (
          <span
            id={`${inputId}-error`}
            className="text-xs text-rose-600 dark:text-rose-300"
          >
            {error}
          </span>
        ) : hint ? (
          <span
            id={`${inputId}-hint`}
            className="text-xs text-[hsl(var(--fg)/0.65)]"
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
});

/* ===== Campo de contraseña con toggle + aviso CapsLock ===== */
function PasswordField({
  id,
  label = "Contraseña",
  value,
  onChange,
  autoComplete = "current-password",
  icon: LeftIcon = FiLock,
  error,
  hint,
  disabled,
  size,
  name = "password",
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  return (
    <InputFL
      id={id}
      name={name}
      type={show ? "text" : "password"}
      label={label}
      value={value}
      onChange={onChange}
      onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock"))}
      autoComplete={autoComplete}
      icon={LeftIcon}
      error={error}
      hint={caps ? "Bloq Mayús activado" : hint}
      disabled={disabled}
      size={size}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-[hsl(var(--fg)/0.8)] hover:text-[hsl(var(--fg))] transition"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
        >
          {show ? (
            <FiEyeOff className="h-5 w-5" />
          ) : (
            <FiEye className="h-5 w-5" />
          )}
        </button>
      }
    />
  );
}

/* =============================== Página =============================== */
export default function Login() {
  const nav = useNavigate();
  const { user, login } = useAuth();
  const MotionDiv = motion.div;

  // Demo defaults
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin12320*");

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const emailRef = useRef(null);

  const { className: pageClass } = usePageReady();
  const { routeLoading, setRouteLoading } = useRouteLoading();

  // Redirige si ya está logueado
  useEffect(() => {
    if (user) nav("/dashboard", { replace: true });
  }, [user, nav]);

  // Focus inicial
  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const parseError = (err) => {
    const res = err?.response;
    if (!res) return "No hay conexión con el servidor.";
    if (res.data?.message) return res.data.message;
    const e = res.data?.errors;
    if (e) {
      const first = Object.keys(e)[0];
      if (first && e[first]?.[0]) return e[first][0];
    }
    return "Error al iniciar sesión";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      await login(email.trim().toLowerCase(), password);
      setRouteLoading(true);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Loader
        fullscreen
        label={pending ? "Entrando…" : "Cambiando de página…"}
        show={routeLoading || pending}
      />
      <AutofillFix />

      {/* Fondo con tokens (funciona en cualquier tema + dark) */}
      <div
        className={cn(
          "relative min-h-dvh flex items-center justify-center px-4 overflow-hidden",
          "bg-[hsl(var(--bg))]",
          pageClass
        )}
        style={{
          backgroundImage: `radial-gradient(1000px 600px at 20% 0%, hsl(var(--primary)/0.12), transparent 60%),
             radial-gradient(1000px 600px at 80% 0%, hsl(var(--accent)/0.10), transparent 60%),
             linear-gradient(hsl(var(--bg)), hsl(var(--bg)))`,
        }}
      >
        {/* Patrón sutil */}
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]">
          <div
            className="absolute inset-0 opacity-15 dark:opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--fg)/0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--fg)/0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px, 28px 28px",
              backgroundPosition: "-14px -14px, -14px -14px",
            }}
          />
        </div>

        {/* Card principal con borde degradé tokenizado */}
        <AnimatePresence>
          <motion.div
            key="login-card"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl p-[1px] rounded-3xl
                       bg-gradient-to-br from-[hsl(var(--primary)/0.28)] via-[hsl(var(--accent)/0.22)] to-transparent
                       shadow-[0_20px_60px_rgba(0,0,0,.25)]"
          >
            <div className="rounded-3xl bg-[hsl(var(--card)/0.86)] backdrop-blur-xl border border-[hsl(var(--border))] overflow-hidden flex flex-col sm:flex-row">
              {/* Panel visual (branding) */}
              <div
                className="p-6 sm:p-8 flex flex-col items-center justify-center text-center sm:w-1/2 order-1 sm:order-none
                              bg-[hsl(var(--muted)/0.6)] border-r border-[hsl(var(--border))]"
              >
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl grid place-items-center border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow">
                    {/* Mini monograma legal */}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-9 w-9 text-[hsl(var(--fg))]"
                    >
                      <path
                        d="M12 3v3m-6 4 6-2 6 2M6 10c0 2 2 4 4 4s4-2 4-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 6v12M7 18h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div
                    className="absolute inset-0 -z-10 blur-2xl opacity-40 rounded-3xl"
                    style={{
                      background:
                        "radial-gradient(60px 60px at 50% 50%, hsl(var(--accent)/0.35), transparent)",
                    }}
                  />
                </div>

                <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-[hsl(var(--fg))]">
                  Montoya & Asociados
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--fg)/0.75)] max-w-xs leading-relaxed">
                  Plataforma segura para clientes y equipo. Transparencia, orden
                  y resultados.
                </p>
                <span className="mt-6 text-xs text-[hsl(var(--fg)/0.65)]">
                  © {new Date().getFullYear()} Montoya & Asociados
                </span>
              </div>

              {/* Formulario */}
              <div className="w-full sm:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--fg))] text-center mb-8">
                  Inicia sesión
                </h1>

                <form
                  onSubmit={onSubmit}
                  className="space-y-4"
                  noValidate
                  autoComplete="on"
                >
                  <InputFL
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    label="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyUp={(e) =>
                      setCapsLockOn(e.getModifierState?.("CapsLock"))
                    }
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="next"
                    spellCheck={false}
                    icon={Mail}
                    size="md"
                  />

                  <PasswordField
                    id="password"
                    name="password"
                    label="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    icon={Lock}
                    size="md"
                  />

                  {capsLockOn && (
                    <div className="text-xs text-[hsl(var(--warning-hex))] -mt-1">
                      Bloq Mayús activado
                    </div>
                  )}

                  {error && (
                    <div
                      className="rounded-lg px-3 py-2 text-sm border
                                    bg-rose-500/10 text-rose-700 dark:text-rose-200 border-rose-500/30"
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[hsl(var(--fg)/0.8)] text-sm">
                    <label className="inline-flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        className="accent-[hsl(var(--primary))]"
                      />{" "}
                      Recuérdame
                    </label>
                    <Link
                      to="/forgot-password"
                      className="underline decoration-[hsl(var(--fg)/0.4)] hover:decoration-[hsl(var(--fg))]"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={pending || !email || !password}
                    className={cn(
                      "w-full font-semibold py-3 rounded-xl transition-all duration-300",
                      "text-[hsl(var(--fg))]",
                      "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
                      "hover:from-[hsl(var(--primary)/0.92)] hover:to-[hsl(var(--accent)/0.92)]",
                      "transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed",
                      "shadow-[0_10px_25px_-10px_rgba(0,0,0,.35)]"
                    )}
                  >
                    {pending ? (
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Ingresar"
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center text-sm text-[hsl(var(--fg)/0.8)]">
                  <span>¿No tienes cuenta? </span>
                  <Link
                    to="/register"
                    className="underline decoration-[hsl(var(--fg)/0.4)] hover:decoration-[hsl(var(--fg))]"
                  >
                    Regístrate
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
