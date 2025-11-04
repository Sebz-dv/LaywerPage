// components/ui/BtnInk.jsx
import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

const BtnInk = forwardRef(
  (
    {
      to,
      href,
      onClick,
      variant = "secondary",        // <- por defecto sólido
      size = "md",
      leftIcon = null,
      rightIcon = <ArrowRight className="h-5 w-5" aria-hidden="true" />,
      fullWidth = false,
      disabled = false,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const reduceMotion = useReducedMotion();

    const sizes = {
      sm: "px-3 py-2 text-sm rounded-lg",
      md: "px-4 py-2.5 text-[15px] rounded-xl",
      lg: "px-5 py-3 text-base rounded-2xl",
    };

    const base =
      // 👇 relative para recortar el ink, z-10 al contenido siempre encima
      "relative inline-flex items-center justify-center font-subtitle overflow-hidden group " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
      "focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-background transition";

    const widthCls = fullWidth ? "w-full" : "";

    // Variantes: outline ahora NO es totalmente transparente
    const variants = {
      primary:
        "text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
      secondary:
        "text-[hsl(var(--primary))] bg-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
      outline:
        // Fondo sutil visible + borde — ya no se ve “vacío”
        "text-white border border-white/60 bg-white/8 hover:text-[hsl(var(--primary-foreground))] disabled:opacity-50 disabled:cursor-not-allowed",
      ghost:
        "text-white/90 bg-transparent hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed",
    };

    // Ink con más presencia para outline
    const ink = {
      primary:
        "bg-[linear-gradient(90deg,hsl(var(--primary)/.12),hsl(var(--accent)/.22))]",
      secondary:
        "bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--accent)))]",
      outline:
        "bg-[linear-gradient(90deg,rgba(255,255,255,.18),rgba(255,255,255,.28))]",
      ghost:
        "bg-[linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.16))]",
    };

    const Comp = to ? Link : href ? "a" : "button";
    const compProps = to ? { to } : href ? { href, rel: "noreferrer" } : { type: "button" };

    const hoverAnim = reduceMotion ? {} : { scale: disabled ? 1 : 1.03 };
    const tapAnim = reduceMotion ? {} : { scale: disabled ? 1 : 0.99 };

    return (
      <motion.span
        whileHover={hoverAnim}
        whileTap={tapAnim}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
        className={cx("inline-block", widthCls)}
      >
        <Comp
          ref={ref}
          onClick={disabled ? undefined : onClick}
          aria-disabled={disabled || undefined}
          {...compProps}
          className={cx(base, sizes[size], variants[variant], className, widthCls)}
          {...rest}
        >
          {/* Ink fill (debajo del contenido pero visible) */}
          <span
            aria-hidden
            className={cx(
              "absolute inset-0 z-0 origin-left scale-x-0 group-hover:scale-x-100",
              "transition-transform duration-700 ease-out",
              ink[variant]
            )}
          />
          {/* Contenido */}
          <span className="relative z-10 inline-flex items-center gap-2">
            {leftIcon ? (
              <span className="shrink-0 translate-x-0.5 group-hover:translate-x-0 transition-transform duration-300">
                {leftIcon}
              </span>
            ) : null}
            <span>{children}</span>
            {rightIcon ? (
              <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
                {rightIcon}
              </span>
            ) : null}
          </span>
        </Comp>
      </motion.span>
    );
  }
);

BtnInk.displayName = "BtnInk";
export default BtnInk;
