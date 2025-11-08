// /data/menuConfig.js
import { servicios } from "./servicios";
import { about } from "./about";

export const menuConfig = [
  { label: "Inicio", to: "/", end: true },

  {
    label: "Sobre Nosotros",
    to: "/about-us",
    mega: {
      left: {
        overline: "Nosotros",
        title: "Sobre Nosotros",
        text:
          "Somos un equipo de expertos que combina conocimiento legal, " +
          "visión estratégica e innovación para responder de forma integral " +
          "a las necesidades de nuestros clientes",
      },
      right: about, // 👈 array [{title,to,desc?}]
    },
  },

  {
    label: "Servicios",
    to: "/servicios",
    mega: {
      left: {
        overline: "Servicios",
        title: "Áreas de práctica",
        text: "Acompañamos a su empresa en cada reto, del puntual al complejo.",
      },
      right: servicios, // 👈 array [{title,to,desc?}]
    },
  },

  { label: "Publicaciones", to: "/publicaciones" },
  { to: "/public/simple-posts", label: "Blog" },
  { label: "Contacto", to: "/contacto" },
];

// Opcional: sellar también la raíz
Object.freeze(menuConfig);
