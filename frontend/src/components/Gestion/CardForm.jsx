import React from "react";
import { useForm } from "react-hook-form";

export default function CardForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleFormSubmit = (data) => {
    // Solo enviar los campos requeridos por la API
    const cleanData = {
      commissionPercentage: parseFloat(data.comissionPorcentage),
    };

    onSubmit(cleanData);
    reset(); // Limpiar el formulario después del envío
  };

  return (
    <form
      className="bg-white rounded p-4 shadow space-y-4"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* Fila 2 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block font-bold mb-1">
            Porcentaje de comisión (%)
          </label>
          <input
            {...register("comissionPorcentage", {
              required: "El porcentaje de comisión es obligatorio",
              min: {
                value: 0,
                message: "El porcentaje debe ser mayor o igual a 0",
              },
              max: {
                value: 100,
                message: "El porcentaje no puede ser mayor a 100",
              },
            })}
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-full border rounded px-2 py-1"
            placeholder="Ej: 5.5"
          />
          {errors.comissionPorcentage && (
            <span className="text-red-500 text-sm">
              {errors.comissionPorcentage.message}
            </span>
          )}
        </div>
      </div>

      {/* Botón */}
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Guardando..." : "Guardar Tarjeta"}
      </button>
    </form>
  );
}
