import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";
import toast from "react-hot-toast";

export function useUpdateProviderProfitMargin(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profitMargin) => {
      const value = Number(profitMargin);
      if (isNaN(value) || value < 0 || value > 1000) {
        throw new Error(
          "El porcentaje debe ser un número válido entre 0 y 1000."
        );
      }
      await axiosInstance.patch(`/contacts/update/percentage-gain/${id}`, {
        profitMargin: value,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providerDetail", id] });
      queryClient.invalidateQueries({
        queryKey: ["providerProducts", id],
      });
      toast.success("Margen de ganancia actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error al actualizar margen de ganancia:", error);
      toast.error(
        error.message || "Error al actualizar el margen de ganancia."
      );
    },
  });
}
