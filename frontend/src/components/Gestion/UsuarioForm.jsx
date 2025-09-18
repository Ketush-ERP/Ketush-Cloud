import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

export default function UsuarioForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [cuilDisplay, setCuilDisplay] = useState("");
  const cuilValue = watch("cuil");

  // Función para formatear CUIL visualmente
  const formatCuil = (value) => {
    if (!value) return "";
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10)
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  };

  // Función para limpiar CUIL (solo números)
  const cleanCuil = (value) => {
    return value ? value.replace(/\D/g, "") : "";
  };

  // Manejar cambios en el campo CUIL
  const handleCuilChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const value = input.value;

    // Obtener solo números del valor actual
    const numbers = value.replace(/\D/g, "");

    // Limitar a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);

    // Formatear para mostrar
    const formatted = formatCuil(limitedNumbers);
    setCuilDisplay(formatted);

    // Guardar valor sin formato en el formulario
    setValue("cuil", limitedNumbers);

    // Restaurar posición del cursor
    setTimeout(() => {
      const newCursorPosition = getCursorPosition(
        cursorPosition,
        value,
        formatted
      );
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // Calcular nueva posición del cursor después del formateo
  const getCursorPosition = (oldPos, oldValue, newValue) => {
    // Contar cuántos números hay antes de la posición del cursor en el valor anterior
    let numbersBeforeCursor = 0;
    for (let i = 0; i < oldPos && i < oldValue.length; i++) {
      if (/\d/.test(oldValue[i])) {
        numbersBeforeCursor++;
      }
    }

    // Encontrar la posición en el nuevo valor donde hay la misma cantidad de números
    let newPos = 0;
    let numbersCounted = 0;

    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        numbersCounted++;
        if (numbersCounted > numbersBeforeCursor) {
          break;
        }
      }
      newPos = i + 1;
    }

    return newPos;
  };

  // Sincronizar display con el valor del formulario
  useEffect(() => {
    if (cuilValue && cuilValue !== cleanCuil(cuilDisplay)) {
      setCuilDisplay(formatCuil(cuilValue));
    }
  }, [cuilValue]);

  return (
    <form
      className="bg-white rounded p-4 shadow space-y-4"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      <div>
        <label className="block font-bold mb-1">Gmail</label>
        <input
          {...register("gmail", {
            required: "El correo es obligatorio",
            pattern: {
              value: /^[\w-.]+@gmail\.com$/i,
              message: "Debe ser un correo de Gmail válido",
            },
          })}
          className="w-full border rounded px-2 py-1"
          placeholder="usuario@gmail.com"
          autoComplete="off"
        />
        {errors.gmail && (
          <span className="text-red-600 text-xs">{errors.gmail.message}</span>
        )}
      </div>
      <div>
        <label className="block font-bold mb-1">Nombre</label>
        <input
          {...register("nombre", {
            required: "El nombre es obligatorio",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
            maxLength: {
              value: 50,
              message: "El nombre es demasiado largo",
            },
          })}
          className="w-full border rounded px-2 py-1"
          placeholder="Nombre del empleado"
          autoComplete="off"
        />
        {errors.nombre && (
          <span className="text-red-600 text-xs">{errors.nombre.message}</span>
        )}
      </div>
      <div>
        <label className="block font-bold mb-1">CUIL</label>
        <input
          {...register("cuil", {
            required: "El CUIL es obligatorio",
            validate: {
              validFormat: (value) => {
                if (!value) return true;
                if (value.length !== 13) return "El CUIL debe tener 11 dígitos";
                return true;
              },
            },
          })}
          value={cuilDisplay}
          onChange={handleCuilChange}
          onKeyDown={(e) => {
            // Permitir solo números, backspace, delete, tab, escape, enter
            const allowedKeys = [
              "Backspace",
              "Delete",
              "Tab",
              "Escape",
              "Enter",
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
            ];
            const isNumber = /^\d$/.test(e.key);
            const isAllowedKey = allowedKeys.includes(e.key);

            if (!isNumber && !isAllowedKey) {
              e.preventDefault();
            }
          }}
          className="w-full border rounded px-2 py-1"
          placeholder="XX-XXXXXXXX-X"
          autoComplete="off"
        />
        {errors.cuil && (
          <span className="text-red-600 text-xs">{errors.cuil.message}</span>
        )}
      </div>
      <div>
        <label className="block font-bold mb-1">Contraseña</label>
        <input
          type="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 8,
              message: "Debe tener al menos 8 caracteres",
            },
            pattern: {
              value:
                /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
              message: "Debe tener mayúscula, minúscula, número y símbolo",
            },
          })}
          className="w-full border rounded px-2 py-1"
          placeholder="********"
          autoComplete="new-password"
        />
        {errors.password && (
          <span className="text-red-600 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="border px-4 py-2 rounded bg-blue-600 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Guardando..." : "Guardar Usuario"}
      </button>
    </form>
  );
}
