import React from "react";
import { useNavigate } from "react-router-dom";

export default function InvoiceNotFoundState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
        <div className="text-gray-500 text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Factura no encontrada
        </h2>
        <p className="text-gray-600 mb-6">La factura que buscas no existe</p>
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
