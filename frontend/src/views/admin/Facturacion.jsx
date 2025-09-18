import FacturacionForm from "components/Facturacion/FacturacionForm";
import FacturasList from "components/Facturacion/FacturasList";
import FacturacionNavigation from "components/Facturacion/FacturacionNavigation";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const Facturacion = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("crear");

  // Detectar la ruta actual y establecer la pestaña activa
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/facturacion/listar")) {
      setActiveTab("listar");
    } else {
      setActiveTab("crear");
    }
  }, [location.pathname]);

  const handleSubmit = (data) => {
    // Aquí puedes manejar el envío del formulario
    console.log("Datos de la factura:", data);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "crear":
        return <FacturacionForm onSubmit={handleSubmit} />;
      case "listar":
        return <FacturasList />;
      default:
        return <FacturacionForm onSubmit={handleSubmit} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 py-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Navegación principal */}
        <FacturacionNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Contenido de la pestaña activa */}
        {renderActiveTab()}
      </div>
    </div>
  );
};
