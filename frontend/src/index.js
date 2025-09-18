import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./assets/styles/index.css";

import Admin from "layouts/Admin";
import Auth from "layouts/Auth";
import Dashboard from "views/admin/Dashboard";
import Login from "views/auth/Login";
import ProtectedRoute from "routes/ProtectedRoute";
import PublicRoute from "routes/PublicRoute";
import { Proveedores } from "views/admin/Proveedores";
import { Productos } from "views/admin/Productos";
import { Facturacion } from "views/admin/Facturacion";
import InvoiceDetailPage from "views/admin/InvoiceDetailPage";
import NotaDetailPage from "views/admin/NotaDetailPage";

import { Clientes } from "views/admin/Clientes";
import { Gestion } from "views/admin/Gestion";
import ProviderPage from "pages/Proveedores/ProviderPage";
import ErrorFallback from "components/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();
root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}

          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<Auth />}>
              <Route path="login" element={<Login />} />
              <Route path="" element={<Navigate to="login" replace />} />
            </Route>
          </Route>
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="productos" element={<Productos />} />
              <Route path="proveedores">
                <Route index element={<Proveedores />} />
                <Route path=":id" element={<ProviderPage />} />
              </Route>{" "}
              <Route path="facturacion">
                <Route index element={<Facturacion />} />
                <Route path="listar" element={<Facturacion />} />
                <Route path=":id" element={<InvoiceDetailPage />} />
                <Route path="nota/:id" element={<NotaDetailPage />} />
              </Route>
              <Route path="clientes" element={<Clientes />} />
              <Route path="gestion" element={<Gestion />} />
            </Route>
          </Route>

          {/* Ruta fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#363636",
              color: "#fff",
              fontSize: "17.5px",
              padding: "16px 20px",
              borderRadius: "12px",
              minWidth: "300px",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            success: {
              style: {
                background: "#10b981",
                border: "1px solid #059669",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#10b981",
              },
            },
            error: {
              style: {
                background: "#ef4444",
                border: "1px solid #dc2626",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#ef4444",
              },
            },
            info: {
              style: {
                background: "#3b82f6",
                border: "1px solid #2563eb",
              },
              iconTheme: {
                primary: "#ffffff",
                secondary: "#3b82f6",
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);
