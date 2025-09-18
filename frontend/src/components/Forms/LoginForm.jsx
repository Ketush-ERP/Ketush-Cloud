import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import loginSchema from "../../validation/loginSchema";
import { IoMailSharp } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm({ onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      {/* Email Field */}
      <div className="mb-6">
        <label className="block text-blue-700 text-sm font-semibold mb-3 flex items-center gap-2">
          <IoMailSharp className="text-blue-600" size={20} />
          Correo electrónico
        </label>
        <div className="relative">
          <input
            type="email"
            {...register("email")}
            className={`w-full px-5 py-3 border-2 rounded-xl text-gray-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
              errors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-blue-200 hover:border-blue-400"
            }`}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && (
            <div className="absolute -bottom-6 left-0">
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-8">
        <label className="block text-blue-700 text-sm font-semibold mb-3 flex items-center gap-2">
          <RiLockPasswordFill className="text-blue-600" size={20} />
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`w-full px-5 py-3 pr-12 border-2 rounded-xl text-gray-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
              errors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-blue-200 hover:border-blue-400"
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {errors.password && (
            <div className="absolute -bottom-6 left-0">
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.password.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mb-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Iniciar sesión
          </span>
        </button>
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-blue-500">Sistema de gestión Ketush</p>
      </div>
    </form>
  );
}
