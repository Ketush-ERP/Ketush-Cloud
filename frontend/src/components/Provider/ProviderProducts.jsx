import ErrorFallback from "components/ErrorFallback";
import { DataTable } from "components/Tables/DataTable";
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UploadProductsButton } from "./UploadProductsButton";
import { useProviderProducts } from "hooks/useProviderProductsApi";
import LoadingScreen from "components/LoadingScreen";
import useProviderProductsTableStore from "stores/useProviderProductsTableStore";

export const ProviderProducts = ({
  providerName,
  providerId,
  onUploadSuccess,
  refreshKey = 0,
}) => {
  const { offset, pageSize, search, setOffset, setPageSize, setSearch } =
    useProviderProductsTableStore();

  console.log(
    "ProviderProducts - page:",
    offset,
    "pageSize:",
    pageSize,
    "search:",
    search,
    "providerId:",
    providerId
  );

  const { data, isLoading, isError, error } = useProviderProducts({
    supplierId: providerId,
    offset,
    pageSize,
    search,
    refreshKey,
  });

  const [searchInput, setSearchInput] = useState(search);

  // Referencia para mantener la posición del scroll
  const scrollContainerRef = React.useRef(null);

  // Mantener la posición del scroll cuando cambian los datos
  React.useEffect(() => {
    if (scrollContainerRef.current && !isLoading) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      // Usar requestAnimationFrame para asegurar que el DOM se ha actualizado
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }
      });
    }
  }, [data?.data?.length, isLoading]);

  const productColumns = [
    { field: "code", headerName: "Código", width: 130 },
    { field: "description", headerName: "Descripción", width: 350 },
    {
      field: "basePrice",
      headerName: "Precio Base",
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
      field: "profitMargin",
      headerName: "Margen %",
      width: 110,
      type: "number",
    },
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
    basePrice: prod.basePrice,
    price: prod.price,
    profitMargin: prod.profitMargin,
    //available: prod.available ? "Sí" : "No",
  }));

  if (isLoading)
    return <LoadingScreen text="Cargando productos del proveedor..." />;
  if (isError) return <ErrorFallback error={error} />;

  // Verificar si no hay productos
  const hasNoProducts = !data?.data || data.data.length === 0;
  const isSearchResult = search && hasNoProducts;

  return (
    <div className="w-full flex mt-2 flex-col items-center ">
      <h2 className="text-2xl font-bold mb-4">
        Productos del proveedor: {providerName}
      </h2>

      <div
        ref={scrollContainerRef}
        className="w-full max-w-6xl flex-1 overflow-y-auto"
      >
        <div className="mb-4 flex flex-col-reverse justify-between bg-white p-2 rounded-md items-center">
          <div className="flex-1 w-[50%] mr-4">
            <input
              type="text"
              placeholder="Buscar producto por código o descripción..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOffset(1);
                  setSearch(searchInput);
                }
              }}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
          <UploadProductsButton
            providerName={providerName}
            providerId={providerId}
            onSuccess={onUploadSuccess}
          />
        </div>

        {isSearchResult ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No se encontraron productos
            </div>
            <div className="text-sm">
              Intenta con otros términos de búsqueda
            </div>
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setOffset(1);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : hasNoProducts ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No hay productos cargados
            </div>
            <div className="text-sm">
              Este proveedor aún no tiene productos en el sistema
            </div>
          </div>
        ) : (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable
              columns={productColumns}
              rows={productRows}
              pageSize={pageSize}
              rowCount={data?.meta?.total || 0}
              page={offset - 1}
              paginationMode="server"
              onPageChange={(newPage) => {
                console.log(
                  "ProviderProducts onPageChange called with:",
                  newPage
                );
                setOffset(newPage + 1);
              }}
              onPageSizeChange={(newPageSize) => {
                console.log(
                  "ProviderProducts onPageSizeChange called with:",
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
