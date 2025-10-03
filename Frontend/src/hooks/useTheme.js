// /src/hooks/useTheme.js
import { useCallback, useEffect, useMemo, useState } from "react";

const THEME_KEY = "theme"; // "light" | "dark"

function safeDoc() {
  return typeof document !== "undefined" ? document : null;
}
function safeWin() {
  return typeof window !== "undefined" ? window : null;
}

function getSystemPref() {
  const w = safeWin();
  if (!w?.matchMedia) return "dark";
  return w.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  const w = safeWin();
  try {
    const saved = w?.localStorage?.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Ignorar
  }
  return getSystemPref();
}

function applyThemeToDOM(theme) {
  const d = safeDoc();
  if (!d) return;
  const root = d.documentElement;
  // Si usas Tailwind con dark mode por clase:
  root.classList.toggle("dark", theme === "dark");
  // Útil si estilizas por data-attr
  root.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  // Aplica tema al montar y cada cambio
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      safeWin()?.localStorage?.setItem(THEME_KEY, theme);
    } catch {
      // Ignorar
    }
  }, [theme]);

  // Si NO hay tema guardado, sigue cambios del sistema
  useEffect(() => {
    const w = safeWin();
    if (!w?.matchMedia) return;

    const mql = w.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e) => {
      // Solo seguir sistema si el usuario no forzó uno antes
      let stored = null;
      try {
        stored = w.localStorage.getItem(THEME_KEY);
      } catch {
        // Ignorar
      }
      if (stored !== "light" && stored !== "dark") {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme]
  );
}
