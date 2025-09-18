import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "api/axiosInstance";

export default function InvoiceClient({ contactId }) {
  // Debug: verificar que se reciba el contactId
  console.log("InvoiceClient - contactId recibido:", contactId);
  console.log("InvoiceClient - Tipo de contactId:", typeof contactId);
  console.log("InvoiceClient - ¿contactId existe?:", !!contactId);

  // Hook para obtener la información del cliente
  const {
    data: clientData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client", contactId],
    queryFn: async () => {
      console.log(
        "InvoiceClient - Ejecutando queryFn con contactId:",
        contactId
      );
      if (!contactId) return null;
      const { data } = await axiosInstance.get(`/contacts/id/${contactId}`);
      console.log("InvoiceClient - Respuesta del API:", data);
      return data;
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Debug: verificar el estado del hook
  console.log("InvoiceClient - Estado del hook:", {
    isLoading,
    error,
    clientData,
    enabled: !!contactId,
  });

  // Si no hay contactId, no mostrar nada
  if (!contactId) {
    console.log("InvoiceClient - No hay contactId, no se renderiza");
    return null;
  }

  console.log(
    "InvoiceClient - Renderizando componente con contactId:",
    contactId
  );

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Información del Cliente
          </h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Información del Cliente
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p>Error al cargar la información del cliente</p>
            <p className="text-sm mt-1">Intenta recargar la página</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos del cliente
  if (!clientData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Información del Cliente
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p>No se encontró información del cliente</p>
          </div>
        </div>
      </div>
    );
  }

  // Función para obtener la etiqueta de la condición IVA
  const getIvaConditionLabel = (ivaCondition) => {
    const ivaMap = {
      responsable_inscripto: "IVA Responsable Inscripto",
      monotributista: "Monotributista",
      exento: "Exento",
      consumidor_final: "Consumidor Final",
      no_categorizado: "No Categorizado",
    };
    return ivaMap[ivaCondition] || ivaCondition || "N/A";
  };

  // Función para obtener la etiqueta del tipo de documento
  const getDocumentTypeLabel = (documentType) => {
    const documentMap = {
      CUIT: "CUIT",
      CUIL: "CUIL",
      DNI: "DNI",
      CDI: "CDI",
      PASAPORTE: "Pasaporte",
    };
    return documentMap[documentType] || documentType || "N/A";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Información del Cliente
            </h2>
            <p className="text-gray-600">
              Datos del cliente asociado a esta factura
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nombre / Razón Social
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {clientData.businessName || clientData.name || "N/A"}
              </p>
            </div>

            {clientData.businessName && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre de Fantasía
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {clientData.name || "N/A"}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Tipo de Documento
              </label>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full ml-1 bg-purple-100 text-purple-800">
                {getDocumentTypeLabel(clientData.documentType)}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Número de Documento
              </label>
              <p className="text-lg font-semibold text-gray-900 font-mono">
                {clientData.documentNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Información de contacto y fiscal */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Condición IVA
              </label>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full ml-1 bg-green-100 text-green-800">
                {getIvaConditionLabel(clientData.ivaCondition)}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Teléfono
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {clientData.phone || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg font-semibold text-gray-900">
                {clientData.email || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Dirección
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {clientData.address || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional si existe */}
        {clientData.observation && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-500">
              Observaciones
            </label>
            <p className="text-gray-900 mt-1">{clientData.observation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
