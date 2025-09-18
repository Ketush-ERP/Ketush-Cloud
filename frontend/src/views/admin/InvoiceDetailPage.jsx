import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVoucherById } from "hooks/useVoucherApi";
import { useVoucherPayments } from "hooks/usePaymentsApi";
import { useBanks } from "hooks/useBanksApi";
import { useCards } from "hooks/useCardsApi";
import { useContactsApi } from "hooks/useContactsApi";
import { useInvoiceUtils } from "hooks/useInvoiceUtils";
import PaymentForm from "components/Facturacion/PaymentForm";
import CreateNotaModal from "components/Facturacion/CreateNotaModal";
import LoadingScreen from "components/LoadingScreen";
import toast from "react-hot-toast";

// Componentes de la factura
import InvoiceHeader from "components/Facturacion/InvoiceHeader";
import InvoiceInfo from "components/Facturacion/InvoiceInfo";
import InvoiceProducts from "components/Facturacion/InvoiceProducts";
import InvoicePayments from "components/Facturacion/InvoicePayments";
import InvoiceClient from "components/Facturacion/InvoiceClient";
import InvoicePaymentSummary from "components/Facturacion/InvoicePaymentSummary";
import InvoiceErrorState from "components/Facturacion/InvoiceErrorState";
import InvoiceNotFoundState from "components/Facturacion/InvoiceNotFoundState";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCreateNotaModal, setShowCreateNotaModal] = useState(false);

  // Obtener datos de la factura
  const {
    data: voucherData,
    isLoading: isLoadingVoucher,
    error: voucherError,
    refetch: refetchVoucher,
  } = useVoucherById(id);

  // Obtener pagos de la factura
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    refetch: refetchPayments,
  } = useVoucherPayments(id);

  // Calcular totales usando los pagos de la factura
  const totalPaid =
    paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const remainingAmount = Math.max(
    0,
    (voucherData?.totalAmount || 0) - totalPaid
  );
  const isFullyPaid = totalPaid >= (voucherData?.totalAmount || 0);

  // Debug: mostrar los datos de pagos
  console.log("Pagos cargados:", paymentsData);
  console.log("Total pagado:", totalPaid);
  console.log("Monto restante:", remainingAmount);
  console.log("¿Está completamente pagado?:", isFullyPaid);

  // Función para manejar el registro de pago exitoso
  const handlePaymentSuccess = async () => {
    toast.success("Pago registrado exitosamente");
    setShowPaymentForm(false);

    // Refrescar tanto los pagos como la factura
    await Promise.all([refetchPayments(), refetchVoucher()]);
  };

  // Estados de carga y error
  if (isLoadingVoucher) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Cargando factura...</div>
        </div>
      </div>
    );
  }

  if (voucherError) {
    return (
      <InvoiceErrorState
        error={voucherError}
        onBack={() => navigate("/admin/facturacion")}
      />
    );
  }

  if (!voucherData) {
    return (
      <InvoiceNotFoundState onBack={() => navigate("/admin/facturacion")} />
    );
  }

  // Preparar datos para los componentes existentes
  const invoiceData = {
    id: voucherData.id,
    numero: `${voucherData.pointOfSale?.toString().padStart(4, "0") || "0000"}-${voucherData.voucherNumber?.toString().padStart(8, "0") || "00000000"}`,
    fecha: voucherData.emissionDate,
    tipo: voucherData.type,
    estado: voucherData.status,
    total: voucherData.totalAmount,
    iva: voucherData.ivaAmount,
    pagado: voucherData.paidAmount,
    condicionPago: voucherData.conditionPayment,
    productos: voucherData.products || [],
    pagos: paymentsData || [],
    // Datos del voucher para InvoiceInfo
    voucherNumber: voucherData.voucherNumber,
    pointOfSale: voucherData.pointOfSale,
    type: voucherData.type,
    emissionDate: voucherData.emissionDate,
    dueDate: voucherData.dueDate,
    status: voucherData.status,
    conditionPayment: voucherData.conditionPayment,
    totalAmount: voucherData.totalAmount,
    ivaAmount: voucherData.ivaAmount,
    paidAmount: voucherData.paidAmount,
    observation: voucherData.observation,
    // Datos adicionales
    arcaCae: voucherData.arcaCae,
    arcaDueDate: voucherData.arcaDueDate,
    createdAt: voucherData.createdAt,
    updatedAt: voucherData.updatedAt,
    // Datos del cliente
    contactId: voucherData.contactId,
  };

  // Debug: verificar que se esté pasando el contactId
  console.log(
    "InvoiceDetailPage - voucherData.contactId:",
    voucherData?.contactId
  );
  console.log(
    "InvoiceDetailPage - invoiceData.contactId:",
    invoiceData.contactId
  );
  console.log(
    "InvoiceDetailPage - ¿Se debe mostrar InvoiceClient?:",
    !!invoiceData.contactId
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con navegación */}
        <InvoiceHeader
          invoice={invoiceData}
          onBack={() => navigate("/admin/facturacion/listar")}
          onCreateNota={
            invoiceData.type !== "PRESUPUESTO"
              ? () => setShowCreateNotaModal(true)
              : undefined
          }
        />

        {/* Contenido principal */}
        <div className="space-y-6">
          {/* Información básica de la factura */}
          <InvoiceInfo invoice={invoiceData} />

          {/* Cliente - Solo mostrar si existe contactId */}
          {invoiceData.contactId && (
            <InvoiceClient contactId={invoiceData.contactId} />
          )}

          {/* Productos */}
          <InvoiceProducts
            products={invoiceData.productos}
            totalAmount={invoiceData.totalAmount}
          />

          {/* Resumen de pagos - Solo mostrar si NO es presupuesto */}
          {invoiceData.type !== "PRESUPUESTO" && (
            <InvoicePaymentSummary
              totalAmount={invoiceData.totalAmount}
              paidAmount={totalPaid}
              remainingAmount={remainingAmount}
              isFullyPaid={isFullyPaid}
              onShowPaymentForm={() => setShowPaymentForm(true)}
            />
          )}

          {/* Lista de pagos - Solo mostrar si NO es presupuesto */}
          {invoiceData.type !== "PRESUPUESTO" && (
            <InvoicePayments
              payments={invoiceData.pagos}
              isLoadingPayments={isLoadingPayments}
              invoiceId={invoiceData.id}
              isFullyPaid={isFullyPaid}
              onShowPaymentForm={() => setShowPaymentForm(true)}
            />
          )}
        </div>

        {/* Modal para registrar pago - Solo mostrar si NO es presupuesto */}
        {showPaymentForm && invoiceData.type !== "PRESUPUESTO" && (
          <PaymentForm
            invoiceId={invoiceData.id}
            remainingAmount={remainingAmount}
            onClose={() => setShowPaymentForm(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Modal para crear nota - Solo mostrar si NO es presupuesto */}
        {showCreateNotaModal && invoiceData.type !== "PRESUPUESTO" && (
          <CreateNotaModal
            invoice={invoiceData}
            onClose={() => setShowCreateNotaModal(false)}
            onSuccess={(notaId) => {
              setShowCreateNotaModal(false);
              toast.success("Nota creada exitosamente");
              // Redirigir a la página de detalle de la nota
              if (notaId) {
                navigate(`/admin/facturacion/nota/${notaId}`);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
