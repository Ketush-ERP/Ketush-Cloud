import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "stores/useAuthStore";
import { useVerifyToken } from "hooks/useAuthApi";
import LoadingScreen from "components/LoadingScreen";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { data, error, isLoading } = useVerifyToken(token);
  const { logout } = useAuthStore();

  useEffect(() => {
    if (!token) {
      logout();
      navigate("/auth/login");
    }
    if (error) {
      logout();
      navigate("/auth/login");
    }
  }, [token, error, logout, navigate]);

  if (isLoading) {
    return <LoadingScreen text="Verificando sesión..." />;
  }

  // Si el token es válido, renderiza los hijos (rutas protegidas)
  return <Outlet />;
}
