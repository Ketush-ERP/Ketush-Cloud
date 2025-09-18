import React from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

const CreateProviderButton = () => {
  return (
    <Link
      className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-full w-full text-white text-center rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center justify-center p-6 sm:p-8"
      to={"crear"}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center mb-4 transition-all duration-300">
          <FaPlus className="text-white text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Text */}
        <h2 className="font-bold text-lg sm:text-xl lg:text-2xl mb-2 group-hover:text-blue-50 transition-colors duration-300">
          Añadir proveedor
        </h2>
        <p className="font-medium text-sm sm:text-base text-blue-100 group-hover:text-blue-50 transition-colors duration-300">
          Crear un nuevo proveedor
        </p>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
    </Link>
  );
};

export default CreateProviderButton;
