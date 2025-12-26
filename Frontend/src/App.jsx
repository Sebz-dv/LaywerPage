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
import SimplePostsPage from "./pages/admin/post/SimplePostsPage.jsx";
import PublicPostsGrid from "./pages/public/post/PublicPostsGrid.jsx";
import PublicPostDetail from "./pages/public/post/PublicPostDetail.jsx";
import Contactenos from "./pages/public/contacto/Contactenos.jsx";
import MediaSlotsPage from "./pages/admin/mediaPost/MediaSlotsPage.jsx";

import NoPaid from "./pages/public/NoPaid.jsx"; // ✅ nuevo

// Sube al tope en cada cambio de ruta
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
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

// ✅ Hook simple para consultar el estado de pago
function useBillingStatus() {
  const [loading, setLoading] = React.useState(true);
  const [paid, setPaid] = React.useState(true);
  const [reason, setReason] = React.useState(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_BASE_URL ||
          "https://back.blancoramirezlegal.com/api";

        const url = `${API_BASE}/billing/status?t=${Date.now()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          // En tu caso NO necesitas cookies para este endpoint:
          credentials: "omit",
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);
        if (!alive) return;

        // Estricto: si falla, bloquea
        if (!res.ok || !data || typeof data.paid !== "boolean") {
          setPaid(false);
          setReason(!res.ok ? `http_${res.status}` : "bad_payload");
          return;
        }

        setPaid(Boolean(data.paid));
        setReason(data.reason ?? null);
      } catch {
        if (!alive) return;
        setPaid(false);
        setReason("network_error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { loading, paid, reason };
}

export default function App() {
  const { loading, paid, reason } = useBillingStatus();

  // ✅ mientras valida, puedes poner tu loader
  if (loading) return null;

  // ✅ si no está pago: corta TODO y muestra pantalla
  // (si quieres permitir /login incluso sin pago, te muestro abajo cómo)
  if (!paid) return <NoPaid reason={reason} />;

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
          <Route path="/servicios/:slug" element={<ServiceDetail />} />
          <Route path="/servicios/id/:id" element={<ServiceDetail />} />

          {/* Blog */}
          <Route path="/publicaciones" element={<BlogList />} />
          <Route path="/publicaciones/:slug" element={<BlogArticle />} />
          <Route path="/publicaciones/id/:id" element={<BlogArticle />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/public/simple-posts" element={<PublicPostsGrid />} />
          <Route
            path="/public/simple-posts/:slug"
            element={<PublicPostDetail />}
          />
          <Route path="/contacto" element={<Contactenos />} />
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
            <Route path="/dash/post" element={<SimplePostsPage />} />
            <Route path="/dash/media" element={<MediaSlotsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>
    </>
  );
}
