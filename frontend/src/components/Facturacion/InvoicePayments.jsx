import React from "react";
import PaymentsList from "./PaymentsList";

export default function InvoicePayments({
  payments,
  isLoadingPayments,
  invoiceId,
  isFullyPaid,
  onShowPaymentForm,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
            Pagos
          </h2>
          {!isFullyPaid && (
            <button
              onClick={onShowPaymentForm}
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
            >
              Registrar Pago
            </button>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <PaymentsList
          payments={payments}
          isLoading={isLoadingPayments}
          invoiceId={invoiceId}
        />
      </div>
    </div>
  );
}
