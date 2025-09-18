import React, { useState } from "react";
import { useUpdateProviderProfitMargin } from "hooks/useUpdateProviderProfitMargin";
import { toast } from "react-hot-toast";

export function EditProfitMargin({ id, currentValue, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [profitMargin, setProfitMargin] = useState(currentValue ?? 0);
  const [localError, setLocalError] = useState(null);

  const {
    mutate: updateProfitMargin,
    isLoading,
    isError,
    error,
  } = useUpdateProviderProfitMargin(id);

  const handleSave = () => {
    setLocalError(null);
    updateProfitMargin(profitMargin, {
      onSuccess: () => {
        setEditing(false);
        if (onUpdated) onUpdated();
      },
      onError: (err) => {
        setLocalError(err.message);
      },
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setProfitMargin(currentValue ?? 0);
    setLocalError(null);
  };

  return (
    <div className="flex flex-wrap">
      <span className="font-semibold mr-1">Ganancia: </span>
      {editing ? (
        <>
          <input
            type="number"
            min={0}
            max={1000}
            value={profitMargin}
            onChange={(e) => setProfitMargin(e.target.value)}
            className="border rounded px-2 py-1 w-20 mr-2"
            disabled={isLoading}
          />
          <span>%</span>
          <div className="flex m-2 flex-wrap gap-2">
            <button
              className="ml-2 px-2 py-1 bg-green-600 text-white rounded"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="ml-2 px-2 py-1 bg-gray-400 text-white rounded"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
          {(localError || isError) && (
            <div className="text-red-600 text-xs mt-1">
              {localError || error?.response?.data?.message || error?.message}
            </div>
          )}
        </>
      ) : (
        <>
          <span className="text-green-700 font-semibold"> {currentValue}%</span>
          <button
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => setEditing(true)}
          >
            Editar
          </button>
        </>
      )}
    </div>
  );
}
