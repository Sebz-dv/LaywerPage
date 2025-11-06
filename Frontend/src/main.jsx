// src/main.jsx (o index.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthProvider.jsx";
import RouteLoadingProvider from "./context/RouteLoadingProvider.jsx";
import "./index.css";

const RAW_BASE = import.meta.env.BASE_URL || "/";
const BASENAME = RAW_BASE === "/" ? undefined : RAW_BASE.replace(/\/+$/, ""); 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={BASENAME}>
      <RouteLoadingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </RouteLoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
