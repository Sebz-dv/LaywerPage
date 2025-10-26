import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar.jsx";
import Footer from "./Footer.jsx";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function AppLayout({ children }) {
  const { pathname } = useLocation();
  const transparentRoutes = new Set(["/"]);
  const isTransparent = transparentRoutes.has(pathname);

  return (
    <div
      className={cx(
        "min-h-dvh flex flex-col",
        isTransparent
          ? "bg-transparent text-[hsl(var(--fg))]"
          : "bg-[hsl(var(--bg))] text-[hsl(var(--fg))]"
      )}
    >
      <Navbar />
      <div aria-hidden className="h-16" />

      <main id="main" role="main" className="flex-1 min-h-0 w-full h-full">
        {children}
      </main>

      <footer className="border-t w-full border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <Footer />
      </footer>
    </div>
  );
}
