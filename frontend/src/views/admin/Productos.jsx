import React, { useState, useEffect } from "react";
import ErrorFallback from "components/ErrorFallback";
import { DataTable } from "components/Tables/DataTable";
import { ErrorBoundary } from "react-error-boundary";
import { useProducts } from "hooks/useProductsApi";
import { useProviders } from "hooks/useProvidersApi";
import LoadingScreen from "components/LoadingScreen";
import useProductsTableStore from "stores/useProductsTableStore";

export const Productos = () => {
  const {
    offset,
    pageSize,
    search,
    selectedSupplierId,
    setOffset,
    setPageSize,
    setSearch,
    setSelectedSupplierId,
    clearFilters,
  } = useProductsTableStore();

  const { data, isLoading, isError, error } = useProducts({
    offset,
    pageSize,
    search,
    supplierId: selectedSupplierId,
  });

  // Hook para obtener la lista de proveedores
  const { data: providersData, isLoading: isLoadingProviders } = useProviders();

  const [searchInput, setSearchInput] = useState(search);

  // Sincronizar el input de búsqueda con el estado del store
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Limpiar el input cuando se limpien los filtros
  useEffect(() => {
    if (!search && !selectedSupplierId) {
      setSearchInput("");
    }
  }, [search, selectedSupplierId]);

  const productColumns = [
    { field: "code", headerName: "Código", width: 130 },
    { field: "description", headerName: "Descripción", width: 350 },
    {
      field: "basePrice",
      headerName: "Precio base",
      width: 130,
      type: "number",
    },
    {
      field: "price",
      headerName: "Precio Final",
      width: 130,
      type: "number",
    },

    {
      field: "commissionPrice",
      headerName: "Precio Comisión",
      width: 130,
      type: "number",
    },
    {
      field: "profitMargin",
      headerName: "Margen %",
      width: 110,
      type: "number",
    },
    // Agregar columna de proveedor si está disponible
    ...(data?.data?.[0]?.supplier
      ? [
          {
            field: "supplier",
            headerName: "Proveedor",
            width: 150,
          },
        ]
      : []),
    // {
    //   field: "available",
    //   headerName: "Disponible",
    //   width: 110,
    //   type: "boolean",
    // },
  ];

  // Mapea los datos de la API al formato que espera DataGrid
  const productRows = (data?.data || []).map((prod) => ({
    id: prod.id,
    code: prod.code,
    description: prod.description,
    price: prod.price,
    basePrice: prod.basePrice,
    commissionPrice: prod.commissionPrice,
    profitMargin: prod.profitMargin,
    // Agregar proveedor si está disponible
    ...(prod.supplier && { supplier: prod.supplier.name || prod.supplier }),
    // available: prod.available ? "Sí" : "No",
  }));

  console.log(data?.data);

  if (isLoading) return <LoadingScreen text="Cargando productos..." />;
  if (isError) return <ErrorFallback error={error} />;

  // Verificar si no hay productos (ya sea por búsqueda o porque no hay datos)
  const hasNoProducts = !data?.data || data.data.length === 0;
  const isSearchResult = (search || selectedSupplierId) && hasNoProducts;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-full shadow-lg mb-3">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-blue-800 drop-shadow mb-1">
          Listado de productos
        </h2>
        <p className="text-blue-900 text-sm">
          Gestión de productos registrados
        </p>
      </div>
      <div className="w-full max-w-6xl flex-1 overflow-y-auto">
        {/* Filtros de búsqueda */}
        <div className="mb-4 bg-white/90 p-4 rounded-xl shadow border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda por texto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Buscar producto
              </label>
              <input
                type="text"
                placeholder="Código o descripción..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setOffset(1);
                    setSearch(searchInput);
                  }
                }}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Filtro por proveedor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Proveedor
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                disabled={isLoadingProviders}
              >
                <option value="">Todos los proveedores</option>
                {isLoadingProviders ? (
                  <option disabled>Cargando proveedores...</option>
                ) : (
                  providersData?.data?.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Acciones
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOffset(1);
                    setSearch(searchInput);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Buscando..." : "Buscar"}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  title="Limpiar todos los filtros"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Información de filtros activos */}
          {(search || selectedSupplierId) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              <span>Filtros activos:</span>
              {search && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Búsqueda: "{search}"
                </span>
              )}
              {selectedSupplierId && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  Proveedor:{" "}
                  {providersData?.data?.find((p) => p.id === selectedSupplierId)
                    ?.name || "N/A"}
                </span>
              )}
            </div>
          )}
        </div>
        {isSearchResult ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No se encontraron productos
            </div>
            <div className="text-sm text-center mb-4">
              {search && selectedSupplierId && (
                <span>
                  Con la búsqueda "{search}" y el proveedor seleccionado
                </span>
              )}
              {search && !selectedSupplierId && (
                <span>Con la búsqueda "{search}"</span>
              )}
              {!search && selectedSupplierId && (
                <span>Para el proveedor seleccionado</span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable
              columns={productColumns}
              rows={productRows}
              pageSize={pageSize}
              rowCount={data?.meta?.total || 0}
              page={offset - 1} // 0-based para DataGrid
              paginationMode="server"
              onPageChange={(newPage) => {
                console.log("Productos onPageChange called with:", newPage); // Este log debería aparecer
                setOffset(newPage + 1); // Convertir de 0-based a 1-based
              }}
              onPageSizeChange={(newPageSize) => {
                console.log(
                  "Productos onPageSizeChange called with:",
                  newPageSize
                );
                setPageSize(newPageSize);
              }}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
