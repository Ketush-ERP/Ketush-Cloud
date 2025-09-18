import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

export function useProviderDetail(id) {
  return useQuery({
    queryKey: ["providerDetail", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/contacts/id/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5,
  });
}

// Prefetch helper
export function useProviderPrefetch() {
  const queryClient = useQueryClient();
  return (id) =>
    queryClient.prefetchQuery({
      queryKey: ["providerDetail", id],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/contacts/id/${id}`);
        return data;
      },
      staleTime: 1000 * 60,
      cacheTime: 1000 * 60 * 5,
    });
}
