import React from "react";
import { FaFileInvoice, FaPlus, FaList } from "react-icons/fa";

export default function FacturacionNavigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: "crear",
      label: "Crear Factura",
      icon: <FaPlus className="w-5 h-5" />,
      description: "Genera una nueva factura",
    },
    {
      id: "listar",
      label: "Ver Facturas",
      icon: <FaList className="w-5 h-5" />,
      description: "Gestiona facturas existentes",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

        <div className="relative flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl">
            <FaFileInvoice className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Facturación</h1>
            <p className="text-indigo-100 text-lg">
              Sistema completo de gestión de facturas
            </p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative group p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              {/* Indicador activo */}
              {activeTab === tab.id && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}

              <div className="text-center space-y-3">
                <div
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  {tab.icon}
                </div>

                <div>
                  <h3
                    className={`text-lg font-bold transition-colors duration-300 ${
                      activeTab === tab.id
                        ? "text-blue-800"
                        : "text-gray-800 group-hover:text-blue-700"
                    }`}
                  >
                    {tab.label}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      activeTab === tab.id
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-blue-500"
                    }`}
                  >
                    {tab.description}
                  </p>
                </div>
              </div>

              {/* Efecto de hover */}
              <div
                className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-100"
                    : "bg-gradient-to-r from-blue-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-100"
                }`}
              ></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
