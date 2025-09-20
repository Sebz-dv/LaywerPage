// app/components/ThemeToggle.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const STORAGE_KEY_DEFAULT = "theme";

export default function ThemeToggle({
  className = "",
  label = "Cambiar tema",
  storageKey = STORAGE_KEY_DEFAULT,
}) {
  const [theme, setTheme] = useState(null); // "light" | "dark" | null

  const applyTheme = useCallback(
    (next) => {
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      localStorage.setItem(storageKey, next);
      setTheme(next);
    },
    [storageKey]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    const onStorage = (e) => {
      if (e.key === storageKey && (e.newValue === "dark" || e.newValue === "light")) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyTheme, storageKey]);

  const isDark = theme === "dark";
  const handleClick = () => applyTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center rounded-xl px-3 py-2 border text-sm font-medium",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--fg))]",
        "hover:bg-[hsl(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
        "dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--fg))] dark:border-[hsl(var(--border))]",
        className,
      ].join(" ")}
    >
      <span className="relative inline-flex w-5 h-5 items-center justify-center">
        {/* Sol visible en dark para invitar a claro */}
        <FiSun
          className={`absolute inset-0 h-5 w-5 transition-opacity duration-200 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        {/* Luna visible en light para invitar a oscuro */}
        <FiMoon
          className={`absolute inset-0 h-5 w-5 transition-opacity duration-200 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        />
      </span>
      <span className="ml-2 hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
    </button>
  );
}
