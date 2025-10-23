import React from "react";

export default function InvoiceInfo({ invoice }) {
  // Función formatDate por defecto
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return "Fecha inválida";

    // Formato: DD/MM/YYYY HH:MM
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };
  // Función para obtener la condición de pago en español
  const getPaymentConditionLabel = (condition) => {
    const conditionMap = {
      CASH: "Contado",
      CREDIT: "Crédito",
      CHECK: "Cheque",
      TRANSFER: "Transferencia",
    };
    return conditionMap[condition] || condition || "N/A";
  };

  // Función para validar si el CAE está disponible y es válido
  const isCAEValid = (cae, dueCae) => {
    // Verificar que cae exista y no sea una cadena vacía
    if (!cae || (typeof cae === "string" && cae.trim() === "")) {
      return false;
    }

    // Verificar que dueCae exista y sea una fecha válida
    if (!dueCae) {
      return false;
    }

    try {
      const date = new Date(dueCae);
      if (isNaN(date.getTime())) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  // Función para validar si el CAE de ARCA está disponible y es válido
  const isArcaCAEValid = (arcaCae, arcaDueDate) => {
    // Verificar que arcaCae exista y no sea una cadena vacía
    if (!arcaCae || (typeof arcaCae === "string" && arcaCae.trim() === "")) {
      return false;
    }

    // Verificar que arcaDueDate exista
    if (!arcaDueDate) {
      return false;
    }

    // Para el formato "20250901" (YYYYMMDD), solo necesitamos verificar que tenga 8 dígitos
    if (typeof arcaDueDate === "string" && arcaDueDate.length === 8) {
      return true;
    }

    // Si es otro formato, intentar parsear como fecha
    try {
      const date = new Date(arcaDueDate);
      if (isNaN(date.getTime())) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
          {invoice.type === "PRESUPUESTO"
            ? "Información del Presupuesto"
            : "Información de la Factura"}
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Número de Comprobante - Solo mostrar si NO es presupuesto */}
            {invoice.type !== "PRESUPUESTO" && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Número de Comprobante
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {invoice.voucherNumber || "N/A"}
                </p>
              </div>
            )}
            {/* Punto de Venta - Solo mostrar si NO es presupuesto */}
            {invoice.type !== "PRESUPUESTO" && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Punto de Venta
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {invoice.pointOfSale || "N/A"}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">
                {invoice.type === "PRESUPUESTO"
                  ? "Tipo de Comprobante"
                  : "Tipo de Factura"}
              </label>
              <span className="inline-flex px-3 ml-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {invoice.type === "PRESUPUESTO"
                  ? "Presupuesto"
                  : invoice.type || "N/A"}
              </span>
            </div>
            {/* Estado - Solo mostrar si NO es presupuesto */}
            {invoice.type !== "PRESUPUESTO" && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <span
                  className={`inline-flex px-3 ml-1 py-1 text-sm font-semibold rounded-full ${
                    invoice?.isLoadedToArca === true
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invoice?.isLoadedToArca === true
                    ? "CONFIRMADA POR ARCA"
                    : "NO CONFIRMADA POR ARCA"}
                </span>
              </div>
            )}

            {/* Información del CAE - Solo mostrar si está cargado a AFIP */}
            {isCAEValid(invoice.cae, invoice.dueCae) && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Número de CAE
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {invoice.cae}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Vencimiento CAE
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(invoice.dueCae)}
                  </p>
                </div>
              </>
            )}

            {/* Información del CAE de ARCA - Solo mostrar si está disponible */}
            {isArcaCAEValid(invoice.arcaCae, invoice.arcaDueDate) && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Número de CAE ARCA
                  </label>
                  <p className="text-lg font-semibold text-blue-600">
                    {invoice.arcaCae}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Fecha de Emisión
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(invoice.emissionDate)}
              </p>
            </div>
            {/* Condición de Pago - Solo mostrar si NO es presupuesto */}
            {invoice.type !== "PRESUPUESTO" && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Condición de Pago
                </label>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full ml-1 bg-purple-100 text-purple-800">
                  {getPaymentConditionLabel(invoice.conditionPayment)}
                </span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>
            {/* IVA - Solo mostrar si NO es presupuesto */}
            {invoice.type !== "PRESUPUESTO" && (
              <div>
                <label className="text-sm font-medium text-gray-500">IVA</label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(invoice.ivaAmount)}
                </p>
              </div>
            )}

            {/* Fecha de Vencimiento CAE ARCA - Solo mostrar si está disponible */}
            {isArcaCAEValid(invoice.arcaCae, invoice.arcaDueDate) && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Vencimiento CAE ARCA
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {formatArcaDueDate(invoice.arcaDueDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        {invoice.observation && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-500">
              Observaciones
            </label>
            <p className="text-gray-900 mt-1">{invoice.observation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
