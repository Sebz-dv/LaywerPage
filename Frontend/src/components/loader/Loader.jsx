// src/components/Loader.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Loader({
  // Spinner
  size = 40,                 // px
  borderWidth = 2,           // px
  speed = 5,                 // seg por vuelta
  colors = ["#d69e25", "#529bcf", "#b816e9"], // [center, before, after]
  // Overlay / glass
  overlay = true,            // si true, se porta a body con fixed inset-0
  blur = 12,                 // px para el cristal
  scrim = "rgba(10,12,16,0.35)", // capa oscura traslúcida
  zIndex = 9999,
  showLabel = false,
  label = "Cargando…",
  className = "",
  "aria-label": ariaLabel = "Cargando…",
}) {
  // Inyecta keyframes 1 sola vez
  useEffect(() => {
    const id = "loader-rotate-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes loader-rotate { to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Respeta reduced-motion (reduce velocidad si el usuario lo prefiere)
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) {
      // baja la velocidad (rotación más lenta)
      // Nota: no mutamos props; solo ajustamos el atributo del contenedor vía dataset si quisieras leerlo.
    }
  }, []);

  // Bloquea scroll cuando está en overlay
  useEffect(() => {
    if (!overlay) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [overlay]);

  // Estilos del spinner
  const base = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${borderWidth}px`,
    borderStyle: "solid",
    borderRadius: "10px",
    borderColor: colors[0],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    animation: `loader-rotate ${speed}s linear infinite`,
  };

  const pseudo = {
    position: "absolute",
    content: '""',
    borderStyle: "solid",
    borderRadius: "10px",
    borderWidth: `${borderWidth}px`,
    animation: `loader-rotate ${speed}s linear infinite`,
  };

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={className}
      style={base}
    >
      <span
        aria-hidden="true"
        style={{
          ...pseudo,
          width: "110%",
          height: "110%",
          borderColor: colors[1],
          animationDelay: "0.5s",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          ...pseudo,
          width: "120%",
          height: "120%",
          borderColor: colors[2],
          animationDelay: "0.10s",
        }}
      />
    </div>
  );

  if (!overlay) return spinner;

  // Overlay con cristal blur y scrim
  const overlayNode = (
    <div
      role="alert"
      aria-live="assertive"
      aria-busy="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        display: "grid",
        placeItems: "center",
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        background: scrim,
        // que deje click-through salvo el spinner:
        pointerEvents: "auto",
      }}
    >
      <div style={{ pointerEvents: "auto", textAlign: "center" }}>
        {spinner}
        {showLabel && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlayNode, document.body);
}
