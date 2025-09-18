import React from "react";
import { useForm } from "react-hook-form";

export default function BancoForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleFormSubmit = (data) => {
    // Solo enviar los campos requeridos por la API
    const cleanData = {
      name: data.name,
      account: data.account,
      cbu: data.cbu,
      currency: data.currency,
    };

    onSubmit(cleanData);
    reset(); // Limpiar el formulario después del envío
  };

  return (
    <form
      className="bg-white rounded p-4 shadow space-y-4"
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      {/* Fila 1 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block font-bold mb-1">Nombre del banco</label>
          <input
            {...register("name", { required: true })}
            className="w-full border rounded px-2 py-1"
            placeholder="MACRO, Santander, etc."
          />
        </div>
        <div className="flex-1">
          <label className="block font-bold mb-1">Número de cuenta</label>
          <input
            {...register("account", { required: true })}
            className="w-full border rounded px-2 py-1"
            placeholder="Número de cuenta bancaria"
          />
        </div>
      </div>

      {/* Fila 2 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block font-bold mb-1">CBU</label>
          <input
            {...register("cbu", { required: true })}
            className="w-full border rounded px-2 py-1"
            placeholder="Número de CBU"
          />
        </div>
        <div className="flex-1">
          <label className="block font-bold mb-1">Moneda</label>
          <select
            {...register("currency", { required: true })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="ARS">Pesos Argentinos (ARS)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      </div>

      {/* Botón */}
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Guardando..." : "Guardar Banco"}
      </button>
    </form>
  );
}
