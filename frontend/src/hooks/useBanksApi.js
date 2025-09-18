import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

// Obtener todos los bancos
export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: () => axiosInstance.get("/bank").then((res) => res.data),
  });
}

// Crear un nuevo banco
export function useCreateBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post("/bank", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidar la query de bancos para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}

// Eliminar un banco
export function useDeleteBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      axiosInstance
        .patch(`/bank/update/${id}`, { available: false })
        .then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}
