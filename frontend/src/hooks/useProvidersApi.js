import { useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";
import toast from "react-hot-toast";

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
