import React, { useState } from "react";
import { useBanks } from "hooks/useBanksApi";
import { useCards } from "hooks/useCardsApi";
import { useCreateVoucherPayment } from "hooks/usePaymentsApi";
import PaymentForm from "./PaymentForm";
import toast from "react-hot-toast";

// Componentes existentes
import InvoiceInfo from "./InvoiceInfo";
import InvoiceProducts from "./InvoiceProducts";
import InvoicePayments from "./InvoicePayments";
import InvoicePaymentSummary from "./InvoicePaymentSummary";

export default function InvoiceDetail({ invoice, onRefresh }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Hooks para obtener datos
  const { data: banks } = useBanks();
  const { data: cards } = useCards();
  const createPaymentMutation = useCreateVoucherPayment();

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";

    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Calcular montos
  const totalAmount = invoice.totalAmount || 0;
  const paidAmount = invoice.pagado || 0;
  const remainingAmount = totalAmount - paidAmount;
  const isFullyPaid = remainingAmount <= 0;

  // Función para manejar el registro de pago
  const handlePaymentSuccess = async (paymentData) => {
    try {
      const paymentPayload = {
        method: paymentData.method,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency || "ARS",
        receivedAt: paymentData.receivedAt || new Date().toISOString(),
        voucherId: invoice.id,
        ...(paymentData.bankId && { bankId: paymentData.bankId }),
        ...(paymentData.cardId && { cardId: paymentData.cardId }),
      };

      await createPaymentMutation.mutateAsync({
        voucherId: invoice.id,
        paymentData: paymentPayload,
      });

      toast.success("Pago registrado exitosamente");
      setShowPaymentForm(false);

      // Refrescar datos si se proporciona la función
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error("Error al registrar el pago");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Información básica usando el componente existente */}
      <InvoiceInfo invoice={invoice} formatDate={formatDate} />

      {/* Productos usando el componente existente */}
      <InvoiceProducts
        products={invoice.productos || []}
        formatCurrency={formatCurrency}
        totalAmount={totalAmount}
      />

      {/* Resumen de pagos usando el componente existente */}
      <InvoicePaymentSummary
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        remainingAmount={remainingAmount}
        isFullyPaid={isFullyPaid}
        formatCurrency={formatCurrency}
        onShowPaymentForm={() => setShowPaymentForm(true)}
      />

      {/* Lista de pagos usando el componente existente */}
      <InvoicePayments
        payments={invoice.pagos || []}
        isLoadingPayments={false}
        invoiceId={invoice.id}
        isFullyPaid={isFullyPaid}
        onShowPaymentForm={() => setShowPaymentForm(true)}
      />

      {/* Modal para registrar pago */}
      {showPaymentForm && (
        <PaymentForm
          invoiceId={invoice.id}
          banks={banks}
          cards={cards}
          remainingAmount={remainingAmount}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
