import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

// Obtener todas las tarjetas
export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => axiosInstance.get("/card").then((res) => res.data),
  });
}

// Crear una nueva tarjeta
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/card", data);
      if (res?.data?.status === 400)
        return {
          message: res?.data?.message,
        }; // 🔥 esto es lo que vas a tener en `mutation.data`
    },
    onSuccess: (data) => {
      // `data` es la respuesta del backend
      console.log("Card creada:", data);

      // refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (error) => {
      console.error("Error al crear la card:", error);
    },
  });
}

// Eliminar una tarjeta
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      axiosInstance
        .patch(`/card/update/${id}`, { available: false })
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidar la query de tarjetas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}
