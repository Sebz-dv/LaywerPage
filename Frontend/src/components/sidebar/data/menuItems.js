// src/components/sidebar/data/menuItems.js
import {
  FaHome,
  FaCog,
  FaUserFriends,
  FaAlignCenter,
  FaProductHunt,
  FaBookmark,
  FaArchway,
  FaBookMedical,
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
    key: "areas",
    label: "Áreas",
    link: "/dash/areas",
    icon: FaAlignCenter,
  },
  {
    key: "products",
    label: "Productos",
    link: "/dash/products",
    icon: FaProductHunt,
  },
  {
    key: "publicaciones",
    label: "Publicaciones",
    link: "/dash/articles",
    icon: FaBookmark,
  },

  {
    key: "ajustes",
    label: "Ajustes",
    icon: FaCog,
    children: [
      {
        key: "empresa",
        label: "Configuracion de Empresa",
        icon: FaArchway,
        link: "/dash/settings",
      },
      {
        key: "datos",
        label: "Informacion De La Empresa",
        link: "/dash/info",
        icon: FaBookMedical,
      },
    ],
  },
];
