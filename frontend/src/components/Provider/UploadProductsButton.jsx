import React, { useRef, useState } from "react";
import { useUploadProviderProducts } from "hooks/useUploadProviderProducts";
import { toast } from "react-hot-toast";

export function UploadProductsButton({ providerName, providerId, onSuccess }) {
  const inputRef = useRef();
  const { mutate, isLoading } = useUploadProviderProducts();
  const [isDragging, setIsDragging] = useState(false);
  const [containsVAT, setContainsVAT] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { id: providerId, file, containsVAT },
          {
            onSuccess: (data) => {
              if (onSuccess) onSuccess();
              resolve(data);
            },
            onError: (err) => {
              reject(
                err?.response?.data?.message || "❌ Error al cargar productos"
              );
            },
          }
        );
      }),
      {
        loading: "Cargando productos...",
        success: "✅ Productos cargados correctamente",
        error: (msg) => msg,
      }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = ""; // Reset para permitir volver a subir el mismo
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full mb-2 max-w-2xl mx-auto">
      {/* Checkbox para IVA - FUERA del área de drag & drop */}
      <div className="mb-4 flex items-center justify-center">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={containsVAT}
            onChange={(e) => setContainsVAT(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            El archivo ya contiene IVA
          </span>
        </label>
      </div>

      {/* Área de drag & drop */}
      <div
        className={`relative border-2 rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-dashed border-gray-300"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.xls,.xlsx"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
            ↑
          </div>
          <p className="text-gray-800 font-semibold">
            {isLoading
              ? "Cargando productos..."
              : "Arrastrá o hacé clic para subir"}
          </p>
          <p className="text-sm text-gray-500">
            Archivos aceptados:{" "}
            <span className="font-medium">.pdf, .xls, .xlsx</span>
          </p>
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            Seleccionar archivo
          </button>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-blue-100/40 border-4 border-blue-400 border-dashed rounded-lg animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
}
