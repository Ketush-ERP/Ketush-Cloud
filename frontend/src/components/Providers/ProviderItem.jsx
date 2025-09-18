import React from "react";
import { Link } from "react-router-dom";
import { useProviderPrefetch } from "hooks/useProviderDetail";
import {
  FaTruck,
  FaPercentage,
  FaHashtag,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ProviderItem = ({ provider }) => {
  const prefetchProvider = useProviderPrefetch();

  return (
    <Link
      to={`${provider.id}`}
      onMouseEnter={() => prefetchProvider(provider.id)}
      className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative p-3 sm:p-4 lg:p-6">
        {/* Provider Name and Status */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors duration-300">
            <FaTruck className="text-blue-600 group-hover:text-blue-700 text-lg sm:text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 group-hover:text-white truncate transition-colors duration-300">
              {provider.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:text-green-900 transition-colors duration-300">
                Activo
              </span>
              <span className="text-xs text-gray-500 group-hover:text-blue-100 transition-colors duration-300">
                Proveedor
              </span>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Profit Margin */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 group-hover:from-green-100 group-hover:to-green-200 rounded-lg p-2 sm:p-3 transition-all duration-300">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <FaPercentage className="text-green-600 group-hover:text-green-700 text-xs sm:text-sm" />
              <span className="text-xs font-medium text-green-700 group-hover:text-green-800 transition-colors duration-300">
                Margen
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-green-800 group-hover:text-green-900 transition-colors duration-300">
              {provider.profitMargin ?? 0}%
            </p>
          </div>

          {/* Provider Code */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 group-hover:from-purple-100 group-hover:to-purple-200 rounded-lg p-2 sm:p-3 transition-all duration-300">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <FaHashtag className="text-purple-600 group-hover:text-purple-700 text-xs sm:text-sm" />
              <span className="text-xs font-medium text-purple-700 group-hover:text-purple-800 transition-colors duration-300">
                Código
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-purple-800 group-hover:text-purple-900 transition-colors duration-300 truncate">
              {provider.code}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {/* Phone */}
          {provider.phone && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FaPhone className="text-gray-400 group-hover:text-blue-300 text-xs transition-colors duration-300 flex-shrink-0" />
              <span className="text-gray-600 group-hover:text-blue-100 transition-colors duration-300 truncate">
                {provider.phone}
              </span>
            </div>
          )}

          {/* Email */}
          {provider.email && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FaEnvelope className="text-gray-400 group-hover:text-blue-300 text-xs transition-colors duration-300 flex-shrink-0" />
              <span className="text-gray-600 group-hover:text-blue-100 transition-colors duration-300 truncate">
                {provider.email}
              </span>
            </div>
          )}

          {/* Address */}
          {provider.address && (
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FaMapMarkerAlt className="text-gray-400 group-hover:text-blue-300 text-xs transition-colors duration-300 flex-shrink-0" />
              <span className="text-gray-600 group-hover:text-blue-100 transition-colors duration-300 truncate">
                {provider.address}
              </span>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
        </div>

        {/* Click indicator */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-xs text-white font-medium">Ver detalles →</div>
        </div>
      </div>
    </Link>
  );
};

export default ProviderItem;
