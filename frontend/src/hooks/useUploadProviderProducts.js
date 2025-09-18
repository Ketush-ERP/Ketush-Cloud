import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

export function useUploadProviderProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file, containsVAT = false }) => {
      const formData = new FormData();
      formData.append("file", file);
      const url = `/products/upload?id=${id}&containsVAT=${containsVAT}`;
      const { data } = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar la caché de productos del proveedor específico
      queryClient.invalidateQueries({
        queryKey: ["providerProducts", variables.id],
      });
    },
  });
}
