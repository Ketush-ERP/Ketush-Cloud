import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";
import toast from "react-hot-toast";

// Hook para obtener todos los contactos
export function useContacts({
  offset = 1,
  pageSize = 100,
  search = "",
  type = "",
}) {
  return useQuery({
    queryKey: ["contacts", offset, pageSize, search, type],
    queryFn: async () => {
      let url;
      if (search) {
        url = `/contacts/search?query=${encodeURIComponent(search)}&type=CLIENT&offset=${offset}&limit=${pageSize}`;
      } else {
        url = `/contacts/search?type=${type}&offset=${offset}&limit=${pageSize}`;

        // if (type) {
        //   url += `&type=${type}`;
        // }
      }

      try {
        const { data } = await axiosInstance.get(url);
        return data;
      } catch (error) {
        if (error.response?.status === 404 && search) {
          return {
            data: [],
            meta: {
              total: 0,
              offset: offset,
              limit: pageSize,
            },
          };
        }
        throw error;
      }
    },
    keepPreviousData: true,
    staleTime: 30000,
    cacheTime: 300000,
    enabled: !!offset && !!pageSize,
  });
}

// Hook para obtener un contacto específico por ID
export function useContactById(contactId, options = {}) {
  return useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      if (!contactId) {
        throw new Error("ID de contacto es requerido");
      }

      try {
        const { data } = await axiosInstance.get(`/contacts/id/${contactId}`);
        return data;
      } catch (error) {
        // Si falla, devolver datos hardcodeados para desarrollo
        if (error.response?.status === 404) {
          return {
            id: contactId,
            name: "Cliente no encontrado",
            documentNumber: "N/A",
            ivaCondition: "N/A",
          };
        }
        throw error;
      }
    },
    enabled: options.enabled !== false && !!contactId,
    staleTime: 10 * 60 * 1000, // 10 minutos - más tiempo para evitar refetch innecesario
    cacheTime: 30 * 60 * 1000, // 30 minutos - cache más largo
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnMount: false, // No refetch al montar si ya hay datos
  });
}

// Hook simple para obtener todos los contactos (para el detalle de factura)
export function useContactsApi() {
  return useQuery({
    queryKey: ["all-contacts"],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(
          "/contacts/search?type=CLIENT&offset=1&limit=1000"
        );
        return data.data || [];
      } catch (error) {
        // Si falla, devolver datos hardcodeados para desarrollo
        return [
          {
            id: "1",
            name: "Juan Pérez",
            cuil: 20169658146,
            email: "juan.perez@email.com",
            phone: "+54 11 1234-5678",
          },
        ];
      }
    },
    staleTime: 30000,
    cacheTime: 300000,
  });
}

// Hook para crear un nuevo contacto
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData) => {
      const dataToSend = {
        name: contactData.name,
        ivaCondition: contactData.ivaCondition,
        documentType: contactData.documentType,
        documentNumber: contactData.documentNumber,
        phone: contactData.phone,
        email: contactData.email,
        address: contactData.address,
        type: "CLIENT", // Siempre será CLIENT para nuevos clientes
      };

      // Solo agregar businessName si tiene un valor
      if (contactData.businessName && contactData.businessName.trim() !== "") {
        dataToSend.businessName = contactData.businessName;
      }

      const { data } = await axiosInstance.post("/contacts", dataToSend);
      return data;
    },
    onSuccess: () => {
      // Invalidar la caché de contactos para refrescar la lista
      queryClient.invalidateQueries(["contacts"]);
      toast.success("Cliente creado exitosamente");
    },
    onError: (error) => {
      console.error("Error al crear cliente:", error);
      toast.error("Error al crear el cliente. Inténtalo de nuevo.");
    },
  });
}

// Hook para eliminar un contacto
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId) => {
      await axiosInstance.delete(`/contacts/delete/${contactId}`);
      return contactId;
    },
    onSuccess: () => {
      // Invalidar la caché de contactos para refrescar la lista
      queryClient.invalidateQueries(["contacts"]);
      toast.success("Cliente eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar el cliente. Inténtalo de nuevo.");
    },
  });
}
