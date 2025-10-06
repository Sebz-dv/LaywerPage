import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Intro from "./pages/public/Intro.jsx";
import AppLayout from "./layouts/AppLayout";
import TeamProfile from "./pages/public/TeamProfile.jsx";
import TeamIndex from "./pages/public/TeamIndex.jsx"; 
import ServiceDetail from "./components/team/ServiceDetail";
import AdminLayout from "./layouts/AdminLayout";
import TeamMembersPage from "./components/team/TeamMembersPage";
import PracticeAreasPage from "./pages/public/PracticeAreasPage.jsx"; 
import PracticeAreasAdmin from "./pages/admin/PracticeAreasAdmin.jsx";

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
    <Routes>
      {/* Públicas (todas con AppLayout + Navbar) */}
      <Route element={<Shell />}>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<Login />} /> {/* <-- mover aquí */}
        <Route path="/register" element={<Register />} /> {/* <-- mover aquí */}
        <Route path="/equipo/:slug" element={<TeamProfile />} /> {/* 👈 NUEVA */}
        <Route path="/equipo" element={<TeamIndex />} /> 
        {/* <Route path="/servicios" element={<Services />} /> 👈 NUEVA */}
        <Route path="/servicios" element={<PracticeAreasPage />} />
        <Route path="/servicios/:slug" element={<ServiceDetail />} />
      </Route>

      {/* Protegidas (también con AppLayout + Navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dash/members" element={<TeamMembersPage />} />
          <Route path="/dash/areas" element={<PracticeAreasAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}
