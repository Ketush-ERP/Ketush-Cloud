import React, { useState, useEffect } from "react";
import { useCreateVoucher, useNextInvoiceNumber } from "hooks/useVoucherApi";
import { useContactById } from "hooks/useContactsApi";
import { FaTimes, FaFileInvoice, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import useAuthStore from "stores/useAuthStore";

export default function CreateNotaModal({ invoice, onClose, onSuccess }) {
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    type: invoice?.type === "FACTURA_B" ? "NOTA_CREDITO_B" : "NOTA_CREDITO_A",
    emissionDate: new Date().toISOString().split("T")[0],
    currency: "ARS",
    products: [],
    totalAmount: 0,
    paidAmount: 0,
    associatedVoucherNumber: invoice?.voucherNumber || "",
    associatedVoucherType: invoice?.type || "FACTURA_A",
    loadToArca: true,
    // Datos que se llenan automáticamente desde la factura
    cuil: parseInt(user?.cuil) || 0,
    contactId: invoice?.contactId || invoice?.contact?.id || "",
    voucherNumber: "", // Vacío al inicio
    pointOfSale: "", // Vacío al inicio
  });

  const [isLoading, setIsLoading] = useState(false);
  const [shouldGenerateNumber, setShouldGenerateNumber] = useState(false);
  const [numberGenerated, setNumberGenerated] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set()); // Productos seleccionados

  const createVoucher = useCreateVoucher();

  // Hook para obtener información del cliente
  const { data: clientData, isLoading: isLoadingClient } = useContactById(
    formData.contactId,
    {
      enabled: !!formData.contactId,
    }
  );

  // Hook para obtener el siguiente número de nota
  const {
    data: nextNumber,
    isLoading: isLoadingNextNumber,
    error: nextNumberError,
    refetch: refetchNextNumber,
  } = useNextInvoiceNumber({
    cuil: formData.cuil,
    voucherType: formData.type,
    enabled: shouldGenerateNumber && !!formData.cuil && !!formData.type,
  });

  // Efecto para establecer el siguiente número de nota
  useEffect(() => {
    if (nextNumber?.nextNumber?.number && shouldGenerateNumber) {
      setFormData((prev) => ({
        ...prev,
        voucherNumber: nextNumber.nextNumber.number, // Usar el número directamente, no parseInt
        pointOfSale: nextNumber.nextNumber.pointOfSale, // Usar el pointOfSale directamente, no parseInt
      }));

      setNumberGenerated(true);
      setShouldGenerateNumber(false);
    }
  }, [nextNumber, shouldGenerateNumber]);

  // Efecto para cargar los productos de la factura
  useEffect(() => {
    if (invoice?.productos) {
      const products = invoice.productos.map((product) => ({
        code: product.code || "",
        productId: product.productId || product.id || "",
        description: product.description || "",
        quantity: parseInt(product.quantity) || 1,
        price: parseFloat(product.price) || 0,
      }));

      // Inicializar todos los productos como seleccionados
      const allProductIds = new Set(products.map((_, index) => index));
      setSelectedProducts(allProductIds);

      setFormData((prev) => ({
        ...prev,
        products,
        totalAmount:
          Math.round((parseFloat(invoice.totalAmount) || 0) * 100) / 100,
      }));
    }
  }, [invoice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.products.length === 0) {
      toast.error("No hay productos para crear la nota");
      return;
    }

    if (selectedProducts.size === 0) {
      toast.error("Debe seleccionar al menos un producto para la nota");
      return;
    }

    // Validar que se hayan generado los números de la nota
    if (!formData.voucherNumber || !formData.pointOfSale) {
      toast.error("Debe generar los números de nota antes de continuar");
      return;
    }

    // Obtener la fecha actual del sistema
    const currentDate = new Date();
    const currentDateISO = currentDate.toISOString();

    // Preparar los datos para enviar, usando la fecha actual del sistema
    const dataToSend = {
      ...formData,
      emissionDate: currentDateISO, // Usar la fecha actual del sistema
      // Solo incluir los productos seleccionados
      products: formData.products.filter((_, index) =>
        selectedProducts.has(index)
      ),
    };

    setIsLoading(true);
    try {
      const result = await createVoucher.mutateAsync(dataToSend);

      // Verificar si hay un error en la respuesta a pesar de success: true
      if (result?.data?.status === 400) {
        const errorMessage =
          result.data.message || result.message || "Error al crear la nota";
        toast.error(errorMessage);
        return;
      }

      // Si no hay errores, proceder con el éxito
      // Pasar el ID de la nota creada para que se pueda redirigir
      onSuccess(result?.data?.id || result?.id);
    } catch (error) {
      toast.error("Error al crear la nota: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotaTypeLabel = (type) => {
    const typeMap = {
      NOTA_CREDITO_A: "Nota de Crédito A",
      NOTA_CREDITO_B: "Nota de Crédito B",
      NOTA_DEBITO_A: "Nota de Débito A",
      NOTA_DEBITO_B: "Nota de Débito B",
    };
    return typeMap[type] || type;
  };

  // Filtrar tipos de notas según el tipo de factura
  const getAvailableNotaTypes = () => {
    const facturaType = formData.associatedVoucherType;

    if (facturaType === "FACTURA_A") {
      return [
        { value: "NOTA_CREDITO_A", label: "Nota de Crédito A" },
        { value: "NOTA_DEBITO_A", label: "Nota de Débito A" },
      ];
    } else if (facturaType === "FACTURA_B") {
      return [
        { value: "NOTA_CREDITO_B", label: "Nota de Crédito B" },
        { value: "NOTA_DEBITO_B", label: "Nota de Débito B" },
      ];
    }

    // Por defecto, mostrar solo A
    return [
      { value: "NOTA_CREDITO_A", label: "Nota de Crédito A" },
      { value: "NOTA_DEBITO_A", label: "Nota de Débito A" },
    ];
  };

  // Inicializar el tipo de nota según el tipo de factura
  useEffect(() => {
    if (invoice?.type) {
      const facturaType = invoice.type;
      const notaType =
        facturaType === "FACTURA_B" ? "NOTA_CREDITO_B" : "NOTA_CREDITO_A";

      setFormData((prev) => ({
        ...prev,
        type: notaType,
        associatedVoucherType: facturaType,
        voucherNumber: invoice.voucherNumber || 0,
        pointOfSale: invoice.pointOfSale || 0,
        associatedVoucherNumber: invoice.voucherNumber || "",
      }));
    }
  }, [invoice]);

  // Actualizar el tipo de nota cuando cambie el tipo de factura
  useEffect(() => {
    const facturaType = formData.associatedVoucherType;

    if (facturaType === "FACTURA_A" && formData.type.includes("B")) {
      setFormData((prev) => ({
        ...prev,
        type: "NOTA_CREDITO_A",
      }));
    } else if (facturaType === "FACTURA_B" && formData.type.includes("A")) {
      setFormData((prev) => ({
        ...prev,
        type: "NOTA_CREDITO_B",
      }));
    }
  }, [formData.associatedVoucherType]);

  // Función para generar número
  const handleGenerateNumber = () => {
    setShouldGenerateNumber(true);
    refetchNextNumber();
  };

  // Función para manejar la selección de productos
  const handleProductSelection = (productIndex) => {
    const newSelectedProducts = new Set(selectedProducts);
    if (newSelectedProducts.has(productIndex)) {
      newSelectedProducts.delete(productIndex);
    } else {
      newSelectedProducts.add(productIndex);
    }
    setSelectedProducts(newSelectedProducts);
  };

  // Función para calcular el total basado en productos seleccionados
  const calculateTotalFromSelectedProducts = () => {
    if (!formData.products.length) return 0;

    const total = formData.products
      .filter((_, index) => selectedProducts.has(index))
      .reduce((total, product) => total + product.quantity * product.price, 0);

    // Redondear a máximo 2 decimales
    return Math.round(total * 100) / 100;
  };

  // Efecto para actualizar el total cuando cambien los productos seleccionados
  useEffect(() => {
    const newTotal = calculateTotalFromSelectedProducts();
    setFormData((prev) => ({
      ...prev,
      totalAmount: newTotal,
    }));
  }, [selectedProducts, formData.products]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFileInvoice className="text-2xl text-orange-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Crear Nota</h2>
                <p className="text-gray-600">
                  Basada en la factura {invoice?.numero}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la factura base */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Factura Base
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Número:</span>
                <span className="ml-2 font-medium">{invoice?.numero}</span>
              </div>
              <div>
                <span className="text-gray-600">Cliente:</span>
                <span className="ml-2 font-medium">
                  {isLoadingClient ? (
                    <span className="text-gray-400">Cargando...</span>
                  ) : clientData?.name ? (
                    clientData.name
                  ) : (
                    "Cliente no encontrado"
                  )}
                </span>
              </div>
              {clientData?.documentNumber && (
                <div>
                  <span className="text-gray-600">CUIL/DNI:</span>
                  <span className="ml-2 font-medium font-mono">
                    {clientData.documentNumber}
                  </span>
                </div>
              )}
              {clientData?.ivaCondition && (
                <div>
                  <span className="text-gray-600">Condición IVA:</span>
                  <span className="ml-2 font-medium">
                    {clientData.ivaCondition}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">
                  ${invoice?.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <span className="ml-2 font-medium">
                  {invoice?.fecha
                    ? new Date(invoice.fecha).toLocaleDateString("es-AR")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Configuración de la nota */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Nota
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {getAvailableNotaTypes().map((notaType) => (
                  <option key={notaType.value} value={notaType.value}>
                    {notaType.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Emisión
              </label>
              <input
                type="date"
                name="emissionDate"
                value={formData.emissionDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Generación de números */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Generar Números de Nota
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              ⚠️ Es obligatorio generar los números de nota antes de poder crear
              la nota.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Nota
                </label>
                <input
                  type="text"
                  value={formData.voucherNumber || "No generado"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punto de Venta
                </label>
                <input
                  type="text"
                  value={formData.pointOfSale || "No generado"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  readOnly
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateNumber}
                  disabled={isLoadingNextNumber || numberGenerated}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoadingNextNumber ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generando...
                    </>
                  ) : numberGenerated ? (
                    <>
                      <span>✓ Generado</span>
                    </>
                  ) : (
                    <>
                      <span>Generar Números</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Productos de la factura (con selección) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Productos de la Factura
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona los productos que quieres incluir en la nota:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between bg-white p-3 rounded-lg border transition-colors ${
                      selectedProducts.has(index)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(index)}
                        onChange={() => handleProductSelection(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {product.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          Código: {product.code} | Cantidad: {product.quantity}{" "}
                          | Precio: ${product.price}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">
                        ${(product.quantity * product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    Total de la Nota:
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    ${formData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProducts.size} de {formData.products.length}{" "}
                  productos seleccionados
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !numberGenerated}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                numberGenerated
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : !numberGenerated ? (
                <>
                  <span>Generar números primero</span>
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Crear Nota
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
