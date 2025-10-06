// src/components/sidebar/data/menuItems.js
import {
  FaHome,
  FaCog,
  FaUserFriends ,
  FaAlignCenter ,
  FaProductHunt,
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
    icon: FaUserFriends ,
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
    key: "ajustes",
    label: "Ajustes",
    icon: FaCog,
    children: [
      {
        key: "general",
        label: "General",
        icon: FaCog,
        link: "/pages/perfil",
      },
    ],
  },
];