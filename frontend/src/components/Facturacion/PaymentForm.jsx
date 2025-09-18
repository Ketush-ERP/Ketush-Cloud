import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaMoneyBillWave,
  FaUniversity,
  FaCalendarAlt,
} from "react-icons/fa";
import { useCreatePayment } from "hooks/usePaymentsApi";
import { useBanks } from "hooks/useBanksApi";
import { useCards } from "hooks/useCardsApi";
import toast from "react-hot-toast";

export default function PaymentForm({
  invoiceId,
  remainingAmount,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    method: "EFECTIVO",
    amount: remainingAmount,
    currency: "ARS",
    receivedAt: new Date().toISOString().slice(0, 16),
    bankId: "",
    cardId: "",
  });

  // Estado para la comisión de la tarjeta
  const [cardCommission, setCardCommission] = useState({
    percentage: 0,
    amount: 0,
    totalWithCommission: remainingAmount,
  });

  // Hooks para obtener bancos y tarjetas de la API
  const { data: banks, isLoading: isLoadingBanks } = useBanks();
  const { data: cards, isLoading: isLoadingCards } = useCards();
  const createPayment = useCreatePayment();

  // Efecto para recalcular la comisión cuando cambie el monto o la tarjeta
  useEffect(() => {
    if (formData.method === "TARJETA" && formData.cardId) {
      const selectedCard = cards?.find((card) => card.id === formData.cardId);
      if (selectedCard && selectedCard.commissionPercentage) {
        const currentAmount = parseFloat(formData.amount);
        const commissionAmount =
          (currentAmount * selectedCard.commissionPercentage) / 100;
        const totalWithCommission = currentAmount + commissionAmount;

        setCardCommission({
          percentage: selectedCard.commissionPercentage,
          amount: commissionAmount,
          totalWithCommission: totalWithCommission,
        });
      }
    } else if (formData.method !== "TARJETA") {
      // Resetear la comisión si no es pago con tarjeta
      setCardCommission({
        percentage: 0,
        amount: 0,
        totalWithCommission: parseFloat(formData.amount),
      });
    }
  }, [formData.amount, formData.cardId, formData.method, cards]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Para el campo amount, redondear a 2 decimales
    if (name === "amount") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const roundedValue = Math.round(numValue * 100) / 100;
        setFormData((prev) => ({
          ...prev,
          [name]: roundedValue,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Si se cambia la tarjeta, resetear la comisión para que el useEffect la recalcule
    if (name === "cardId") {
      if (value) {
        setCardCommission({
          percentage: 0,
          amount: 0,
          totalWithCommission: parseFloat(formData.amount),
        });
      } else {
        setCardCommission({
          percentage: 0,
          amount: 0,
          totalWithCommission: parseFloat(formData.amount),
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    // Si es en pesos, validar que no exceda el saldo pendiente
    if (formData.currency === "ARS" && formData.amount > remainingAmount) {
      toast.error("El monto no puede ser mayor al saldo pendiente");
      return;
    }

    // Validar campos requeridos según el método
    if (formData.method === "TARJETA" && !formData.cardId) {
      toast.error("Debes seleccionar una tarjeta");
      return;
    }

    if (formData.method === "BANCO" && !formData.bankId) {
      toast.error("Debes seleccionar un banco");
      return;
    }

    try {
      // Obtener la fecha actual del sistema en el momento del envío
      const currentDate = new Date();
      const currentDateISO = currentDate.toISOString();

      // Preparar los datos según el método de pago
      const paymentData = {
        method: getApiMethod(formData.method), // Usar el mapeo correcto
        amount:
          formData.method === "TARJETA" && cardCommission.percentage > 0
            ? Math.round(parseFloat(cardCommission.totalWithCommission) * 100) /
              100
            : Math.round(parseFloat(formData.amount) * 100) / 100,
        currency: formData.currency,
        receivedAt: currentDateISO, // Usar la fecha actual del sistema
        voucherId: invoiceId,
      };

      // Agregar bankId o cardId según el método
      if (formData.method === "TARJETA" && formData.cardId) {
        paymentData.cardId = formData.cardId;
      }

      if (formData.method === "BANCO" && formData.bankId) {
        paymentData.bankId = formData.bankId;
      }

      // Debug: mostrar los datos que se van a enviar
      console.log("Datos del pago a enviar:", paymentData);
      console.log("Método original:", formData.method);
      console.log("Método mapeado:", getApiMethod(formData.method));
      console.log("Fecha de recepción que se enviará:", currentDateISO);

      await createPayment.mutateAsync({
        invoiceId,
        paymentData,
      });

      onSuccess();
    } catch (error) {
      toast.error("Error al registrar el pago");
      console.error("Error creating payment:", error);
    }
  };

  const formatCurrency = (amount, currency = formData.currency) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "EFECTIVO":
        return <FaMoneyBillWave className="w-5 h-5" />;
      case "TARJETA":
        return <FaCreditCard className="w-5 h-5" />;
      case "CHEQUE":
        return <FaUniversity className="w-5 h-5" />;
      case "BANCO":
        return <FaUniversity className="w-5 h-5" />;
      default:
        return <FaMoneyBillWave className="w-5 h-5" />;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case "EFECTIVO":
        return "Efectivo";
      case "TARJETA":
        return "Tarjeta";
      case "CHEQUE":
        return "Cheque";
      case "BANCO":
        return "Transferencia Bancaria";
      default:
        return method;
    }
  };

  // Mapear métodos del frontend a métodos de la API
  const getApiMethod = (frontendMethod) => {
    const methodMap = {
      EFECTIVO: "EFECTIVO",
      TARJETA: "TARJETA",
      CHEQUE: "CHEQUE",
      BANCO: "TRANSFERENCIA", // La API espera "TRANSFERENCIA", no "BANCO"
    };
    return methodMap[frontendMethod] || frontendMethod;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaMoneyBillWave className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Registrar Pago</h2>
                <p className="text-purple-100">
                  Saldo pendiente: {formatCurrency(remainingAmount, "ARS")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {["EFECTIVO", "TARJETA", "CHEQUE", "BANCO"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      method,
                      bankId: "",
                      cardId: "",
                    }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.method === method
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {getMethodIcon(method)}
                  <span className="text-sm font-medium">
                    {getMethodLabel(method)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.currency === "USD" ? "$" : "$"}
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max={formData.currency === "ARS" ? remainingAmount : undefined}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                required
                onBlur={(e) => {
                  // Redondear a 2 decimales cuando se pierde el foco
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    const roundedValue = Math.round(value * 100) / 100;
                    setFormData((prev) => ({
                      ...prev,
                      amount: roundedValue,
                    }));
                  }
                }}
              />
            </div>

            {/* Botón para pagar el total */}
            {formData.currency === "ARS" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Redondear el remainingAmount a 2 decimales
                    const roundedAmount =
                      Math.round(remainingAmount * 100) / 100;
                    setFormData((prev) => ({
                      ...prev,
                      amount: roundedAmount,
                    }));
                  }}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>💳</span>
                  Pagar Total: {formatCurrency(remainingAmount, "ARS")}
                </button>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-1">
              {formData.currency === "ARS" && (
                <>Máximo: {formatCurrency(remainingAmount, "ARS")}</>
              )}
              {formData.currency === "USD" && <>Ingresa el monto en dólares</>}
            </p>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["ARS", "USD"].map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      currency,
                    }))
                  }
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                    formData.currency === currency
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-lg font-bold">
                    {currency === "USD" ? "$" : "$"}
                  </span>
                  <span className="font-medium">
                    {currency === "USD" ? "Dólares" : "Pesos"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fecha de recepción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Recepción *
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="datetime-local"
                name="receivedAt"
                value={formData.receivedAt}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Campos específicos según el método */}
          {formData.method === "TARJETA" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarjeta *
              </label>
              <select
                name="cardId"
                value={formData.cardId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar tarjeta</option>
                {isLoadingCards ? (
                  <option value="" disabled>
                    Cargando tarjetas...
                  </option>
                ) : cards?.length > 0 ? (
                  cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.commissionPercentage}% comisión
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No hay tarjetas disponibles
                  </option>
                )}
              </select>

              {/* Información de la comisión */}
              {formData.cardId && cardCommission.percentage > 0 && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      Comisión de tarjeta:
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {cardCommission.percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-700">
                      Monto de comisión:
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {formatCurrency(cardCommission.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-blue-800">
                      Total con comisión:
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatCurrency(cardCommission.totalWithCommission)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.method === "BANCO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banco *
              </label>
              <select
                name="bankId"
                value={formData.bankId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar banco</option>
                {isLoadingBanks ? (
                  <option value="" disabled>
                    Cargando bancos...
                  </option>
                ) : banks?.length > 0 ? (
                  banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No hay bancos disponibles
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createPayment.isPending ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
