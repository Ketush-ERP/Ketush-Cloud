import React from "react";

// components

export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200">
      <div className="relative flex flex-col items-center justify-center w-full max-w-xl p-8 rounded-2xl shadow-2xl border border-blue-200 bg-white/90 backdrop-blur-md">
        {/* Icono temático */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-full shadow-lg">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                strokeWidth="3"
                className="stroke-white/40"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M16 20a8 8 0 1116 0c0 4.418-3.582 8-8 8s-8-3.582-8-8z"
                className="stroke-white"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M24 28v8"
                className="stroke-white"
              />
              <circle cx="24" cy="40" r="2" className="fill-white" />
            </svg>
          </div>
        </div>
        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-2 drop-shadow-lg text-center">
          Menú de inicio
        </h1>
        {/* Subtítulo */}
        <p className="text-lg sm:text-2xl text-gray-700 font-medium text-center mb-4">
          Bienvenido al sistema de gestión{" "}
          <span className="font-bold text-blue-600">Ketush</span>
        </p>
        {/* Línea decorativa */}
        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 mx-auto mb-2" />
        {/* Detalles decorativos sutiles */}
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl" />
      </div>
    </div>
  );
}
