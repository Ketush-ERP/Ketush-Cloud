import { useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";
import toast from "react-hot-toast";

export function useProducts({ offset, pageSize, search, supplierId }) {
  return useQuery({
    queryKey: ["products", offset, pageSize, search, supplierId],
    queryFn: async () => {
      // Agregar filtros
      const params = new URLSearchParams();
      params.append("offset", offset);
      params.append("limit", pageSize);

      if (search) {
        params.append("query", search);
      }

      if (supplierId) {
        params.append("supplierId", supplierId);
      }

      // Construir URL con parámetros

      if (search || supplierId) {
        const url = `/products/search?${params.toString()}`;
        try {
          const { data } = await axiosInstance.get(url);
          return data;
        } catch (error) {
          // Si es un 404 y hay búsqueda o filtro por proveedor, significa que no se encontraron productos
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
      } else {
        // Solo paginación sin filtros
        const url = `/products?${params.toString()}`;
        const { data } = await axiosInstance.get(url);
        return data;
      }
    },
    keepPreviousData: true,
    enabled: !!offset && !!pageSize,
  });
}
