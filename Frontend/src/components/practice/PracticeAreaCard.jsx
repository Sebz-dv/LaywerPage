// components/practice/PracticeAreaCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import BtnInk from "../../components/ui/BtnInk.jsx";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const CLAMP = true;

export default function PracticeAreaCard({
  item = {},
  mode = "background", // "background" | "img"
  imgAspect = "aspect-[4/3]", // relación de aspecto del cover
  showExcerpt = true,
}) {
  const reduceMotion = useReducedMotion();

  const slug = item.slug ?? item.key ?? "";
  const href =
    item.to ??
    (slug ? `/servicios/${slug}${item.id ? `?id=${item.id}` : ""}` : "#");

  // icono/imagen/cover (prioridad: image > cover > icon)
  const img = item.image || item.cover || item.icon || null;

  return (
    <div
      className={cx(
        "group relative block rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm",
        "p-5 md:p-6 transition-all duration-300",
        "h-full flex flex-col"
      )}
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
        {/* ===== Cover ===== */}
        <Link
          to={href}
          className={cx("relative w-full overflow-hidden rounded-xl", imgAspect)}
          aria-label={item.title ? `Abrir ${item.title}` : "Abrir servicio"}
        >
          {img ? (
            mode === "img" ? (
              <img
                src={img}
                alt={item.title || "Área"}
                className={cx(
                  "absolute inset-0 h-full w-full object-cover object-center",
                  reduceMotion
                    ? ""
                    : "group-hover:scale-[1.03] transition-transform duration-500"
                )}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className={cx(
                  "absolute inset-0 bg-center bg-cover",
                  reduceMotion
                    ? ""
                    : "group-hover:scale-[1.03] transition-transform duration-500"
                )}
                style={{ backgroundImage: `url("${img}")` }}
                aria-label={item.title || "Área"}
                role="img"
              />
            )
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[hsl(var(--muted))] text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent pointer-events-none" />
        </Link>

        {/* ===== Títulos ===== */}
        <div className="mt-4 min-w-0">
          <h3
            className="text-2xl font-semibold leading-tight"
            style={
              CLAMP
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
            title={item.title}
          >
            <Link
              to={href}
              className="hover:underline decoration-2 underline-offset-4"
            >
              {item.title ?? "Servicio"}
            </Link>
          </h3>

          {item.subtitle && (
            <p
              className="text-lm text-muted-foreground leading-snug"
              style={
                CLAMP
                  ? {
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
                  : undefined
              }
              title={item.subtitle}
            >
              {item.subtitle}
            </p>
          )}
        </div>

        {/* ===== Extracto ===== */}
        {showExcerpt && item.excerpt && (
          <p
            className="mt-3 text-sm md:text-[15px] text-muted-foreground"
            style={
              CLAMP
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
            title={item.excerpt}
          >
            {item.excerpt}
          </p>
        )}

        {/* Spacer para empujar el CTA abajo */}
        <div className="flex-1" />

        {/* ===== CTA ===== */}
        <div className="mt-4">
          <BtnInk to={href} variant="primary" size="md">
            Conocer más
          </BtnInk>
        </div>
      </motion.div>
    </div>
  );
}
