import React from "react";
import { useNavigate } from "react-router-dom";

export default function InvoiceErrorState({ error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Error al cargar la factura
        </h2>
        <p className="text-gray-600 mb-6">
          No se pudo cargar la información de la factura
        </p>
        <button
          onClick={() => navigate("/admin/facturacion/listar")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    </div>
  );
}
