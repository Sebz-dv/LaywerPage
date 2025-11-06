// src/App.jsx
import React from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Intro from "./pages/public/Intro.jsx";
import AppLayout from "./layouts/AppLayout";
import TeamProfile from "./pages/public/TeamProfile.jsx";
import TeamIndex from "./pages/public/TeamIndex.jsx";
import ServiceDetail from "./pages/public/areas-plublicas/ServiceDetail.jsx";
import AdminLayout from "./layouts/AdminLayout";
import TeamMembersPage from "./components/team/TeamMembersPage";
import PracticeAreasPage from "./pages/public/areas-plublicas/PracticeAreasPage.jsx";
import PracticeAreasAdmin from "./pages/admin/PracticeAreasAdmin.jsx";
import ArticlesAdmin from "./pages/admin/blog/ArticlesAdmin.jsx";
import ArticleForm from "./pages/admin/blog/ArticleForm.jsx";
import BlogList from "./pages/public/blog/BlogList.jsx";
import BlogArticle from "./pages/public/blog/BlogArticle.jsx";
import SiteSettings from "./components/settings/SiteSettings.jsx";
import InfoBlocksManager from "./components/info/InfoBlocksManager.jsx";
import AboutUs from "./pages/public/AboutUs.jsx";
import CarouselManager from "./components/images/CarouselManager.jsx";

// Sube al tope en cada cambio de ruta
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // Evita “recuerdos” raros de scroll en páginas largas (blog)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Públicas SIN AppLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Públicas CON AppLayout */}
        <Route element={<Shell />}>
          <Route path="/" element={<Intro />} />

          {/* Team */}
          <Route path="/equipo/:slug" element={<TeamProfile />} />
          <Route path="/equipo" element={<TeamIndex />} />

          {/* Áreas */}
          <Route path="/servicios" element={<PracticeAreasPage />} />
          {/* Detalle por SLUG (principal) — soporta ?id= para fallback */}
          <Route path="/servicios/:slug" element={<ServiceDetail />} />
          {/* Detalle por ID (compatibilidad directa) */}
          <Route path="/servicios/id/:id" element={<ServiceDetail />} />

          {/* Blog */}
          <Route path="/publicaciones" element={<BlogList />} />
          {/* ✅ SOLO POR ID */}
          <Route path="/publicaciones/:id" element={<BlogArticle />} />

          <Route path="/about-us" element={<AboutUs />} />
        </Route>

        {/* Protegidas (Admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dash/members" element={<TeamMembersPage />} />
            <Route path="/dash/areas" element={<PracticeAreasAdmin />} />
            <Route path="/dash/articles" element={<ArticlesAdmin />} />
            <Route path="/dash/articles/new" element={<ArticleForm />} />
            <Route path="/dash/articles/:id/edit" element={<ArticleForm />} />
            <Route path="/dash/settings" element={<SiteSettings />} />
            <Route path="/dash/info" element={<InfoBlocksManager />} />
            <Route path="/dash/carousel" element={<CarouselManager />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </>
  );
}
