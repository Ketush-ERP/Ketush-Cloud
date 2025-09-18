import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

// Obtener todas las facturas
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => {
      // Datos hardcodeados para desarrollo
      const mockInvoices = [
        {
          id: "1",
          numero: "0001-00000001",
          fecha: "2024-01-15",
          cliente: "Juan Pérez",
          tipo: "Factura A",
          total: 15000,
          estado: "Pagada",
          condicionPago: "Contado",
        },
        {
          id: "2",
          numero: "0001-00000002",
          fecha: "2024-01-16",
          cliente: "María González",
          tipo: "Factura B",
          total: 8500,
          estado: "Pendiente",
          condicionPago: "Cuenta corriente",
        },
        {
          id: "3",
          numero: "0001-00000003",
          fecha: "2024-01-17",
          cliente: "Carlos López",
          tipo: "Factura A",
          total: 22000,
          estado: "Pagada",
          condicionPago: "Contado",
        },
        {
          id: "7", // Este ID coincide con el voucherNumber de la factura hardcodeada
          numero: "0002-00000007",
          fecha: "2025-08-13",
          cliente: "Juan Pérez",
          tipo: "Factura B",
          total: 116183,
          estado: "Pendiente",
          condicionPago: "Contado",
        },
      ];

      return Promise.resolve(mockInvoices);
    },
  });
}

// Obtener una factura específica por ID
export function useInvoice(id) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => {
      // Datos hardcodeados para desarrollo
      const mockInvoice = {
        id: id,
        cuil: 20169658146,
        voucherNumber: 7,
        pointOfSale: 2,
        type: "FACTURA_B",
        emissionDate: "2025-08-13T18:10:00.000Z",
        currency: "ARS",
        products: [
          {
            productId: "5a2ce460-5184-4dab-b65f-9ae683b5bb9e",
            description: "Tanza p/Bordeadora Redonda Ø2.5mm (Carretel 1kg)",
            quantity: 2,
            price: 116183.0,
          },
        ],
        initialPayment: [
          {
            method: "EFECTIVO",
            currency: "ARS",
            receivedAt: "2025-07-14T13:10:00.000Z",
            amount: 2000.0,
          },
        ],
        totalAmount: 116183.0,
        paidAmount: 4000.0,
        loadToArca: true,
      };

      return Promise.resolve(mockInvoice);
    },
    enabled: !!id,
  });
}

// Crear una nueva factura
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post("/invoices", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

// Actualizar una factura
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      axiosInstance.put(`/invoices/${id}`, data).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
}

// Eliminar una factura
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/invoices/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
