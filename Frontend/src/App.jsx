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
import Services from "./components/team/ServicesView";
import ServiceDetail from "./components/team/ServiceDetail";

function Shell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
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
        <Route path="/servicios" element={<Services />} /> {/* 👈 NUEVA */}
        <Route path="/servicios/:slug" element={<ServiceDetail />} />
      </Route>

      {/* Protegidas (también con AppLayout + Navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-6">404</div>} />
    </Routes>
  );
}
