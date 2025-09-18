import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVoucherById } from "hooks/useVoucherApi";
import {
  FaArrowLeft,
  FaFileInvoice,
  FaExclamationTriangle,
} from "react-icons/fa";
import LoadingScreen from "components/LoadingScreen";
import ErrorFallback from "components/ErrorFallback";

export default function NotaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notaData, setNotaData] = useState(null);

  const { data: voucherData, isLoading, error, refetch } = useVoucherById(id);

  useEffect(() => {
    if (voucherData) {
      setNotaData(voucherData);
    }
  }, [voucherData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={() => refetch()}
        onBack={() => navigate("/admin/facturacion")}
      />
    );
  }

  if (!notaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nota no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            La nota que buscas no existe o ha sido eliminada.
          </p>
          <button
            onClick={() => navigate("/admin/facturacion")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver a Facturación
          </button>
        </div>
      </div>
    );
  }

  // Verificar que sea una nota
  if (!notaData.type?.includes("NOTA_")) {
    // Si no es una nota, redirigir al detalle de factura
    navigate(`/admin/facturacion/${id}`);
    return null;
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Formatear número de nota
  const formatNotaNumber = (pointOfSale, voucherNumber) => {
    if (!pointOfSale || !voucherNumber) return "N/A";
    return `${pointOfSale.toString().padStart(4, "0")}-${voucherNumber.toString().padStart(8, "0")}`;
  };

  // Obtener etiqueta del tipo de nota
  const getTypeLabel = (type) => {
    const typeMap = {
      NOTA_CREDITO_A: "Nota de Crédito A",
      NOTA_CREDITO_B: "Nota de Crédito B",
      NOTA_DEBITO_A: "Nota de Débito A",
      NOTA_DEBITO_B: "Nota de Débito B",
    };
    return typeMap[type] || type || "N/A";
  };

  // Obtener color del tipo de nota
  const getTypeColor = (type) => {
    if (type?.includes("NOTA_CREDITO")) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (type?.includes("NOTA_DEBITO")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Obtener icono del tipo de nota
  const getTypeIcon = (type) => {
    if (type?.includes("NOTA_CREDITO")) {
      return (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (type?.includes("NOTA_DEBITO")) {
      return (
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/facturacion")}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detalle de Nota
                </h1>
                <p className="text-gray-600">
                  {formatNotaNumber(
                    notaData.pointOfSale,
                    notaData.voucherNumber
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de información de la nota */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`p-3 rounded-xl ${
                    notaData.type?.includes("NOTA_CREDITO")
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {getTypeIcon(notaData.type)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {getTypeLabel(notaData.type)}
                  </h2>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getTypeColor(notaData.type)}`}
                  >
                    {notaData.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Número de Nota
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNotaNumber(
                      notaData.pointOfSale,
                      notaData.voucherNumber
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Fecha de Emisión
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(notaData.emissionDate)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Total
                  </span>
                  <p className="text-2xl font-bold text-green-600">
                    ${notaData.totalAmount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Moneda
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {notaData.currency || "ARS"}
                  </p>
                </div>
              </div>
            </div>

            {/* Productos */}
            {notaData.products && notaData.products.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos ({notaData.products.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Código
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Descripción
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">
                          Cantidad
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">
                          Precio Unit.
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notaData.products.map((product, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-gray-600">
                            {product.code}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {product.description}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {product.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-900">
                            ${product.price?.toLocaleString() || "0"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-blue-600">
                            $
                            {(
                              (product.quantity || 1) * (product.price || 0)
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar con información adicional */}
          <div className="space-y-6">
            {/* Información del cliente */}
            {notaData.contact && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cliente
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Nombre
                    </span>
                    <p className="text-gray-900">{notaData.contact.name}</p>
                  </div>
                  {notaData.contact.documentNumber && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        CUIL/DNI
                      </span>
                      <p className="text-gray-900 font-mono">
                        {notaData.contact.documentNumber}
                      </p>
                    </div>
                  )}
                  {notaData.contact.ivaCondition && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Condición IVA
                      </span>
                      <p className="text-gray-900">
                        {notaData.contact.ivaCondition}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de la factura asociada */}
            {notaData.associatedVoucherNumber && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Factura Asociada
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Número
                    </span>
                    <p className="text-gray-900 font-mono">
                      {notaData.associatedVoucherNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Tipo
                    </span>
                    <p className="text-gray-900">
                      {notaData.associatedVoucherType}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de ARCA */}
            {notaData.loadToArca && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información ARCA
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Estado
                    </span>
                    <p className="text-green-600 font-semibold">
                      Cargada en ARCA
                    </p>
                  </div>
                  {notaData.arcaCae && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        CAE
                      </span>
                      <p className="text-gray-900 font-mono">
                        {notaData.arcaCae}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
