import React from "react";
import ErrorFallback from "components/ErrorFallback";
import ProvidersContainer from "components/Providers/ProvidersContainer";
import ProviderItem from "components/Providers/ProviderItem";
import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "components/LoadingScreen";
import { FaTruck } from "react-icons/fa";
import { useProvidersFilterBySupplier } from "hooks/useProvidersApi";

export const Proveedores = () => {
  const { data, isLoading, isError, error } = useProvidersFilterBySupplier();

  if (isLoading) return <LoadingScreen text="Cargando proveedores..." />;
  if (isError) return <ErrorFallback error={error} />;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 py-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-full shadow-lg mb-3">
            <FaTruck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 drop-shadow mb-1">
            Todos los proveedores
          </h1>
          <p className="text-blue-900 text-sm">
            Gestión de proveedores registrados
          </p>
        </div>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ProvidersContainer>
            {(data?.data || []).map((provider) => (
              <ProviderItem key={provider.id} provider={provider} />
            ))}
          </ProvidersContainer>
        </ErrorBoundary>
      </div>
    </div>
  );
};
