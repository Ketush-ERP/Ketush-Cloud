import useAuthStore from "stores/useAuthStore";

export default function useAuth() {
  // Supón que tienes un estado 'isAuthenticated' en tu store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Puedes agregar lógica adicional aquí si usas React Query para validar tokens, etc.
  return { isAuthenticated };
}
