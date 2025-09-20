import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/AuthProvider.jsx";
import RouteLoadingProvider from "./context/RouteLoadingProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteLoadingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </RouteLoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
