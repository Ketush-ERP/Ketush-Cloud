import React from "react";

export default function InvoiceProducts({ products, totalAmount }) {
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
          Productos
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="max-h-96 overflow-y-auto space-y-3 sm:space-y-4 pr-2 custom-scrollbar">
          {products?.map((product, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-3 sm:p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {product.description}
                  </h3>
                  <p className="text-sm text-gray-500">
                    CÓDIGO: {product.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Cantidad: {product.quantity}
                  </p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
