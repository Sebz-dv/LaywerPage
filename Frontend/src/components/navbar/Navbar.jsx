// components/NavbarLanding.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdManageAccounts } from "react-icons/md";
import { useAuth } from "../../context/useAuth";
import ThemeToggle from "../toggles/ThemeToggle";
import { settingsService } from "../../services/settingsService"; 
import { menuConfig as navDefaults } from "../../data/menuConfig";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function NavbarLanding({
  ctaHref = "/contacto",
  ctaLabel = "Solicita una consulta",
  open: openProp,
  setOpen: setOpenProp,
}) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname.startsWith("/login");

  // Siempre usa la config como fuente de verdad
  const navItemsPublic = navDefaults;

  // Menú móvil
  const [openMenu, setOpenMenu] = useState(false);
  const open = openProp ?? openMenu;
  const setOpen = setOpenProp ?? setOpenMenu;

  // Fondo sólido al scrollear
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
    if (isDashboard || isLogin) return;
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

  // BRAND: logo + nombre desde settings
  const [brand, setBrand] = useState({ name: "", logoUrl: "" });
  useEffect(() => {
    (async () => {
      try {
        const s = await settingsService.get();
        setBrand({
          name: s?.site_name || "Blanco & Ramírez",
          logoUrl: s?.logo_url || "",
        });
      } catch {
        setBrand((b) => ({ ...b, name: b.name || "Blanco & Ramírez" }));
      }
    })();
  }, []);

  // 👇 En vez de booleano, guardamos la KEY del mega abierto (por ejemplo i.to)
  const [megaOpenKey, setMegaOpenKey] = useState(null); // string | null

  return (
    <header
      role="banner"
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-all",
        "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
        "border-b border-[hsl(var(--accent)/0.25)] shadow-sm",
        scrolled && "backdrop-blur-[2px]"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* IZQUIERDA: brand + links (oculto en dashboard y login) */}
        {!(isDashboard || isLogin) && (
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div
                className={[
                  "h-9 w-9 rounded-xl grid place-items-center overflow-hidden shrink-0",
                  "bg-[hsl(var(--accent-foreground))/0.08]",
                  "border border-[hsl(var(--accent-foreground))/0.25]",
                  "text-[hsl(var(--accent-foreground))]",
                ].join(" ")}
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name || "Logo"}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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
                )}
              </div>

              <span className="font-semibold tracking-tight text-[hsl(var(--accent-foreground))]">
                {brand.name || "Blanco & Ramírez"}
              </span>
            </Link>

            {/* === NAV DESKTOP con mega dropdown === */}
            <ul className="ml-6 hidden lg:flex items-center gap-1">
              {navItemsPublic.map((i) => {
                const isMega = !!i.mega;

                if (!isMega) {
                  return (
                    <li key={i.to}>
                      <NavLink to={i.to} end={i.end}>
                        {({ isActive }) => (
                          <span
                            className={cx(
                              "relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                              isActive
                                ? "bg-[hsl(var(--accent-foreground))/0.18] text-[hsl(var(--accent-foreground))] ring-inset ring-1 ring-[hsl(var(--accent-foreground))/0.15]"
                                : "text-[hsl(var(--accent-foreground))/0.92] hover:bg-[hsl(var(--accent-foreground))/0.12] ring-inset ring-1 ring-transparent hover:ring-[hsl(var(--accent-foreground))/0.08]"
                            )}
                          >
                            {i.label}
                            <span
                              className={cx(
                                "pointer-events-none absolute left-2 right-2 -bottom-[3px] h-[2px] rounded-full transition-all duration-200",
                                isActive
                                  ? "opacity-100 scale-x-100 bg-[hsl(var(--accent-foreground))]"
                                  : "opacity-0 scale-x-75 bg-transparent"
                              )}
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                }

                // Item con mega dropdown (data-driven por i.mega)
                return (
                  <li
                    key={i.to}
                    className="relative group before:content-[''] before:absolute before:left-0 before:right-0 before:top-full before:h-3"
                    onMouseEnter={() => setMegaOpenKey(i.to)}
                    onMouseLeave={() => setMegaOpenKey((k) => (k === i.to ? null : k))}
                    onFocus={() => setMegaOpenKey(i.to)}
                    onBlur={(e) => {
                      const li = e.currentTarget;
                      if (!li.contains(e.relatedTarget)) setMegaOpenKey((k) => (k === i.to ? null : k));
                    }}
                  >
                    {/* Trigger: el texto principal SÍ navega */}
                    <NavLink to={i.to} end={i.end} id={`mega-trigger-${i.to}`}>
                      {({ isActive }) => (
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium",
                            "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                            isActive
                              ? "bg-[hsl(var(--accent-foreground))/0.18] text-[hsl(var(--accent-foreground))] ring-inset ring-1 ring-[hsl(var(--accent-foreground))/0.15]"
                              : "text-[hsl(var(--accent-foreground))/0.92] hover:bg-[hsl(var(--accent-foreground))/0.12] ring-inset ring-1 ring-transparent hover:ring-[hsl(var(--accent-foreground))/0.08]"
                          )}
                          tabIndex={0}
                          aria-expanded={megaOpenKey === i.to}
                          aria-controls={`mega-panel-${i.to}`}
                        >
                          {i.label}
                          <svg
                            className={cx(
                              "w-4 h-4 transition-transform",
                              megaOpenKey === i.to && "rotate-180"
                            )}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </NavLink>

                    {/* Panel mega: full-width con --bg y --primary (usa i.mega.left/right) */}
                    <div
                      id={`mega-panel-${i.to}`}
                      onMouseEnter={() => setMegaOpenKey(i.to)}
                      onMouseLeave={() => setMegaOpenKey((k) => (k === i.to ? null : k))}
                      className={cx(
                        "fixed inset-x-0 top-16 z-40 transition-all duration-200 ease-out",
                        megaOpenKey === i.to
                          ? "pointer-events-auto visible opacity-100 translate-y-0"
                          : "pointer-events-none invisible opacity-0 -translate-y-1"
                      )}
                      role="region"
                      aria-label={i.mega?.left?.title || "Submenú"}
                    >
                      <div className="w-full bg-[hsl(var(--bg))] text-[hsl(var(--primary))] border-t border-[hsl(var(--primary)/0.12)] shadow-xl">
                        <div className="grid grid-cols-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                          {/* IZQ: texto desde config */}
                          <div className="col-span-12 md:col-span-5 py-6 md:py-8 pr-4 md:pr-8">
                            {i.mega?.left?.overline && (
                              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2 text-[hsl(var(--primary)/0.7)]">
                                {i.mega.left.overline}
                              </p>
                            )}
                            {i.mega?.left?.title && (
                              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                                {i.mega.left.title}
                              </h2>
                            )}
                            {i.mega?.left?.text && (
                              <p className="text-sm leading-relaxed text-[hsl(var(--primary)/0.8)]">
                                {i.mega.left.text}
                              </p>
                            )}
                          </div>

                          {/* DER: sublinks desde config */}
                          <div className="col-span-12 md:col-span-7 py-4 md:py-6 pl-4 md:pl-8 border-t md:border-t-0 md:border-l border-[hsl(var(--primary)/0.12)]">
                            <nav aria-label="Lista" className="w-full">
                              {(() => {
                                const rightItems = Array.isArray(i.mega?.right) ? i.mega.right : [];
                                return (
                                  <ul className="grid grid-cols-1">
                                    {rightItems.map((s) => (
                                      <li key={s.to} className="contents">
                                        <NavLink
                                          to={s.to}
                                          className={({ isActive }) =>
                                            cx(
                                              "group flex items-start gap-3 px-3 py-2 rounded-md transition-colors",
                                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
                                              isActive
                                                ? "bg-[hsl(var(--primary)/0.08)] font-semibold"
                                                : "hover:bg-[hsl(var(--primary)/0.05)]"
                                            )
                                          }
                                        >
                                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary)/0.6)] group-hover:bg-[hsl(var(--primary))] shrink-0" />
                                          <span className="flex-1 min-w-0">
                                            <span className="block text-sm leading-5 truncate">
                                              {s.title}
                                            </span>
                                            {s.desc && (
                                              <span className="block text-[12px] leading-5 text-[hsl(var(--primary)/0.75)] line-clamp-2">
                                                {s.desc}
                                              </span>
                                            )}
                                          </span>
                                          <svg
                                            viewBox="0 0 24 24"
                                            className="h-4 w-4 mt-1 opacity-60 group-hover:opacity-100 transition-opacity"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                          >
                                            <path d="M9 18l6-6-6-6" />
                                          </svg>
                                        </NavLink>
                                      </li>
                                    ))}
                                  </ul>
                                );
                              })()}
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* DERECHA */}
        <div className="flex items-center gap-2 ml-auto">
          {isDashboard ? (
            user && (
              <button
                onClick={logout}
                className={cx(
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--accent-foreground))/0.1] text-[hsl(var(--accent-foreground))]",
                  "border-[hsl(var(--accent-foreground))/0.25]",
                  "hover:bg-[hsl(var(--accent-foreground))/0.18] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--accent))]"
                )}
              >
                Cerrar sesión
              </button>
            )
          ) : isLogin ? (
            <Link
              to="/"
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                "bg-[hsl(var(--accent-foreground))/0.1] text-[hsl(var(--accent-foreground))]",
                "border-[hsl(var(--accent-foreground))/0.25]",
                "hover:bg-[hsl(var(--accent-foreground))/0.18] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--accent))]"
              )}
            >
              Inicio
            </Link>
          ) : (
            <>
              <ThemeToggle />
              <Link
                to={ctaHref}
                className={cx(
                  "hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--accent-foreground))] text-[hsl(var(--accent))]",
                  "border-[hsl(var(--accent-foreground))/0.2]",
                  "hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--accent))]"
                )}
              >
                {ctaLabel}
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={cx(
                  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium border",
                  "bg-[hsl(var(--accent-foreground))/0.1] text-[hsl(var(--accent-foreground))]",
                  "border-[hsl(var(--accent-foreground))/0.25]",
                  "hover:bg-[hsl(var(--accent-foreground))/0.18] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--accent))]"
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
                  "bg-[hsl(var(--accent-foreground))/0.1] text-[hsl(var(--accent-foreground))]",
                  "border-[hsl(var(--accent-foreground))/0.25]",
                  "hover:bg-[hsl(var(--accent-foreground))/0.18] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--accent))]"
                )}
              >
                <span className="sr-only">Abrir menú</span>
                <div className="relative w-5 h-5">
                  <svg viewBox="0 0 24 24" className={cx("absolute inset-0 transition-opacity", open ? "opacity-0" : "opacity-100")}>
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <svg viewBox="0 0 24 24" className={cx("absolute inset-0 transition-opacity", open ? "opacity-100" : "opacity-0")}>
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          className={cx("lg:hidden overflow-hidden transition-[max-height] duration-300", open ? "max-h-96" : "max-h-0")}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
            <ul className="grid gap-1 pt-2">
              {navItemsPublic.map((i) => (
                <li key={i.to}>
                  <NavLink to={i.to} end={i.end} onClick={() => setOpen(false)}>
                    {({ isActive }) => (
                      <span
                        className={cx(
                          "block rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                          isActive
                            ? "bg-[hsl(var(--accent-foreground))/0.22] text-[hsl(var(--accent-foreground))] ring-1 ring-[hsl(var(--accent-foreground))/0.18]"
                            : "text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-foreground))/0.12]"
                        )}
                      >
                        {i.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
