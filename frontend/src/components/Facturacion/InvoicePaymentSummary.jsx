import React from "react";

export default function InvoicePaymentSummary({
  totalAmount,
  paidAmount,
  remainingAmount,
  isFullyPaid,
  onShowPaymentForm,
}) {
  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
          Resumen de Pagos
        </h2>
      </div>
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Factura:</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pagado:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(paidAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pendiente:</span>
          <span className="font-semibold text-orange-600">
            {formatCurrency(remainingAmount)}
          </span>
        </div>

        {/* Estado del pago */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Estado:</span>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                isFullyPaid
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isFullyPaid ? "Completamente Pagado" : "Pendiente de Pago"}
            </span>
          </div>
        </div>

        {/* Botón para registrar pago */}
        {!isFullyPaid && onShowPaymentForm && (
          <button
            onClick={onShowPaymentForm}
            className="w-full mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Registrar Pago
          </button>
        )}
      </div>
    </div>
  );
}
