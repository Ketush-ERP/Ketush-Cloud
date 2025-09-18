import React, { memo, useState, useEffect } from "react";
import {
  FaFileInvoice,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";
import { useContactById } from "hooks/useContactsApi";

/**
 * Componente para mostrar un item individual de factura
 * Optimizado para rendimiento en computadoras menos potentes
 */
const FacturaItem = memo(({ factura, onClick }) => {
  const [showClientTooltip, setShowClientTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);

  // Hook para obtener información del cliente
  const {
    data: clientData,
    isLoading: isLoadingClient,
    error: clientError,
  } = useContactById(factura.contactId, {
    enabled: showClientTooltip && !!factura.contactId,
  });

  // Función para mostrar tooltip con delay
  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowClientTooltip(true);
    }, 300); // 300ms de delay
    setTooltipTimeout(timeout);
  };

  // Función para ocultar tooltip
  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowClientTooltip(false);
  };

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  // Formatear fecha de emisión
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear fecha de vencimiento del CAE de ARCA
  const formatArcaDueDate = (arcaDueDate) => {
    if (!arcaDueDate) return "N/A";

    try {
      // El formato que llega es "20250901" (YYYYMMDD)
      const year = arcaDueDate.substring(0, 4);
      const month = arcaDueDate.substring(4, 6);
      const day = arcaDueDate.substring(6, 8);

      const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11

      if (isNaN(date.getTime())) return "Fecha inválida";

      return date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Formatear número de factura
  const formatInvoiceNumber = (pointOfSale, voucherNumber, type) => {
    if (type === "PRESUPUESTO") return "Sin numeración";
    if (!pointOfSale || !voucherNumber) return "N/A";
    return `${pointOfSale.toString().padStart(4, "0")}-${voucherNumber.toString().padStart(8, "0")}`;
  };

  // Obtener etiqueta del tipo de factura
  const getTypeLabel = (type) => {
    const typeMap = {
      FACTURA_A: "Factura A",
      FACTURA_B: "Factura B",
      FACTURA_C: "Factura C",
      PRESUPUESTO: "Presupuesto",
      NOTA_CREDITO_A: "Nota Crédito A",
      NOTA_CREDITO_B: "Nota Crédito B",
      NOTA_DEBITO_A: "Nota Débito A",
      NOTA_DEBITO_B: "Nota Débito B",
    };
    return typeMap[type] || type || "N/A";
  };

  // Obtener color del tipo de factura/nota
  const getTypeColor = (type) => {
    if (type?.includes("NOTA_CREDITO")) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (type?.includes("NOTA_DEBITO")) {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (type === "PRESUPUESTO") {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else if (type?.includes("FACTURA")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Obtener icono del tipo de factura/nota
  const getTypeIcon = (type) => {
    if (type?.includes("NOTA_CREDITO")) {
      return (
        <svg
          className="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (type?.includes("NOTA_DEBITO")) {
      return (
        <svg
          className="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (type === "PRESUPUESTO") {
      return (
        <svg
          className="w-4 h-4 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: "Pendiente",
      PAID: "Pagada",
      CANCELLED: "Cancelada",
      EXPIRED: "Vencida",
      SENT: "Completamente pagada",
    };
    return statusMap[status] || status || "N/A";
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PAID: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      EXPIRED: "bg-orange-100 text-orange-800 border-orange-200",
      SENT: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Obtener icono del estado
  const getStatusIcon = (status) => {
    const iconMap = {
      PENDING: <FaClock className="w-3 h-3" />,
      PAID: <FaCheckCircle className="w-3 h-3" />,
      CANCELLED: <FaTimesCircle className="w-3 h-3" />,
      EXPIRED: <FaExclamationTriangle className="w-3 h-3" />,
      SENT: <FaCheckCircle className="w-3 h-3" />,
    };
    return iconMap[status] || null;
  };

  // Obtener etiqueta de condición de pago
  const getPaymentConditionLabel = (condition) => {
    const conditionMap = {
      CREDIT: "Crédito",
      CASH: "Contado",
      TRANSFER: "Transferencia",
    };
    return conditionMap[condition] || condition || "N/A";
  };

  // Calcular si la factura está completamente pagada
  const isFullyPaid = factura.status === "SENT" || factura.status === "PAID";
  const hasRemainingAmount =
    factura.totalAmount && factura.totalAmount - factura.paidAmount > 0;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Información principal */}
        <div className="flex-1 space-y-4">
          {/* Número y tipo de factura */}
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl text-white ${
                factura.type?.includes("NOTA_CREDITO")
                  ? "bg-green-500"
                  : factura.type?.includes("NOTA_DEBITO")
                    ? "bg-red-500"
                    : factura.type === "PRESUPUESTO"
                      ? "bg-purple-500"
                      : "bg-blue-500"
              }`}
            >
              {factura.type?.includes("NOTA_CREDITO") ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : factura.type?.includes("NOTA_DEBITO") ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : factura.type === "PRESUPUESTO" ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              ) : (
                <FaFileInvoice className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                {formatInvoiceNumber(
                  factura.pointOfSale,
                  factura.voucherNumber,
                  factura.type
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getTypeIcon(factura.type)}
                <span
                  className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(factura.type)} whitespace-nowrap`}
                >
                  {getTypeLabel(factura.type)}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles principales en grid mejorado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Fecha
              </span>
              <p className="font-semibold text-gray-900">
                {formatDate(factura.emissionDate)}
              </p>
            </div>

            {/* Información del cliente con tooltip */}
            {factura.contactId ? (
              <div
                className="space-y-1 relative cursor-pointer sm:cursor-default"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  // En mobile, toggle el tooltip con click
                  if (window.innerWidth <= 768) {
                    setShowClientTooltip(!showClientTooltip);
                  }
                }}
              >
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  Cliente
                  <FaUser className="w-3 h-3 text-blue-500" />
                  <span className="sm:hidden text-xs text-blue-500">
                    (Toca para ver)
                  </span>
                </span>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {isLoadingClient ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Cargando...
                    </>
                  ) : (
                    clientData?.name || (
                      <span className="text-sm text-gray-500 italic">
                        <span className="hidden sm:inline">
                          Pasa el mouse para cargar
                        </span>
                        <span className="sm:hidden">Toca para cargar</span>
                      </span>
                    )
                  )}
                </p>

                {/* Tooltip del cliente */}
                {showClientTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 z-50 transform -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2">
                    <div className="bg-gray-900 text-white text-sm rounded-lg p-2 sm:p-3 shadow-lg max-w-[280px] sm:max-w-xs border border-gray-700">
                      {/* Flecha del tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      {isLoadingClient ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Cargando cliente...</span>
                        </div>
                      ) : clientError ? (
                        <div className="text-red-300">
                          Error al cargar cliente
                        </div>
                      ) : clientData ? (
                        <div className="space-y-2">
                          <div className="font-semibold">{clientData.name}</div>
                          {clientData.documentNumber && (
                            <div className="text-xs text-gray-300">
                              CUIL/DNI: {clientData.documentNumber}
                            </div>
                          )}
                          {clientData.ivaCondition && (
                            <div className="text-xs text-gray-300">
                              IVA: {clientData.ivaCondition}
                            </div>
                          )}
                          {clientData.email && (
                            <div className="text-xs text-gray-300">
                              Email: {clientData.email}
                            </div>
                          )}
                          {clientData.phone && (
                            <div className="text-xs text-gray-300">
                              Tel: {clientData.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-300">
                          Cliente no encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mostrar "Público General" cuando no hay cliente */
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  Cliente
                  <FaUser className="w-3 h-3 text-gray-400" />
                </span>
                <p className="font-semibold text-gray-600">Público General</p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total
              </span>
              <p className="font-bold text-lg text-green-600">
                ${factura.totalAmount?.toLocaleString() || "0"}
              </p>
            </div>

            {/* Solo mostrar información de pagos si NO es una nota y NO es presupuesto */}
            {!factura.type?.includes("NOTA_") &&
              factura.type !== "PRESUPUESTO" && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Pagado
                    </span>
                    <p
                      className={`font-semibold text-lg ${isFullyPaid ? "text-emerald-600" : "text-blue-600"}`}
                    >
                      ${factura.paidAmount?.toLocaleString() || "0"}
                    </p>
                  </div>

                  {hasRemainingAmount && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Restante
                      </span>
                      <p className="font-semibold text-lg text-orange-600">
                        $
                        {factura.paidAmount > 0
                          ? (
                              factura.totalAmount - factura.paidAmount
                            ).toLocaleString()
                          : factura.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              )}

            {/* Si es una nota, mostrar información adicional relevante */}
            {factura.type?.includes("NOTA_") && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tipo
                </span>
                <p className="font-semibold text-gray-900">
                  {factura.type?.includes("CREDITO") ? "Crédito" : "Débito"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estado y información adicional */}
        <div className="flex flex-col items-end gap-4">
          {/* Estado con icono - Solo mostrar si NO es una nota y NO es presupuesto */}
          {!factura.type?.includes("NOTA_") &&
            factura.type !== "PRESUPUESTO" && (
              <div className="flex items-center gap-2">
                {getStatusIcon(factura.status)}
                <span
                  className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(factura.status)}`}
                >
                  {getStatusLabel(factura.status)}
                </span>
              </div>
            )}

          {/* Condición de pago - Solo mostrar si NO es una nota y NO es presupuesto */}
          {!factura.type?.includes("NOTA_") &&
            factura.type !== "PRESUPUESTO" && (
              <div className="text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                  Condición
                </span>
                <span className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                  {getPaymentConditionLabel(factura.conditionPayment)}
                </span>
              </div>
            )}

          {/* Para notas, mostrar información relevante */}
          {factura.type?.includes("NOTA_") && (
            <div className="text-right">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Documento
              </span>
              <span className="text-sm font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                {factura.type?.includes("CREDITO")
                  ? "Nota de Crédito"
                  : "Nota de Débito"}
              </span>
            </div>
          )}

          {/* Información de CAE si está disponible */}
          {(factura.arcaCae || factura.arcaDueDate) && (
            <div className="text-right space-y-1">
              {factura.arcaCae && (
                <div className="text-xs text-gray-500">
                  CAE:{" "}
                  <span className="font-mono font-medium text-gray-700">
                    {factura.arcaCae}
                  </span>
                </div>
              )}
              {factura.arcaDueDate && (
                <div className="text-xs text-gray-500">
                  Venc. CAE:{" "}
                  <span className="font-medium text-gray-700">
                    {formatArcaDueDate(factura.arcaDueDate)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información de productos (solo si hay productos) */}
      {factura.products && factura.products.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Productos ({factura.products.length})
            </span>
            {factura.products.length > 2 && (
              <span className="text-xs text-gray-400">
                +{factura.products.length - 2} más
              </span>
            )}
          </div>
          <div
            className="text-sm text-gray-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {factura.products.slice(0, 2).map((product, index) => (
              <span key={index}>
                {product.description}
                {index < Math.min(2, factura.products.length - 1) && ", "}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Información de pagos (solo si hay pagos y NO es presupuesto) */}
      {factura.Payments &&
        factura.Payments.length > 0 &&
        factura.type !== "PRESUPUESTO" && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaCheckCircle className="w-4 h-4 text-green-500" />
              <span>
                {factura.Payments.length} pago
                {factura.Payments.length !== 1 ? "s" : ""} registrado
                {factura.Payments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
    </div>
  );
});

FacturaItem.displayName = "FacturaItem";

export default FacturaItem;
