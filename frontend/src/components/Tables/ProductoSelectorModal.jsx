import React, { useState, useMemo, useEffect, useRef } from "react";
import { DataTable } from "components/Tables/DataTable";
import { useProducts } from "hooks/useProductsApi";
import { useProviders } from "hooks/useProvidersApi";
import { useProductSelectorStore } from "stores/useProductSelectorStore";

export default function ProductoSelectorModal({
  open,
  onClose,
  onSelect,
  productosAgregadosCodigos = [],
}) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [allLoadedProducts, setAllLoadedProducts] = useState([]);
  const prevProducts = useRef([]);

  // Usar el store de Zustand para manejar las selecciones
  const {
    selectedProductIds,
    toggleProductSelection,
    toggleAllVisible,
    clearAllSelections,
    isProductSelected,
    getSelectedCount,
  } = useProductSelectorStore();

  // Hook para obtener la lista de proveedores
  const { data: providersData, isLoading: isLoadingProviders } = useProviders();

  // Usar el hook de productos para traer productos según la búsqueda
  const { data: productosData, isLoading } = useProducts({
    offset: 1,
    pageSize: 100, // Traer productos para facturación (máximo permitido en versión MIT)
    search: searchInput, // Búsqueda directa en la API
    supplierId: selectedSupplierId, // Filtro por proveedor
  });

  // Filtrar productos que no estén agregados y mapear a la estructura esperada
  const products = useMemo(() => {
    if (allLoadedProducts.length === 0) return [];

    // Obtener todos los productos que no estén agregados
    const availableProducts = allLoadedProducts.filter(
      (producto) => !productosAgregadosCodigos.includes(producto.code)
    );

    // Crear un Set con los IDs de productos seleccionados para búsqueda rápida
    const selectedIdsSet = new Set(selectedProductIds);

    // Filtrar por proveedor si hay selectedSupplierId
    let supplierFilteredProducts = availableProducts;
    if (selectedSupplierId) {
      supplierFilteredProducts = availableProducts.filter(
        (producto) => producto.supplierId === selectedSupplierId
      );
    }

    // Filtrar por búsqueda si hay searchInput
    let filteredProducts = supplierFilteredProducts;
    if (searchInput.trim()) {
      const searchLower = searchInput.toLowerCase();
      filteredProducts = supplierFilteredProducts.filter(
        (producto) =>
          (producto.code || "").toLowerCase().includes(searchLower) ||
          (producto.description || "").toLowerCase().includes(searchLower)
      );
    }

    // Detectar si no hay productos del proveedor actual
    const noProductsForCurrentSupplier =
      selectedSupplierId && supplierFilteredProducts.length === 0;
    const noProductsForCurrentSearch =
      searchInput.trim() && filteredProducts.length === 0;

    // Agregar productos seleccionados que no estén en la búsqueda actual
    const selectedProductsNotInSearch = availableProducts.filter((producto) => {
      // Solo incluir si está seleccionado
      if (!selectedIdsSet.has(producto.id)) return false;

      // Si no hay búsqueda, no incluir (ya está en filteredProducts)
      if (!searchInput.trim()) return false;

      // Solo incluir si no coincide con la búsqueda actual
      const searchLower = searchInput.toLowerCase();
      const matchesSearch =
        (producto.code || "").toLowerCase().includes(searchLower) ||
        (producto.description || "").toLowerCase().includes(searchLower);

      return !matchesSearch;
    });

    // Si no hay productos del proveedor actual, mostrar solo productos seleccionados
    if (noProductsForCurrentSupplier || noProductsForCurrentSearch) {
      return selectedProductsNotInSearch.map((producto) => ({
        id: producto.id,
        codigo: producto.code || "",
        nombre: producto.description || "",
        precio: producto.finalPrice || producto.price || 0,
        precioBase: producto.price || 0,
        commissionPrice: producto.commissionPrice || 0,
        selected: isProductSelected(producto.id),
        isInCurrentSearch: false, // No está en la búsqueda actual
      }));
    }

    // Combinar productos filtrados con productos seleccionados
    const allProducts = [...filteredProducts, ...selectedProductsNotInSearch];

    return allProducts.map((producto) => {
      // Verificar si el producto está en la búsqueda actual
      const isInCurrentSearch =
        !searchInput.trim() ||
        (producto.code || "")
          .toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        (producto.description || "")
          .toLowerCase()
          .includes(searchInput.toLowerCase());

      return {
        id: producto.id,
        codigo: producto.code || "",
        nombre: producto.description || "",
        precio: producto.finalPrice || producto.price || 0,
        precioBase: producto.price || 0,
        commissionPrice: producto.commissionPrice || 0,
        selected: isProductSelected(producto.id),
        isInCurrentSearch,
      };
    });
  }, [
    allLoadedProducts,
    productosAgregadosCodigos,
    selectedProductIds,
    searchInput,
    selectedSupplierId,
  ]);

  // Mantener productos seleccionados independientemente del filtro de búsqueda
  const selectedProducts = useMemo(() => {
    if (allLoadedProducts.length === 0) {
      return [];
    }

    const result = Array.from(selectedProductIds)
      .map((id) => {
        const producto = allLoadedProducts.find((p) => p.id === id);

        if (!producto) {
          return null;
        }

        if (productosAgregadosCodigos.includes(producto.code)) {
          return null;
        }

        const resultProduct = {
          id: producto.id,
          codigo: producto.code || "",
          nombre: producto.description || "",
          precio: producto.finalPrice || producto.price || 0,
          precioBase: producto.price || 0,
          commissionPrice: producto.commissionPrice || 0,
        };

        return resultProduct;
      })
      .filter(Boolean); // Eliminar los nulls

    return result;
  }, [allLoadedProducts, productosAgregadosCodigos, selectedProductIds]);

  // Manejar selección/deselección individual
  const handleToggleSelection = (productId) => {
    toggleProductSelection(productId);
  };

  // Manejar selección/deselección de todos los productos visibles
  const handleToggleAll = () => {
    const visibleProductIds = products.map((p) => p.id);
    toggleAllVisible(visibleProductIds);
  };

  // Confirmar selección
  const handleConfirmSelection = () => {
    // Agregar todos los productos seleccionados
    selectedProducts.forEach((product) => {
      onSelect(product);
    });

    // Limpiar selección y cerrar modal
    clearAllSelections();
    onClose();
  };

  // Limpiar búsqueda y filtros
  const handleClearFilters = () => {
    setSearchInput("");
    setSelectedSupplierId("");
  };

  // Prevenir envío del formulario al presionar Enter en la búsqueda
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Validar que la búsqueda no empiece con espacio en blanco
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    // Solo permitir si no empieza con espacio en blanco
    if (value === "" || !value.startsWith(" ")) {
      setSearchInput(value);
    }
  };

  // Mantener actualizada la lista de todos los productos cargados
  useEffect(() => {
    // Si hay datos (incluyendo array vacío), actualizar la lista
    if (productosData?.data !== undefined) {
      if (productosData.data.length === 0) {
        // Si es array vacío, mantener productos existentes pero mostrar que no hay coincidencias
        // NO limpiar allLoadedProducts para mantener productos seleccionados
      } else {
        setAllLoadedProducts((prevProducts) => {
          // Crear un Map para evitar duplicados por ID
          const productsMap = new Map();

          // Agregar productos existentes
          prevProducts.forEach((product) => {
            productsMap.set(product.id, product);
          });

          // Agregar nuevos productos (sobrescribirán los existentes si tienen el mismo ID)
          productosData.data.forEach((product) => {
            productsMap.set(product.id, product);
          });

          const result = Array.from(productsMap.values());
          return result;
        });
      }
    }
  }, [productosData]);

  // Limpiar selecciones cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      clearAllSelections();
      setAllLoadedProducts([]); // Limpiar también la lista de productos cargados
      prevProducts.current = []; // Limpiar también la referencia
    }
  }, [open, clearAllSelections]);

  // Ya no necesitamos este useEffect porque siempre acumulamos productos

  // Agrega un checkbox de selección a cada fila
  const columns = [
    {
      field: "seleccionar",
      headerName: "",
      width: 80,
      sortable: false,
      renderHeader: () => {
        const visibleProductIds = products.map((p) => p.id);
        const allVisibleSelected =
          visibleProductIds.length > 0 &&
          visibleProductIds.every((id) => isProductSelected(id));
        const someVisibleSelected = visibleProductIds.some((id) =>
          isProductSelected(id)
        );

        return (
          <div className="flex justify-center items-center h-full">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(input) => {
                if (input)
                  input.indeterminate =
                    someVisibleSelected && !allVisibleSelected;
              }}
              onChange={handleToggleAll}
              className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
          </div>
        );
      },
      renderCell: (params) => (
        <div className="flex justify-center items-center h-full">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isProductSelected(params.row.id)}
              onChange={() => handleToggleSelection(params.row.id)}
              className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            {!params.row.isInCurrentSearch &&
              isProductSelected(params.row.id) && (
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  title="Producto seleccionado de búsqueda anterior"
                ></div>
              )}
          </div>
        </div>
      ),
    },
    { field: "codigo", headerName: "Código", width: 120 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    {
      field: "precio",
      headerName: "Precio",
      width: 120,
      type: "number",
      renderCell: (params) => (
        <span className="font-mono">
          ${Number(params.value).toLocaleString()}
        </span>
      ),
    },
    {
      field: "commissionPrice",
      headerName: "Precio Comisión",
      width: 140,
      type: "number",
      renderCell: (params) => (
        <span className="font-mono">
          ${Number(params.value).toLocaleString()}
        </span>
      ),
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            Seleccionar Productos
          </h2>
          <button
            onClick={() => {
              clearAllSelections();
              onClose();
            }}
            className="text-2xl font-bold px-2 hover:text-gray-600 transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mb-4 space-y-3 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Búsqueda por texto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Buscar producto
              </label>
              <input
                type="text"
                placeholder="Código o descripción..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>

          {/* Contador y botón limpiar */}
          <div className="flex gap-2 items-center justify-between">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              {getSelectedCount()} seleccionados{" "}
              {searchInput &&
                `(${
                  products.filter((p) => isProductSelected(p.id)).length
                } visibles)`}
            </div>
            {(searchInput || selectedSupplierId) && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Mensaje informativo sobre productos seleccionados */}
          {searchInput.trim() &&
            Array.from(selectedProductIds).some((id) => {
              const producto = allLoadedProducts.find((p) => p.id === id);
              if (!producto) return false;
              const searchLower = searchInput.toLowerCase();
              return (
                !(producto.code || "").toLowerCase().includes(searchLower) &&
                !(producto.description || "")
                  .toLowerCase()
                  .includes(searchLower)
              );
            }) && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Productos seleccionados de búsquedas anteriores se muestran
                    con fondo azul
                  </span>
                </div>
              </div>
            )}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-gray-600">Cargando productos...</div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-lg font-medium mb-2">
                {searchInput || selectedSupplierId
                  ? "No se encontraron productos"
                  : "No hay productos disponibles"}
              </div>
              <div className="text-sm text-center">
                {searchInput || selectedSupplierId
                  ? "Intenta con otros términos de búsqueda o cambia el filtro de proveedor"
                  : "Todos los productos ya han sido agregados"}
              </div>
              {(searchInput || selectedSupplierId) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
              <DataTable
                columns={columns}
                toolbar={false}
                rows={products}
                pageSize={100}
                rowCount={products.length}
                page={0}
                paginationMode="client"
                onPageSizeChange={(newPageSize) => {
                  // Permitir cambiar el tamaño de página
                  console.log("Cambiando tamaño de página a:", newPageSize);
                }}
                getRowClassName={(params) => {
                  let className =
                    "cursor-pointer hover:bg-gray-50 transition-colors duration-200 select-none";
                  if (
                    !params.row.isInCurrentSearch &&
                    isProductSelected(params.row.id)
                  ) {
                    className += " bg-blue-50 border-l-4 border-l-blue-500";
                  }
                  return className;
                }}
                onRowClick={(params) => {
                  // Toggle selection al hacer clic en la fila
                  handleToggleSelection(params.row.id);
                }}
              />
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {getSelectedCount() > 0 && (
              <span>
                Productos seleccionados: <strong>{getSelectedCount()}</strong>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearAllSelections();
                onClose();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={getSelectedCount() === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Agregar {getSelectedCount() > 0 ? `(${getSelectedCount()})` : ""}{" "}
              seleccionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
