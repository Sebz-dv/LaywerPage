import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Intro from "./pages/Intro";
import AppLayout from "./layouts/AppLayout";
import TeamProfile from "./pages/TeamProfile";
import TeamIndex from "./pages/TeamIndex";
import AdminLayout from "./layouts/AdminLayout"; 
import TeamMembersPage from "./components/team/TeamMembersPage";


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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/equipo/:slug" element={<TeamProfile />} />
        <Route path="/equipo" element={<TeamIndex />} />
      </Route>

      {/* Protegidas (también con AppLayout + Navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dash/members" element={<TeamMembersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}
