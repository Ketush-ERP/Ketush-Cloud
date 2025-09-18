import { Outlet, Navigate } from "react-router-dom";
import { useVerifyToken } from "hooks/useAuthApi";
import LoadingScreen from "components/LoadingScreen";

export default function PublicRoute() {
  const token = localStorage.getItem("token");
  const { data, isLoading } = useVerifyToken(token);

  if (isLoading && token) {
    return <LoadingScreen text="Verificando sesión..." />;
  }

  if (data && token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
