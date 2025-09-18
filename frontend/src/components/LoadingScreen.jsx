import React from "react";

export default function LoadingScreen({ text = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <div className="text-center text-lg font-semibold text-blue-700">
          {text}
        </div>
      </div>
    </div>
  );
}
