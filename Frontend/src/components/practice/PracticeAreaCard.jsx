import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

function cx(...xs) { return xs.filter(Boolean).join(" "); }

const CLAMP = true;

export default function PracticeAreaCard({ item = {} }) {
  const reduceMotion = useReducedMotion();

  const slug = item.slug ?? item.key ?? "";
  // ✅ Preferimos `item.to` si viene del mapper (ya trae ?id=)
  // Fallback: construimos con slug y añadimos ?id= si existe
  const href = item.to ?? (slug ? `/servicios/${slug}${item.id ? `?id=${item.id}` : ""}` : "#");

  return (
    <Link
      to={href}
      className={cx(
        "group relative block rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm",
        "p-5 md:p-6 transition-all duration-300",
        "h-full flex flex-col"
      )}
      aria-label={item.title ? `Abrir ${item.title}` : "Abrir servicio"}
    >
      {/* Glow sutil */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
        style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.35)" }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        whileHover={reduceMotion ? {} : { y: -4 }}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
        className="h-full flex flex-col"
      >
        {/* Cabecera */}
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-[hsl(var(--muted))]">
            {item.icon ? (
              <img
                src={item.icon}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground/70">Icono</span>
            )}
          </div>

          <div className="min-w-0">
            <h3
              className="text-lg md:text-xl font-semibold leading-tight"
              style={
                CLAMP
                  ? { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }
                  : undefined
              }
              title={item.title}
            >
              {item.title ?? "Servicio"}
            </h3>

            {item.subtitle && (
              <p
                className="text-sm text-muted-foreground leading-snug"
                style={
                  CLAMP
                    ? { display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }
                    : undefined
                }
                title={item.subtitle}
              >
                {item.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Contenido */}
        {item.excerpt && (
          <p
            className="mt-3 text-sm md:text-[15px] text-muted-foreground"
            style={
              CLAMP
                ? { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }
                : undefined
            }
            title={item.excerpt}
          >
            {item.excerpt}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4 text-sm font-medium text-primary">
          Conocer más →
        </div>
      </motion.div>
    </Link>
  );
}
