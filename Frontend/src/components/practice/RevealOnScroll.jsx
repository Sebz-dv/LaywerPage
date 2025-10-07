import React from "react";
import { motion } from "framer-motion";

/** Componente utilitario para revelar uno-a-uno en scroll */
export default function RevealOnScroll({ as = "div", index = 0, className = "", children, ...rest }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      custom={index}
      initial={{ opacity: 0, y: 22, rotateX: 4, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}
