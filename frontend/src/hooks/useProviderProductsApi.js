import { useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

export function useProviderProducts({
  supplierId,
  offset = 1,
  pageSize = 100,
  search = "",
  refreshKey = 0,
}) {
  return useQuery({
    queryKey: [
      "providerProducts",
      supplierId,
      offset,
      pageSize,
      search,
      refreshKey,
    ],
    queryFn: async () => {
      let url = `/products/search?supplierId=${supplierId}&offset=${offset}&limit=${pageSize}`;
      if (search) {
        url = `/products/search?supplierId=${supplierId}&query=${encodeURIComponent(search)}&offset=${offset}&limit=${pageSize}`;
      }

      try {
        const { data } = await axiosInstance.get(url);
        return data;
      } catch (error) {
        // Si es un 404, significa que no se encontraron productos
        if (error.response?.status === 404) {
          return {
            data: [],
            meta: {
              total: 0,
              offset: offset,
              limit: pageSize,
            },
          };
        }
        // Para otros errores, los propagamos
        throw error;
      }
    },
    keepPreviousData: true,
    enabled: !!supplierId && !!offset && !!pageSize,
  });
}
