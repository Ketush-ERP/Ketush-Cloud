import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

// Obtener todos los usuarios
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => axiosInstance.get("/auth").then((res) => res.data),
  });
}

// Crear un nuevo usuario
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post("/auth/register", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidar la query de usuarios para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Eliminar un usuario
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      axiosInstance.delete(`/auth/delete/${id}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidar la query de usuarios para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
