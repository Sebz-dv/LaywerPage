// components/NavbarLanding.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdManageAccounts } from "react-icons/md";
import { useAuth } from "../../context/useAuth";
// Ajusta la ruta si tu toggle vive en otra carpeta
import ThemeToggle from "../toggles/ThemeToggle";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

export default function NavbarLanding({
  navItemsPublic = [
    { to: "/", label: "Inicio", end: true },
    { to: "/servicios", label: "Servicios" },
    { to: "/equipo", label: "Equipo" },
    { to: "/publicaciones", label: "Publicaciones" },
    { to: "/contacto", label: "Contacto" },
  ],
  ctaHref = "/agenda",
  ctaLabel = "Agenda una consulta",
  open: openProp,
  setOpen: setOpenProp,
}) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname.startsWith("/login");

  // Menú móvil (solo fuera de dashboard/login)
  const [openMenu, setOpenMenu] = useState(false);
  const open = openProp ?? openMenu;
  const setOpen = setOpenProp ?? setOpenMenu;

  // Sombra/fondo sólido al scrollear
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar panel móvil con Escape / click fuera
  const panelRef = useRef(null);
  useEffect(() => {
    if (isDashboard || isLogin) return; // no hay panel en estos casos
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!open) return;
      if (panelRef.current?.contains(e.target)) return;
      const navBtn = document.getElementById("nav-toggle");
      if (navBtn?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, setOpen, isDashboard, isLogin]);

  return (
    <header
      role="banner"
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all",
        scrolled
          ? "backdrop-blur-md bg-[hsl(var(--card)/0.75)] border-b border-[hsl(var(--border))] shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* IZQUIERDA: brand + links (oculto en dashboard y login) */}
        {!(isDashboard || isLogin) && (
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] grid place-items-center text-[hsl(var(--brand))]">
                {/* mini monograma */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 3v3m-6 4 6-2 6 2M6 10c0 2 2 4 4 4s4-2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M12 6v12M7 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-semibold tracking-tight text-[hsl(var(--fg))]">
                Montoya & Asociados
              </span>
            </Link>

            <ul className="ml-6 hidden lg:flex items-center gap-1">
              {navItemsPublic.map((i) => (
                <li key={i.to}>
                  <NavLink
                    to={i.to}
                    end={i.end}
                    className={({ isActive }) =>
                      cx(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--fg))]"
                          : "text-[hsl(var(--fg)/0.85)] hover:bg-[hsl(var(--muted))]"
                      )
                    }
                  >
                    {i.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DERECHA */}
        <div className="flex items-center gap-2 ml-auto">
          {isDashboard ? (
            // SOLO cerrar sesión
            user && (
              <button
                onClick={logout}
                className={cx(
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                  "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                )}
              >
                Cerrar sesión
              </button>
            )
          ) : isLogin ? (
            // LOGIN: SOLO botón Inicio
            <Link
              to="/"
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              )}
            >
              Inicio
            </Link>
          ) : (
            <>
              {/* Toggle de tema (usa tu componente) */}
              <ThemeToggle />

              {/* CTA */}
              <Link
                to={ctaHref}
                className={cx(
                  "hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--border)/0.2)]",
                  "hover:bg-[hsl(var(--accent)/0.92)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                )}
              >
                {ctaLabel}
              </Link>

              {/* Login/Account */}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={cx(
                  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                  "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                )}
              >
                <MdManageAccounts />
              </Link>

              {/* Mobile toggle */}
              <button
                id="nav-toggle"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="mobile-panel"
                className={cx(
                  "lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border",
                  "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border-[hsl(var(--border))]",
                  "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                )}
              >
                <span className="sr-only">Abrir menú</span>
                <div className="relative w-5 h-5">
                  <svg viewBox="0 0 24 24" className={cx("absolute inset-0 transition-opacity", open ? "opacity-0" : "opacity-100")}>
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <svg viewBox="0 0 24 24" className={cx("absolute inset-0 transition-opacity", open ? "opacity-100" : "opacity-0")}>
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Panel móvil (oculto en dashboard y login) */}
      {!(isDashboard || isLogin) && (
        <div
          id="mobile-panel"
          ref={panelRef}
          className={cx(
            "lg:hidden overflow-hidden transition-[max-height] duration-300",
            open ? "max-h-96" : "max-h-0"
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
            <ul className="grid gap-1 pt-2">
              {navItemsPublic.map((i) => (
                <li key={i.to}>
                  <NavLink
                    to={i.to}
                    end={i.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "block rounded-lg px-3 py-2 text-sm font-medium",
                        isActive
                          ? "bg-[hsl(var(--fg))] text-[hsl(var(--bg))]"
                          : "text-[hsl(var(--fg))] hover:bg-[hsl(var(--muted))]"
                      )
                    }
                  >
                    {i.label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to={ctaHref}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                    "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--border)/0.2)]",
                    "hover:bg-[hsl(var(--accent)/0.92)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  )}
                >
                  {ctaLabel}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
