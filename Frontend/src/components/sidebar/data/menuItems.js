// src/components/sidebar/data/menuItems.js
import {
  FaHome,
  FaCog,
  FaUserFriends,
  FaAlignCenter,
  FaBlogger,
  FaBookmark,
  FaImages,
  FaImage,
  FaBuilding,
  FaInfoCircle,
} from "react-icons/fa";

export const menuItems = [
  {
    key: "inicio",
    label: "Inicio",
    link: "/dashboard",
    icon: FaHome,
  },
  {
    key: "miembros",
    label: "Miembros",
    link: "/dash/members",
    icon: FaUserFriends,
  },
  {
    key: "carrusel",
    label: "Carrusel",
    link: "/dash/carousel",
    icon: FaImages,
  },
  {
    key: "media",
    label: "Imagenes de Intro",
    link: "/dash/media",
    icon: FaImage,
  },
  {
    key: "areas",
    label: "Áreas",
    link: "/dash/areas",
    icon: FaAlignCenter,
  },
  {
    key: "publicaciones",
    label: "Publicaciones",
    link: "/dash/articles",
    icon: FaBookmark,
  },
  {
    key: "post",
    label: "Blog Post",
    link: "/dash/post",
    icon: FaBlogger,
  },
  {
    key: "ajustes",
    label: "Ajustes",
    icon: FaCog,
    children: [
      {
        key: "empresa",
        label: "Configuracion de Empresa",
        icon: FaBuilding,
        link: "/dash/settings",
      },
      {
        key: "datos",
        label: "Informacion De La Empresa",
        link: "/dash/info",
        icon: FaInfoCircle,
      },
    ],
  },
];
