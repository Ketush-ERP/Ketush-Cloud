import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";
import html2pdf from "html2pdf.js";

/**
 * Hook para obtener pagos de una factura específica (voucher)
 * @param {string} voucherId - ID de la factura (voucher)
 * @param {boolean} enabled - Si la consulta debe ejecutarse automáticamente
 */
export function useVoucherPayments(voucherId, enabled = true) {
  return useQuery({
    queryKey: ["voucher-payments", voucherId],
    queryFn: async () => {
      if (!voucherId) {
        throw new Error("ID de factura es requerido");
      }

      // Obtener la factura completa para acceder a los pagos
      const response = await axiosInstance.get(
        `/voucher/find-one/${voucherId}`
      );
      const voucherData = response.data;

      // Retornar el array de pagos de la factura
      return voucherData.Payments || [];
    },
    enabled: enabled && !!voucherId,
  });
}

/**
 * Hook para obtener pagos de una factura específica (mantiene compatibilidad)
 * @deprecated Usar useVoucherPayments en su lugar
 */
export function useInvoicePayments(invoiceId) {
  return useVoucherPayments(invoiceId);
}

/**
 * Hook para registrar un nuevo pago en una factura
 * @returns {Object} - Mutación para crear pago
 */
export function useCreateVoucherPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voucherId, paymentData }) => {
      // Debug: mostrar los datos que se van a enviar
      console.log("Hook - voucherId:", voucherId);
      console.log("Hook - paymentData:", paymentData);

      // Endpoint correcto para registrar pagos
      const response = await axiosInstance.post(`/voucher/register-payment`, {
        ...paymentData,
        // No incluir voucherId aquí ya que viene en paymentData
      });
      return response.data;
    },
    onSuccess: (_, { voucherId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ["voucher-payments", voucherId],
      });
      queryClient.invalidateQueries({
        queryKey: ["voucher", voucherId],
      });
      queryClient.invalidateQueries({
        queryKey: ["vouchers"],
      });
    },
    onError: (error) => {
      console.error("Error al crear pago:", error);
      throw error;
    },
  });
}

/**
 * Hook para registrar un nuevo pago (mantiene compatibilidad)
 * @deprecated Usar useCreateVoucherPayment en su lugar
 */
export function useCreatePayment() {
  return useCreateVoucherPayment();
}

/**
 * Hook para actualizar un pago existente
 * @returns {Object} - Mutación para actualizar pago
 */
export function useUpdateVoucherPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voucherId, paymentId, paymentData }) => {
      // const response = await axiosInstance.put(`/voucher/${voucherId}/payments/${paymentId}`, paymentData);
      // return response.data;

      // Simulación para desarrollo hasta que implementes el endpoint
      return Promise.resolve({
        id: paymentId,
        ...paymentData,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({
        queryKey: ["voucher-payments", voucherId],
      });
      queryClient.invalidateQueries({ queryKey: ["voucher", voucherId] });
    },
  });
}

/**
 * Hook para actualizar un pago (mantiene compatibilidad)
 * @deprecated Usar useUpdateVoucherPayment en su lugar
 */
export function useUpdatePayment() {
  return useUpdateVoucherPayment();
}

/**
 * Hook para eliminar un pago
 * @returns {Object} - Mutación para eliminar pago
 */
export function useDeleteVoucherPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voucherId, paymentId }) => {
      // TODO: Implementar cuando el endpoint esté listo
      // const response = await axiosInstance.delete(`/voucher/${voucherId}/payments/${paymentId}`);
      // return response.data;

      // Simulación para desarrollo hasta que implementes el endpoint
      return Promise.resolve({ success: true, deletedId: paymentId });
    },
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({
        queryKey: ["voucher-payments", voucherId],
      });
      queryClient.invalidateQueries({ queryKey: ["voucher", voucherId] });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

/**
 * Hook para eliminar un pago (mantiene compatibilidad)
 * @deprecated Usar useDeleteVoucherPayment en su lugar
 */
export function useDeletePayment() {
  return useDeleteVoucherPayment();
}

/**
 * Hook para descargar la factura como PDF
 * @returns {Object} - Mutación para descargar factura como PDF
 */
export function useDownloadInvoiceAsPdf() {
  return useMutation({
    mutationFn: async ({ voucherId, factura }) => {
      if (!voucherId) {
        throw new Error("ID de factura es requerido");
      }

      console.log("Intentando obtener HTML para voucher:", voucherId);
      console.log(
        "URL completa:",
        `${axiosInstance.defaults.baseURL}/voucher/html/${voucherId}`
      );

      try {
        // Obtener el HTML de la factura desde el endpoint
        const response = await axiosInstance.get(`/voucher/html/${voucherId}`);
        console.log("Respuesta exitosa:", response.status, response.data);
        return response.data;
      } catch (error) {
        console.error("Error en la petición:", error);
        console.error("Detalles del error:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
          },
        });
        throw error;
      }
    },
    onSuccess: (html, { factura }) => {
      console.log("Generando PDF para factura:", factura.numero);
      const container = document.createElement("div");
      container.innerHTML = html;

      html2pdf()
        .set({
          margin: 0.5,
          filename: `comprobante-${factura.numero}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save()
        .then(() => {
          console.log("PDF generado y descargado exitosamente");
        })
        .catch((error) => {
          console.error("Error al generar PDF:", error);
        });
    },
    onError: (error) => {
      console.error("Error al generar PDF:", error);
      // Mostrar un mensaje más amigable al usuario
      alert(`Error al generar el PDF: ${error.message || "Error de conexión"}`);
    },
  });
}

/**
 * Tipos de métodos de pago disponibles
 */
export const PAYMENT_METHODS = {
  EFECTIVO: "EFECTIVO",
  TARJETA_DEBITO: "TARJETA_DEBITO",
  TARJETA_CREDITO: "TARJETA_CREDITO",
  TRANSFERENCIA: "TRANSFERENCIA",
  CHEQUE: "CHEQUE",
  DEPOSITO: "DEPOSITO",
  OTRO: "OTRO",
};

/**
 * Tipos de moneda disponibles
 */
export const CURRENCIES = {
  ARS: "ARS",
  USD: "USD",
  EUR: "EUR",
};
