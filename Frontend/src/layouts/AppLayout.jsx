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
      <main id="main" role="main" className=" w-full h-full">
        {children}
      </main>
      <div className="mt-[-64px]">

      <Footer />
      </div>
    </div>
  );
}
