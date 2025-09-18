import React, { useState } from "react";
import ErrorFallback from "components/ErrorFallback";
import { ProviderInfo } from "components/Provider/ProviderInfo";
import { ProviderProducts } from "components/Provider/ProviderProducts";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router";

const ProviderPage = () => {
  const { id } = useParams();
  const [refreshProductsKey, setRefreshProductsKey] = useState(0);

  const handleProfitMarginUpdated = () => {
    setRefreshProductsKey((k) => k + 1);
  };

  const handleProductsUploaded = () => {
    setRefreshProductsKey((k) => k + 1);
  };

  return (
    <div className="py-6">
      <h1 className="font-bold text-center text-3xl mb-2">Proveedor:</h1>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ProviderInfo
          id={id}
          onProfitMarginUpdated={handleProfitMarginUpdated}
        />
      </ErrorBoundary>
      <ProviderProducts
        providerId={id}
        refreshKey={refreshProductsKey}
        onUploadSuccess={handleProductsUploaded}
      />
    </div>
  );
};

export default ProviderPage;
