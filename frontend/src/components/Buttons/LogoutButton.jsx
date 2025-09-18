import React from "react";
import useAuthStore from "stores/useAuthStore";

export const LogoutButton = () => {
  const { logout } = useAuthStore();
  return (
    <button
      onClick={logout}
      className="border-2 rounded-md p-4 border-blue-400 font-semibold  hover:text-white hover:bg-blue-400 transition-colors duration-300"
    >
      Cerrar sesión
    </button>
  );
};
