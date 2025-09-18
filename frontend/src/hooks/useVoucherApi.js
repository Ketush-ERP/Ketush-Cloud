import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

/**
 * Hook para buscar facturas usando el endpoint de búsqueda
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.type - Tipo de factura (FACTURA_A, FACTURA_B, FACTURA_C)
 * @param {number} params.page - Página de resultados
 * @param {number} params.pageSize - Tamaño de página
 * @param {boolean} params.enabled - Si la consulta debe ejecutarse automáticamente
 */
export const useVouchers = ({
  type,
  page,
  pageSize,
  clientQuery,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["vouchers", type, page, pageSize, clientQuery],
    queryFn: async () => {
      let url = "/voucher/search";
      const params = new URLSearchParams();

      if (type) params.append("type", type);
      if (page) params.append("offset", page.toString());
      if (pageSize) params.append("limit", pageSize.toString());
      if (clientQuery) params.append("query", clientQuery);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: enabled,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener el siguiente número de factura disponible
 * @param {Object} params - Parámetros de la consulta
 * @param {string} params.cuil - CUIL del cliente
 * @param {string} params.voucherType - Tipo de comprobante (FACTURA_A, FACTURA_B, etc.)
 * @param {boolean} params.enabled - Si la consulta debe ejecutarse automáticamente
 */
export const useNextInvoiceNumber = ({
  cuil,
  voucherType,
  enabled = false,
}) => {
  return useQuery({
    queryKey: ["nextInvoiceNumber", cuil, voucherType],
    queryFn: async () => {
      if (!cuil || !voucherType) {
        throw new Error("CUIL y tipo de comprobante son requeridos");
      }

      const response = await axiosInstance.get(
        `/voucher/next-invoice-number?cuil=${cuil}&voucherType=${voucherType}`
      );
      return response.data;
    },
    enabled: enabled && !!cuil && !!voucherType,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para crear una nueva factura
 * @returns {Object} - Mutación para crear factura
 */
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucherData) => {
      const response = await axiosInstance.post("/voucher", voucherData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las consultas relacionadas con facturas para forzar la actualización
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["voucher"] });
    },
    onError: (error) => {
      console.error("Error al crear factura:", error);
      throw error;
    },
  });
};

/**
 * Hook para buscar una factura específica por ID
 * @param {string} voucherId - ID de la factura a buscar
 * @param {boolean} enabled - Si la consulta debe ejecutarse automáticamente
 */
export const useVoucherById = (voucherId, enabled = true) => {
  return useQuery({
    queryKey: ["voucher", voucherId],
    queryFn: async () => {
      if (!voucherId) {
        throw new Error("ID de factura es requerido");
      }

      const response = await axiosInstance.get(
        `/voucher/find-one/${voucherId}`
      );
      return response.data;
    },
    enabled: enabled && !!voucherId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Función auxiliar para mapear el tipo de comprobante del formulario al formato de la API
 * @param {string} tipoComprobante - Tipo del formulario (A, B, C, PRESUPUESTO)
 * @returns {string} - Tipo para la API (FACTURA_A, FACTURA_B, etc.)
 */
export const mapVoucherType = (tipoComprobante) => {
  const typeMap = {
    A: "FACTURA_A",
    B: "FACTURA_B",
    C: "FACTURA_C",
    PRESUPUESTO: "PRESUPUESTO",
  };
  return typeMap[tipoComprobante] || "FACTURA_B";
};

/**
 * Función auxiliar para mapear la condición IVA del formulario al formato de la API
 * @param {string} condicionIVA - Condición del formulario
 * @returns {string} - Condición para la API
 */
export const mapIvaCondition = (condicionIVA) => {
  const conditionMap = {
    responsable_inscripto: "RESPONSABLE_INSCRIPTO",
    monotributo: "MONOTRIBUTO",
    social: "MONOTRIBUTO_SOCIAL",
    promovido: "MONOTRIBUTO_PROMOVIDO",
    exento: "EXENTO",
    final: "CONSUMIDOR_FINAL",
    no_cat: "NO_CATEGORIZADO",
    prov_ext: "PROVEEDOR_EXTERIOR",
    cli_ext: "CLIENTE_EXTERIOR",
    liberado: "LIBERADO",
    no_alcanzado: "NO_ALCANZADO",
  };
  return conditionMap[condicionIVA] || "CONSUMIDOR_FINAL";
};
