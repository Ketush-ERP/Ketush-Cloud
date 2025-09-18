import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

// Registrar usuario
export function useRegister() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post("/auth/register", data).then((res) => res.data),
  });
}

// Login usuario
export function useLogin() {
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post("/auth/login", data).then((res) => res.data.data),
  });
}

// Verificar token
export function useVerifyToken(token) {
  return useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () =>
      axiosInstance
        .get("/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data),
    enabled: !!token,
    retry: false,
  });
}
