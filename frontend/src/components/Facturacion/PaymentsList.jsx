import React, { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
  FaCalendarAlt,
} from "react-icons/fa";
import { useDeletePayment } from "hooks/usePaymentsApi";
import toast from "react-hot-toast";

export default function PaymentsList({ payments, isLoading, invoiceId }) {
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const deletePayment = useDeletePayment();

  // Debug: mostrar los pagos recibidos
  console.log("PaymentsList - payments recibidos:", payments);
  console.log("PaymentsList - isLoading:", isLoading);
  console.log("PaymentsList - invoiceId:", invoiceId);

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      return;
    }

    setDeletingPaymentId(paymentId);
    try {
      await deletePayment.mutateAsync({ invoiceId, paymentId });
      toast.success("Pago eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el pago");
      console.error("Error deleting payment:", error);
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const formatCurrency = (amount, currency = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "EFECTIVO":
        return <FaMoneyBillWave className="w-4 h-4" />;
      case "TARJETA":
        return <FaCreditCard className="w-4 h-4" />;
      case "TRANSFERENCIA":
        return <FaUniversity className="w-4 h-4" />;
      case "CHEQUE":
        return <FaCalendarAlt className="w-4 h-4" />;
      default:
        return <FaMoneyBillWave className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case "EFECTIVO":
        return "Efectivo";
      case "TARJETA":
        return "Tarjeta";
      case "TRANSFERENCIA":
        return "Transferencia Bancaria";
      case "CHEQUE":
        return "Cheque";
      default:
        return method;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "EFECTIVO":
        return "bg-green-100 text-green-800 border-green-200";
      case "TARJETA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "TRANSFERENCIA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CHEQUE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No hay pagos registrados
        </h3>
        <p className="text-gray-500">Los pagos registrados aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icono del método */}
              <div className="bg-white p-3 rounded-lg shadow-sm">
                {getMethodIcon(payment.method)}
              </div>

              {/* Información del pago */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full border ${getMethodColor(payment.method)}`}
                  >
                    {getMethodIcon(payment.method)}
                    {getMethodLabel(payment.method)}
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3" />
                    {formatDate(payment.receivedAt)}
                  </div>

                  {payment.reference && (
                    <span className="bg-white px-2 py-1 rounded text-xs">
                      Ref: {payment.reference}
                    </span>
                  )}
                  {/* TODO:SI SE QUIERE MOSTRAR EL ID DEL BANCO SACAR ESTO, jose puto */}
                  {/* {payment.bankId && (
                    <span className="bg-white px-2 py-1 rounded text-xs">
                      Banco: {payment.bankId}
                    </span>
                  )} */}
                  {/* 
                  {payment.cardId && (
                    <span className="bg-white px-2 py-1 rounded text-xs">
                      Tarjeta: {payment.cardId}
                    </span>
                  )} */}
                </div>

                {payment.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{payment.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {/* <button
                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                title="Editar pago"
                onClick={() => {
                  // TODO: Implementar edición de pago y eliminacion
                  toast.info("Función de edición en desarrollo");
                }}
              >
                <FaEdit className="w-4 h-4" />
              </button> */}
              {/* <button
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Eliminar pago"
                onClick={() => handleDeletePayment(payment.id)}
                disabled={deletingPaymentId === payment.id}
              >
                {deletingPaymentId === payment.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
              </button> */}
            </div>
          </div>
        </div>
      ))}

      {/* Resumen */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            Total Pagado
          </span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(
              payments.reduce((total, payment) => total + payment.amount, 0)
            )}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {payments.length} pago{payments.length !== 1 ? "s" : ""} registrado
          {payments.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
