// layouts/AppLayout.jsx
import React from "react";
import Navbar from "../components/navbar/Navbar.jsx";
import Footer from "./Footer.jsx";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

export default function AppLayout({ children }) {
  return (
    <div
      className={cx(
        "min-h-dvh flex flex-col",
        "bg-[hsl(var(--bg))] text-[hsl(var(--fg))]"
      )}
    >
      {/* Skip link */}
      <a
        href="#main"
        className={cx(
          "sr-only focus:not-sr-only",
          "fixed left-4 top-4 z-[100]",
          "rounded-lg px-3 py-2 text-sm font-medium",
          "bg-[hsl(var(--card))] text-[hsl(var(--fg))] border border-[hsl(var(--border))]",
          "shadow focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        )}
      >
        Saltar al contenido
      </a>

      {/* Header fijo (de tu Navbar) */}
      <Navbar />

      {/* Espaciador de la altura del navbar (h-16) */}
      <div aria-hidden className="h-16" />

      {/* Contenido: ocupa TODO (sin max-w, sin paddings) */}
      <main
        id="main"
        role="main"
        className={cx(
          "flex-1 min-h-0 w-full h-full" // full-bleed
        )}
      >
        {children}
      </main>

      {/* Footer full-bleed también */}
      <footer
        className={cx(
          "border-t w-full",
          "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        )}
      >
        <Footer />
      </footer>
    </div>
  );
}
