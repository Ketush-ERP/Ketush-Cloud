import { useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

export function useProviders({ search = "" } = {}) {
  return useQuery({
    queryKey: ["providers", search],
    queryFn: async () => {
      let url = `/contacts`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const { data } = await axiosInstance.get(url);
      // Filtra solo proveedores (SUPPLIER)
      return {
        ...data,
        data: (data.data || []).filter((item) => item.type === "SUPPLIER"),
      };
    },
    cacheTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useProvidersFilterBySupplier() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/contacts/search?&type=SUPPLIER`
      );
      return data;
    },
    cacheTime: 1000 * 60 * 5, // 5 minutos
  });
}
