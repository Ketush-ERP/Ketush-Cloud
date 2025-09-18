import React from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaFilePdf,
  FaFileInvoice,
} from "react-icons/fa";
import { useDownloadInvoiceAsPdf } from "hooks/usePaymentsApi";
import axiosInstance from "api/axiosInstance";

/**
 * Header de la página de detalle de factura
 * Incluye navegación y acciones principales
 */
export default function InvoiceHeader({ invoice, onBack, onCreateNota }) {
  const downloadPdf = useDownloadInvoiceAsPdf();

  // Función para descargar el comprobante como PDF
  const handleDownloadPDF = async () => {
    try {
      await downloadPdf.mutateAsync({
        voucherId: invoice.id,
        factura: { numero: invoice.numero || invoice.id },
      });
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  // Función para ver el PDF en nueva pestaña
  const handleViewPDF = () => {
    try {
      // Usar la URL base del axiosInstance
      const baseURL = axiosInstance.defaults.baseURL;
      const pdfUrl = `${baseURL}/voucher/html/${invoice.id}`;
      console.log("Abriendo PDF en:", pdfUrl);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Error al abrir PDF:", error);
      alert("Error al abrir el PDF. Verifica la conexión.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <FaArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="border-l border-gray-300 pl-3 sm:pl-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
              {invoice?.type === "PRESUPUESTO"
                ? "Presupuesto"
                : invoice?.tipo || "Factura"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 break-words">
              {invoice?.type === "PRESUPUESTO"
                ? "Sin numeración"
                : `N° ${invoice?.numero || "N/A"}`}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Crear Nota - Solo mostrar si NO es presupuesto */}
          {onCreateNota && invoice?.type !== "PRESUPUESTO" && (
            <button
              onClick={onCreateNota}
              className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
              title="Crear nota de crédito o débito"
            >
              <FaFileInvoice className="w-4 h-4" />
              <span className="hidden xs:inline">Crear Nota</span>
              <span className="xs:hidden">Nota</span>
            </button>
          )}

          {/* Ver PDF en nueva pestaña */}
          <button
            onClick={handleViewPDF}
            className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            title="Ver comprobante PDF"
          >
            <FaFilePdf className="w-4 h-4" />
            <span className="hidden xs:inline">Ver PDF</span>
            <span className="xs:hidden">Ver</span>
          </button>

          {/* Descargar PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloadPdf.isPending}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            title="Descargar comprobante PDF"
          >
            {downloadPdf.isPending ? (
              "Descargando..."
            ) : (
              <>
                <span className="hidden xs:inline">Descargar PDF</span>
                <span className="xs:hidden">PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
