import React from "react";
import { useProviderDetail } from "hooks/useProviderDetail";
import LoadingScreen from "components/LoadingScreen";
import ErrorFallback from "components/ErrorFallback";
import { Info } from "./Info";
import { EditProfitMargin } from "./EditProfitMargin";

export const ProviderInfo = ({ id, onProfitMarginUpdated }) => {
  const { data: provider, isLoading, isError, error } = useProviderDetail(id);

  if (isLoading) return <LoadingScreen text="Cargando proveedor..." />;
  if (isError) return <ErrorFallback error={error} />;
  if (!provider) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
      {/* Header simple con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-5">
        <h2 className="text-2xl sm:text-3xl font-bold">{provider.name}</h2>
        <p className="text-blue-100 text-xs mt-1">
          Información general del proveedor
        </p>
      </div>

      {/* Bloques de información */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base text-gray-800">
          {/* Bloque 1 */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
            <Info
              label="Código"
              value={provider.code}
              highlight="font-bold text-blue-700"
            />
            <Info
              label="Razón social"
              value={provider.businessName}
              highlight="font-semibold text-indigo-700"
            />
            <Info label="Tipo documento" value={provider.documentType} />
            <Info label="N° documento" value={provider.documentNumber} />
            <Info label="Condición IVA" value={provider.ivaCondition} />
            <EditProfitMargin
              id={id}
              currentValue={provider.profitMargin}
              onUpdated={onProfitMarginUpdated}
            />
          </div>
          {/* Bloque 2 */}
          <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
            <Info
              label="Teléfono"
              value={provider.phone}
              highlight="font-semibold text-blue-700"
            />
            <Info
              label="Email"
              value={provider.email}
              highlight="font-semibold text-indigo-700"
            />
            <Info label="Dirección" value={provider.address} />
          </div>
        </div>
      </div>
    </div>
  );
};
