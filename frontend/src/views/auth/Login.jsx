import LoginForm from "components/Forms/LoginForm";
import React from "react";
import { useNavigate } from "react-router-dom"; // <-- así se importa
import useAuthStore from "stores/useAuthStore";
import { FaUser } from "react-icons/fa";
import { useLogin } from "hooks/useAuthApi";

export default function Login() {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const { mutate: login, isLoading, error } = useLogin();
  const handleLogin = (data) => {
    login(data, {
      onSuccess: (res) => {
        // Guarda el token y usuario
        console.log(res);
        localStorage.setItem("token", res.token);
        loginStore(res.user); // Guarda usuario en zustand
        navigate("/admin/dashboard");
      },
      onError: (err) => {
        alert("Credenciales incorrectas");
      },
    });
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <div className="text-blue-600 text-center my-4 flex items-center justify-center flex-col font-bold">
                <FaUser />
                <p>Iniciar sesión en el sistema</p>
              </div>
              <LoginForm onSubmit={handleLogin} />
              {isLoading && <p>Iniciando sesión...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
