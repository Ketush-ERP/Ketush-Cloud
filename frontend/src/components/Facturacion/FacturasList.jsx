import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useVouchers } from "hooks/useVoucherApi";
import FacturaItem from "./FacturaItem";
import toast from "react-hot-toast";

/**
 * Componente para listar todas las facturas usando la API real
 * Permite filtrar por tipo de factura y navegar a los detalles
 */
export default function FacturasList() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("date"); // Nuevo estado para ordenamiento
  const [clientQueryInput, setClientQueryInput] = useState(""); // Valor del input
  const [clientQuery, setClientQuery] = useState(""); // Valor debounced para la API

  // Obtener facturas usando la API real con paginación del backend
  const {
    data: vouchersData,
    isLoading,
    error,
    refetch,
  } = useVouchers({
    type: selectedType || undefined,
    page: currentPage,
    pageSize: 20,
    clientQuery: clientQuery || undefined,
    enabled: true,
  });

  // Refetch automático cuando el componente se monta
  useEffect(() => {
    refetch();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Refetch automático cuando cambian los filtros o la página
  useEffect(() => {
    refetch();
  }, [selectedType, currentPage, clientQuery, refetch]);

  // Refetch automático cuando la página vuelve a tener foco (útil cuando se regresa de crear una factura)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  // Opciones de filtro por tipo de factura, presupuestos y notas
  const filterOptions = [
    { value: "", label: "Todos los documentos" },
    { value: "FACTURA_A", label: "Factura A" },
    { value: "FACTURA_B", label: "Factura B" },
    { value: "PRESUPUESTO", label: "Presupuesto" },
    { value: "NOTA_CREDITO_A", label: "Nota de Crédito A" },
    { value: "NOTA_CREDITO_B", label: "Nota de Crédito B" },
    { value: "NOTA_DEBITO_A", label: "Nota de Débito A" },
    { value: "NOTA_DEBITO_B", label: "Nota de Débito B" },
  ];

  // Ordenar facturas según la opción seleccionada
  const facturasOrdenadas = useMemo(() => {
    const facturas = vouchersData?.data || [];
    return [...facturas].sort((a, b) => {
      switch (sortOrder) {
        case "date":
          // Por fecha de emisión (más nuevas primero)
          const fechaA = new Date(a.emissionDate || a.createdAt || 0);
          const fechaB = new Date(b.emissionDate || b.createdAt || 0);
          return fechaB - fechaA;
        case "number":
          // Por número de factura (más altos primero)
          const numA = parseInt(a.voucherNumber || 0);
          const numB = parseInt(b.voucherNumber || 0);
          return numB - numA;
        case "amount":
          // Por monto total (más altos primero)
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        default:
          return 0;
      }
    });
  }, [vouchersData, sortOrder]);

  // Calcular información de paginación usando datos del backend
  const totalPages = useMemo(() => {
    if (!vouchersData?.meta?.lastPage) return 1;
    return vouchersData.meta.lastPage;
  }, [vouchersData]);

  // Las facturas ya vienen paginadas del backend
  const facturasAMostrar = facturasOrdenadas;

  // Manejar cambio de filtro por tipo
  const handleFilterChange = (newType) => {
    setSelectedType(newType);
    setCurrentPage(1); // Resetear a primera página
  };

  // Manejar cambio de filtro por cliente
  const handleClientFilterChange = (newClientQuery) => {
    setClientQueryInput(newClientQuery);
    setCurrentPage(1); // Resetear a primera página
  };

  // Debounce para el filtro de cliente (500ms de delay)
  // Evita hacer consultas al backend mientras el usuario está escribiendo
  useEffect(() => {
    const timer = setTimeout(() => {
      setClientQuery(clientQueryInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [clientQueryInput]);

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Resetear a primera página
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar clic en factura, presupuesto o nota
  const handleFacturaClick = (facturaId, facturaType) => {
    // Si es una nota, redirigir a la página de detalle de nota
    if (facturaType?.includes("NOTA_")) {
      navigate(`/admin/facturacion/nota/${facturaId}`);
    } else {
      // Si es una factura o presupuesto, redirigir a la página de detalle de factura
      navigate(`/admin/facturacion/${facturaId}`);
    }
  };

  // Manejar recarga de datos
  const handleRefresh = () => {
    refetch();
    toast.success("Lista de documentos actualizada");
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Cargando documentos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Error al cargar los documentos
        </div>
        <div className="text-red-500 mb-4">
          {error.message || "No se pudieron cargar los documentos"}
        </div>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const facturas = vouchersData?.data || [];
  const totalFacturas = vouchersData?.meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header con filtros y estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Lista de Documentos
            </h2>
            <p className="text-gray-600 mt-1">
              {vouchersData?.meta?.total || 0} documento
              {(vouchersData?.meta?.total || 0) !== 1 ? "s" : ""} encontrado
              {(vouchersData?.meta?.total || 0) !== 1 ? "s" : ""}
              {totalPages > 1 && ` (página ${currentPage} de ${totalPages})`}
              {selectedType &&
                ` de tipo ${filterOptions.find((opt) => opt.value === selectedType)?.label}`}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {sortOrder === "date" &&
                "📅 Ordenadas por fecha de creación (más nuevas primero)"}
              {sortOrder === "number" &&
                "🔢 Ordenadas por número de factura (más altas primero)"}
              {sortOrder === "amount" &&
                "💰 Ordenadas por monto total (más altos primero)"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro por tipo */}
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filtro por cliente */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por cliente (nombre o CUIL)..."
                value={clientQueryInput}
                onChange={(e) => handleClientFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[250px] pr-8"
              />
              {clientQueryInput !== clientQuery && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Selector de ordenamiento */}
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">📅 Más recientes primero</option>
              <option value="number">🔢 Número más alto primero</option>
              <option value="amount">💰 Monto más alto primero</option>
            </select>

            {/* Botón de recarga */}
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de facturas */}
      {facturasOrdenadas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron documentos
          </h3>
          <p className="text-gray-500">
            {selectedType
              ? `No hay documentos del tipo seleccionado.`
              : clientQuery
                ? `No hay documentos para el cliente "${clientQuery}".`
                : "No hay documentos registrados en el sistema."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {facturasAMostrar.map((factura) => (
            <FacturaItem
              key={factura.id}
              factura={factura}
              onClick={() => handleFacturaClick(factura.id, factura.type)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
              <br />
              <span className="text-xs text-gray-500">
                Mostrando {facturasAMostrar.length} de{" "}
                {vouchersData?.meta?.total || 0} documentos
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
