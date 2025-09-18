/**
 * Componente de formulario para crear facturas
 *
 * Este componente maneja la creación completa de facturas incluyendo:
 * - Selección de tipo de comprobante (A, B) - Las tipo C no se emiten en esta empresa
 * - Generación automática de números de factura
 * - Selección de clientes con búsqueda
 * - Agregado de productos con persistencia de selecciones
 * - Cálculo automático de totales
 * - Envío de datos al endpoint de facturación
 *
 * @param {Function} onSubmit - Callback que se ejecuta cuando se crea la factura exitosamente
 */
import ClienteForm from "components/Clientes/ClienteForm";
import ProductoSelectorModal from "components/Tables/ProductoSelectorModal";
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useContacts, useCreateContact } from "hooks/useContactsApi";
import {
  useNextInvoiceNumber,
  useCreateVoucher,
  mapVoucherType,
} from "hooks/useVoucherApi";
import useAuthStore from "stores/useAuthStore";
import toast from "react-hot-toast";

const tiposComprobante = [
  { value: "A", label: "Factura A" },
  { value: "B", label: "Factura B" },
  { value: "PRESUPUESTO", label: "Presupuesto" },
  // COMENTADO: Esta empresa no emite facturas tipo C
  // { value: "C", label: "Factura C" },
];

// Opciones de condición frente al IVA según tipo de factura
// COMENTADO: El backend asigna automáticamente la condición IVA según el cliente
/*
const condicionesIVA = {
  A: [
    { value: "responsable_inscripto", label: "IVA responsable inscripto" },
    { value: "monotributo", label: "Responsable monotributo" },
    { value: "social", label: "Monotributista social" },
    {
      value: "promovido",
      label: "Monotributo Trabajador Independiente Promovido",
    },
  ],
  B: [
    { value: "exento", label: "IVA Sujeto Exento (ID 4)" },
    { value: "final", label: "Consumidor Final (ID 5)" },
    { value: "no_cat", label: "Sujeto No Categor. (ID 7)" },
    { value: "prov_ext", label: "Proveedor del Exterior (ID 8)" },
    { value: "cli_ext", label: "Cliente del Exterior (ID 9)" },
    { value: "liberado", label: "IVA Liberado Ley 19.640 (ID 10)" },
    { value: "no_alcanzado", label: "IVA No Alcanzado (ID 15)" },
  ],
};
*/

// Mapeo de condiciones IVA por tipo de factura para filtrado de clientes
// Los valores deben coincidir exactamente con ivaCondition del backend
const condicionesIVAporTipo = {
  A: [
    "RESPONSABLE_INSCRIPTO",
    "MONOTRIBUTISTA",
    "MONOTRIBUTISTA_SOCIAL",
    "MONOTRIBUTISTA_PROMOVIDO",
  ],
  B: [
    "EXENTO",
    "CONSUMIDOR_FINAL",
    "SUJETO_NO_CATEGORIZADO",
    "PROVEEDOR_EXTERIOR",
    "CLIENTE_EXTERIOR",
    "IVA_LIBERADO",
    "IVA_NO_ALCANZADO",
  ],

  // COMENTADO: Esta empresa no emite facturas tipo C
  // C: [
  //   "EXENTO",
  //   "CONSUMIDOR_FINAL",
  //   "SUJETO_NO_CATEGORIZADO",
  //   "PROVEEDOR_EXTERIOR",
  //   "CLIENTE_EXTERIOR",
  //   "IVA_LIBERADO",
  //   "IVA_NO_ALCANZADO"
  // ], // Las facturas C ahora pueden usar los mismos clientes que las B
};

// Hook personalizado para debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Función de utilidad para validar y redondear precios
function validarYRedondearPrecio(precio, nombreProducto = "") {
  const precioNum = Number(precio);

  // Verificar si es un número válido
  if (isNaN(precioNum)) {
    throw new Error(
      `El precio del producto "${nombreProducto}" no es un número válido`
    );
  }

  // Siempre redondear a 2 decimales automáticamente
  const precioRedondeado = Math.round(precioNum * 100) / 100;

  // Si el precio original tenía más de 2 decimales, mostrar un toast informativo
  if (precioNum % 1 !== 0 && precioNum.toString().split(".")[1]?.length > 2) {
    // Usar toast directamente ya que está importado en el componente
    // Nota: toast se mostrará desde el componente que llama a esta función
    console.log(
      `Precio del producto "${nombreProducto}" redondeado automáticamente de ${precioNum} a ${precioRedondeado}`
    );
  }

  return precioRedondeado;
}

export default function FacturacionForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      productos: [],
      cargarEnArca: true,
      fechaEmision: "", // No establecer fecha fija aquí
      numeroFactura: "",
      numeroFacturaDisplay: "",
    },
  });

  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSearchInput, setClienteSearchInput] = useState("");
  const [newClienteId, setNewClienteId] = useState(null);
  const clienteSearchInputRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [shouldGenerateNumber, setShouldGenerateNumber] = useState(false);
  const [numberGenerated, setNumberGenerated] = useState(false);
  const [pointOfSale, setPointOfSale] = useState(null);

  // Estados para producto personalizado
  const [customProductName, setCustomProductName] = useState("");
  const [customProductQuantity, setCustomProductQuantity] = useState(1);
  const [customProductPrice, setCustomProductPrice] = useState("");
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);

  const navigate = useNavigate();

  // Debounce para la búsqueda de clientes
  const clienteSearch = useDebounce(clienteSearchInput, 700);

  // Efecto para actualizar la fecha de emisión a la fecha actual
  useEffect(() => {
    console.log("=== useEffect EJECUTÁNDOSE ===");
    const today = new Date().toISOString().split("T")[0];
    console.log("useEffect - Actualizando fecha a:", today);
    console.log(
      "useEffect - Fecha actual del sistema:",
      new Date().toISOString()
    );

    // Usar setTimeout para asegurar que se ejecute después del montaje
    setTimeout(() => {
      setValue("fechaEmision", today);
      console.log("useEffect - setValue ejecutado para fechaEmision:", today);

      // Verificar que se haya establecido correctamente
      const currentValue = watch("fechaEmision");
      console.log("useEffect - Valor actual de fechaEmision:", currentValue);
      console.log("useEffect - Tipo del valor:", typeof currentValue);
    }, 0);
  }, []); // Dependencias vacías para ejecutar solo al montar

  // Hooks para obtener datos
  const {
    data: clientesData,
    isLoading: isLoadingClientes,
    refetch: refetchClientes,
  } = useContacts({
    offset: 1,
    pageSize: 100,
    search: clienteSearch,
    type: "CLIENT",
  });

  const createContactMutation = useCreateContact();
  const createVoucherMutation = useCreateVoucher();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "productos",
  });

  const tipoComprobante = watch("tipoComprobante");
  // COMENTADO: Ya no se usan opciones de condición IVA
  // const opcionesCondIVA = useMemo(
  //   () => condicionesIVA[tipoComprobante] || [],
  //   [tipoComprobante]
  // );
  const clienteSeleccionado = watch("cliente");

  // Filtrar solo clientes del tipo CLIENT y que correspondan al tipo de factura seleccionado
  const clientesList = useMemo(() => {
    if (!clientesData?.data) return [];

    // Primero filtrar solo clientes del tipo CLIENT
    let clientesFiltrados = clientesData.data.filter(
      (cliente) => cliente.type === "CLIENT"
    );

    // Debug: mostrar información sobre el filtrado
    console.log("=== DEBUG FILTRADO DE CLIENTES ===");
    console.log("Tipo de comprobante seleccionado:", tipoComprobante);
    console.log(
      "Total de clientes antes del filtro:",
      clientesFiltrados.length
    );
    console.log(
      "Clientes disponibles:",
      clientesFiltrados.map((c) => ({
        name: c.name,
        ivaCondition: c.ivaCondition,
      }))
    );

    // Si no hay tipo de comprobante seleccionado, mostrar todos los clientes
    if (!tipoComprobante) {
      console.log(
        "Sin tipo de comprobante seleccionado, mostrando todos los clientes"
      );
      return clientesFiltrados;
    }

    //  mostrar clientes tipo B)

    // COMENTADO: Esta empresa no emite facturas tipo C
    // Para factura C, ahora también mostrar clientes (pueden usar los mismos que tipo B)
    // if (tipoComprobante === "C") {
    //   console.log("Factura tipo C - mostrando clientes válidos para tipo B");
    //   const condicionesPermitidas =
    //     condicionesIVAporTipo[tipoComprobante] || [];
    //   console.log(
    //     "Condiciones IVA permitidas para",
    //     tipoComprobante,
    //     ":",
    //     condicionesPermitidas
    //   );

    //   clientesFiltrados = clientesFiltrados.filter((cliente) => {
    //     const esValido = condicionesPermitidas.includes(cliente.ivaCondition);
    //     console.log(
    //       `Cliente ${cliente.name} (${cliente.ivaCondition}): ${esValido ? "VÁLIDO" : "NO VÁLIDO"}`
    //     );
    //     return esValido;
    //   });

    //   console.log("Clientes después del filtro:", clientesFiltrados.length);
    //   return clientesFiltrados;
    // }

    // Para facturas A y B, filtrar por condición IVA
    const condicionesPermitidas = condicionesIVAporTipo[tipoComprobante] || [];
    console.log(
      "Condiciones IVA permitidas para",
      tipoComprobante,
      ":",
      condicionesPermitidas
    );

    clientesFiltrados = clientesFiltrados.filter((cliente) => {
      const esValido = condicionesPermitidas.includes(cliente.ivaCondition);
      console.log(
        `Cliente ${cliente.name} (${cliente.ivaCondition}): ${esValido ? "VÁLIDO" : "NO VÁLIDO"}`
      );
      return esValido;
    });

    console.log("Clientes después del filtro:", clientesFiltrados.length);
    return clientesFiltrados;
  }, [clientesData, tipoComprobante]);

  // Obtener datos del cliente seleccionado para el CUIL
  const clienteSeleccionadoData = useMemo(() => {
    if (!clienteSeleccionado || !clientesList.length) return null;
    return clientesList.find((cli) => cli.id === clienteSeleccionado);
  }, [clienteSeleccionado, clientesList]);

  // Hook para obtener el siguiente número de factura
  const {
    data: nextInvoiceNumberData,
    isLoading: isLoadingNextNumber,
    refetch: refetchNextNumber,
    error: nextNumberError,
  } = useNextInvoiceNumber({
    cuil: useAuthStore.getState().user?.cuil,
    voucherType: mapVoucherType(tipoComprobante),
    enabled:
      shouldGenerateNumber &&
      !!useAuthStore.getState().user?.cuil &&
      !!tipoComprobante,
  });

  // Evita productos duplicados
  const productosAgregadosCodigos = fields.map((p) => p.codigo);

  // Calcular total
  const productos = watch("productos");
  const totalFactura = useMemo(() => {
    if (!productos || productos.length === 0) return 0;

    // Validar que todos los precios tengan máximo 2 decimales y redondearlos
    const total = productos.reduce((acc, prod) => {
      const precioValidado = validarYRedondearPrecio(prod.precio, prod.nombre);
      const cantidad = Number(prod.cantidad) || 1;
      return acc + precioValidado * cantidad;
    }, 0);

    // Redondear el total final a máximo 2 decimales para evitar problemas de precisión
    return Math.round(total * 100) / 100;
  }, [productos]);

  const handleNuevoCliente = useCallback(
    (data) => {
      createContactMutation.mutate(data, {
        onSuccess: (newCliente) => {
          console.log("Cliente creado exitosamente:", newCliente);
          // Refetch para obtener la lista actualizada
          refetchClientes().then(() => {
            // Actualizar el select de clientes con el nuevo cliente
            setValue("cliente", newCliente.id);
            setNewClienteId(newCliente.id);
            setModalClienteOpen(false);
          });
        },
        onError: (error) => {
          console.log("=== ERROR CALLBACK ===");
          console.error("Error al crear cliente en FacturacionForm:", error);
          console.error("Error response:", error.response);
        },
      });
    },
    [createContactMutation, refetchClientes, setValue]
  );

  const handleClienteSearch = (e) => {
    // Capturar la posición del scroll antes de actualizar el estado
    setScrollPosition(window.scrollY);
    setClienteSearchInput(e.target.value);
  };

  const handleClienteSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      // Preservar la posición del scroll cuando se presiona Enter
      const currentScrollY = window.scrollY;
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY);
      });
    }
  };

  // Función para generar código para productos personalizados
  const generateRandomCode = () => {
    return "0000";
  };

  // Función para agregar producto personalizado
  const handleAddCustomProduct = () => {
    if (!customProductName.trim()) {
      toast.error("El nombre del producto es requerido");
      return;
    }

    if (!customProductPrice || Number(customProductPrice) <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    if (customProductQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    try {
      const precioValidado = validarYRedondearPrecio(
        customProductPrice,
        customProductName
      );

      // Generar un ID único para el producto personalizado
      const customProductId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      append({
        id: customProductId,
        codigo: generateRandomCode(),
        nombre: customProductName.trim(),
        precio: precioValidado,
        precioBase: precioValidado,
        proveedor: "Producto personalizado",
        codigoProveedor: generateRandomCode(),
        cantidad: Number(customProductQuantity),
      });

      // Limpiar el formulario
      setCustomProductName("");
      setCustomProductQuantity(1);
      setCustomProductPrice("");
      setShowCustomProductForm(false);

      toast.success("Producto personalizado agregado exitosamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Función para cancelar el formulario de producto personalizado
  const handleCancelCustomProduct = () => {
    setCustomProductName("");
    setCustomProductQuantity(1);
    setCustomProductPrice("");
    setShowCustomProductForm(false);
  };

  /**
   * Función para generar el número de comprobante automáticamente
   * Se ejecuta cuando se presiona el botón "Generar número"
   */
  const handleGenerateInvoiceNumber = useCallback(() => {
    // Si ya se generó un número, no permitir generar otro
    if (numberGenerated) {
      toast.info("Ya se ha generado un número de comprobante válido");
      return;
    }

    if (!tipoComprobante) {
      toast.error("Debe seleccionar un tipo de comprobante");
      return;
    }

    setShouldGenerateNumber(true);
    setNumberGenerated(false);
    refetchNextNumber();
  }, [numberGenerated, tipoComprobante, refetchNextNumber]);

  /**
   * Efecto para actualizar automáticamente el campo de número de factura
   * cuando se obtiene el siguiente número disponible
   */
  useEffect(() => {
    if (nextInvoiceNumberData?.nextNumber && shouldGenerateNumber) {
      const number = nextInvoiceNumberData.nextNumber.number.toString();
      const pointOfSaleNumber =
        nextInvoiceNumberData.nextNumber.pointOfSale.toString();
      const formattedNumber = `${pointOfSaleNumber.padStart(4, "0")}-${number.padStart(8, "0")}`;
      setValue("numeroFacturaDisplay", formattedNumber);
      setValue("numeroFactura", number);
      setPointOfSale(nextInvoiceNumberData.nextNumber.pointOfSale);
      setShouldGenerateNumber(false);
      setNumberGenerated(true);
      toast.success("Número de comprobante generado automáticamente");
    }
  }, [nextInvoiceNumberData, shouldGenerateNumber, setValue]);

  /**
   * Efecto para mostrar errores en la generación del número
   */
  useEffect(() => {
    if (nextNumberError && shouldGenerateNumber) {
      toast.error("Error al generar número de comprobante");
      setShouldGenerateNumber(false);
      setNumberGenerated(false);
    }
  }, [nextNumberError, shouldGenerateNumber]);

  /**
   * Función para resetear el formulario a sus valores por defecto
   */
  const resetForm = useCallback(() => {
    // Resetear todos los campos del formulario
    setValue("tipoComprobante", "");
    // COMENTADO: Ya no existe el campo condicionIVA
    // setValue("condicionIVA", "");
    setValue("cliente", "");
    setValue("fechaEmision", new Date().toISOString().split("T")[0]);
    setValue("numeroFactura", "");
    setValue("numeroFacturaDisplay", "");
    setValue("cargarEnArca", false);

    // Limpiar productos
    fields.forEach((_, index) => remove(index));

    // Resetear estados relacionados
    setClienteSearchInput("");
    setNewClienteId(null);
    setShouldGenerateNumber(false);
    setNumberGenerated(false);
    setPointOfSale(null);

    // Resetear estados de producto personalizado
    setCustomProductName("");
    setCustomProductQuantity(1);
    setCustomProductPrice("");
    setShowCustomProductForm(false);

    // Limpiar búsqueda de clientes
    if (clienteSearchInputRef.current) {
      clienteSearchInputRef.current.value = "";
    }
  }, [setValue, fields, remove]);

  /**
   * Función para preparar y enviar los datos de la factura
   * @param {Object} formData - Datos del formulario
   */
  const handleSubmitVoucher = useCallback(
    async (formData) => {
      try {
        // Validaciones previas
        // Solo validar cliente si NO es factura tipo B y NO es presupuesto (las tipo C no se emiten en esta empresa)
        if (
          !["B", "PRESUPUESTO"].includes(formData.tipoComprobante) &&
          !clienteSeleccionadoData?.documentNumber
        ) {
          toast.error("Cliente sin CUIL válido");
          return;
        }

        if (
          !formData.numeroFactura &&
          formData.tipoComprobante !== "PRESUPUESTO"
        ) {
          toast.error("Debe generar un número de comprobante");
          return;
        }

        if (!formData.productos || formData.productos.length === 0) {
          toast.error("Debe agregar al menos un producto");
          return;
        }

        // Validar que todos los productos tengan ID
        const productosSinId = formData.productos.filter((p) => !p.id);
        if (productosSinId.length > 0) {
          console.error(productosSinId);

          toast.error("Algunos productos no tienen ID válido");
          return;
        }

        // Los precios se redondean automáticamente a 2 decimales
        // No es necesario bloquear el envío del formulario

        // Obtener el usuario actual de la aplicación
        const currentUser = useAuthStore.getState().user;

        // Debug: verificar el valor de la fecha antes de convertir
        console.log("DEBUG - formData.fechaEmision:", formData.fechaEmision);
        console.log(
          "DEBUG - Tipo de formData.fechaEmision:",
          typeof formData.fechaEmision
        );
        console.log(
          "DEBUG - Fecha actual del sistema:",
          new Date().toISOString()
        );

        // Usar la fecha actual en lugar del valor del formulario
        const currentDate = new Date();
        const currentDateISO = currentDate.toISOString();
        console.log("DEBUG - Usando fecha actual:", currentDateISO);

        // Preparar datos para la API según el formato requerido
        const voucherData = {
          cuil: parseInt(currentUser?.cuil), // CUIL del usuario de la aplicación (convertido a número)
          type: mapVoucherType(formData.tipoComprobante),
          emissionDate: currentDateISO, // Usar la fecha actual del sistema
          currency: "ARS",
          products: formData.productos.map((producto) => {
            // Para productos personalizados, usar un voucherId temporal
            const isCustomProduct = producto.id.startsWith("custom_");
            return {
              productId: isCustomProduct ? "0000" : producto.id, // "0000" para productos personalizados
              code: producto.codigo, // Código del producto
              description: producto.nombre,
              quantity: parseInt(producto.cantidad) || 1,
              price: validarYRedondearPrecio(producto.precio, producto.nombre), // Validar y redondear precio
              ...(isCustomProduct && { voucherId: "custom-product" }), // Agregar voucherId para productos personalizados
            };
          }),
          totalAmount: totalFactura,
          paidAmount: formData.tipoComprobante === "PRESUPUESTO" ? 0 : 0, // Los presupuestos siempre tienen paidAmount = 0
        };

        // Solo agregar campos específicos de factura si NO es presupuesto
        if (formData.tipoComprobante !== "PRESUPUESTO") {
          voucherData.voucherNumber = parseInt(formData.numeroFactura);
          voucherData.pointOfSale = pointOfSale || 1; // Usar el punto de venta generado o 1 por defecto
          voucherData.loadToArca = formData.cargarEnArca || false;
        } else {
          // Para presupuestos, siempre cargar en ARCA como false
          voucherData.loadToArca = false;
        }

        // Debug: verificar la fecha convertida
        console.log(
          "DEBUG - emissionDate usando fecha actual:",
          voucherData.emissionDate
        );

        // Solo agregar contactId si hay cliente seleccionado y NO es presupuesto
        // COMENTADO: Las facturas tipo C no se emiten en esta empresa
        if (
          clienteSeleccionadoData?.id &&
          formData.tipoComprobante !== "PRESUPUESTO"
        ) {
          voucherData.contactId = clienteSeleccionadoData.id;
        }

        console.log("Datos de factura a enviar:", voucherData);
        console.log("Usuario actual:", currentUser);
        console.log("Cliente seleccionado:", clienteSeleccionadoData);

        // Crear la factura
        const result = await createVoucherMutation.mutateAsync(voucherData);

        console.log("Factura creada:", result);
        console.log("Estructura de result:", {
          result,
          resultData: result?.data,
          resultId: result?.data?.id,
          resultDirectId: result?.id,
          keys: Object.keys(result || {}),
          dataKeys: result?.data ? Object.keys(result.data) : "No data",
        });

        // Verificar si hay un error en la respuesta
        if (
          result?.data?.status === 400 ||
          result?.data?.message?.includes("No se pudo obtener el CAE")
        ) {
          console.error("Error al crear factura - CAE no disponible:", result);
          const mensaje =
            formData.tipoComprobante === "PRESUPUESTO"
              ? "Presupuesto creado pero hubo un problema con el CAE. El presupuesto se creó sin carga a AFIP."
              : "Factura creada pero hubo un problema con el CAE. La factura se creó sin carga a AFIP.";
          toast.error(mensaje);

          // No redirigir, solo resetear el formulario
          resetForm();
          return;
        }

        // Verificar si la factura se creó exitosamente
        if (result?.success === true && result?.data?.id) {
          const mensaje =
            formData.tipoComprobante === "PRESUPUESTO"
              ? "Presupuesto creado exitosamente"
              : "Factura creada exitosamente";
          toast.success(mensaje);

          // Resetear el formulario
          resetForm();

          // Redirigir a la página de detalle de la factura existente
          navigate(`/admin/facturacion/${result.data.id}`);
        } else {
          console.error("Respuesta inesperada al crear factura:", result);
          const mensaje =
            formData.tipoComprobante === "PRESUPUESTO"
              ? "Presupuesto creado pero la respuesta no es la esperada"
              : "Factura creada pero la respuesta no es la esperada";
          toast.error(mensaje);
          resetForm();
        }
      } catch (error) {
        console.error("Error al crear factura:", error);
        const mensaje =
          formData.tipoComprobante === "PRESUPUESTO"
            ? "Error al crear el presupuesto"
            : "Error al crear la factura";
        toast.error(mensaje);
      }
    },
    [
      clienteSeleccionadoData,
      totalFactura,
      createVoucherMutation,
      onSubmit,
      pointOfSale,
      resetForm,
      navigate,
    ]
  );

  // Efecto para seleccionar automáticamente el nuevo cliente
  useEffect(() => {
    if (newClienteId && clientesList.some((cli) => cli.id === newClienteId)) {
      setValue("cliente", newClienteId);
      setNewClienteId(null);
    }
  }, [newClienteId, clientesList, setValue]);

  // Capturar la posición del scroll cuando cambie el valor del debounce
  useEffect(() => {
    if (clienteSearch && clienteSearchInput) {
      setScrollPosition(window.scrollY);
    }
  }, [clienteSearch, clienteSearchInput]);

  // Preservar la posición del scroll durante las búsquedas de clientes
  useEffect(() => {
    if (clienteSearchInput && !isLoadingClientes && scrollPosition > 0) {
      // Restaurar la posición del scroll después de que se complete la búsqueda
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 50);
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  }, [clientesData, isLoadingClientes, clienteSearchInput, scrollPosition]);

  // Restaurar posición del scroll inmediatamente después de cambios en clientesData
  useEffect(() => {
    if (clientesData && scrollPosition > 0) {
      // Usar requestAnimationFrame para asegurar que se ejecute después del render
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    }
  }, [clientesData, scrollPosition]);

  if (isLoadingClientes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header del formulario */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-16 translate-x-10 sm:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>

          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold break-words">
                {tipoComprobante === "PRESUPUESTO"
                  ? "Nuevo Presupuesto"
                  : "Nueva Factura"}
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm break-words">
                {tipoComprobante === "PRESUPUESTO"
                  ? "Complete los datos para generar el presupuesto"
                  : "Complete los datos para generar la factura"}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <form
            onSubmit={handleSubmit(handleSubmitVoucher)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Información del comprobante */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                Información del Comprobante
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
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
                    Tipo de comprobante *
                  </label>
                  <select
                    {...register("tipoComprobante", {
                      required: "Campo requerido",
                      onChange: (e) => {
                        // Invalidar el número de factura cuando cambia el tipo de comprobante
                        setValue("numeroFactura", "");
                        setValue("numeroFacturaDisplay", "");
                        // COMENTADO: Ya no existe el campo condicionIVA
                        // setValue("condicionIVA", "");
                        setShouldGenerateNumber(false);
                        setNumberGenerated(false);
                        setPointOfSale(null);

                        // Invalidar la query para forzar una nueva consulta del número de factura
                        refetchNextNumber();
                      },
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  >
                    <option value="">Seleccione tipo...</option>
                    {tiposComprobante.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipoComprobante && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.tipoComprobante.message}
                    </div>
                  )}

                  {/* Mensaje informativo sobre filtrado automático de clientes */}
                  {tipoComprobante && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {tipoComprobante === "A" &&
                          "Se mostrarán solo clientes responsables inscriptos, monotributistas, monotributistas sociales y monotributistas promovidos."}
                        {tipoComprobante === "B" &&
                          "Se mostrarán solo clientes exentos, consumidores finales, sujetos no categorizados, proveedores del exterior, clientes del exterior, IVA liberado y IVA no alcanzado."}
                        {tipoComprobante === "PRESUPUESTO" &&
                          "Los presupuestos no requieren número de factura, punto de venta ni información del cliente, y siempre se cargan en ARCA como false."}
                        {/* COMENTADO: Esta empresa no emite facturas tipo C
                        {tipoComprobante === "C" &&
                          "Las facturas tipo C pueden usar los mismos clientes que las facturas tipo B."}
                        */}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* COMENTADO: Campo de condición frente al IVA - El backend asigna automáticamente la condición IVA según el cliente */}
              {/* COMENTADO: Las facturas tipo C no se emiten en esta empresa */}
              {/* 
              {(tipoComprobante === "A" || tipoComprobante === "B") && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-purple-500"
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
                    Condición frente al IVA *
                  </label>
                  <select
                    {...register("condicionIVA", {
                      required: "Campo requerido",
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!tipoComprobante}
                  >
                    <option value="">
                      {tipoComprobante
                        ? "Seleccione condición IVA..."
                        : "Seleccione primero el tipo de comprobante"}
                    </option>
                    {opcionesCondIVA.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.condicionIVA && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        />
                      </svg>
                      {errors.condicionIVA.message}
                    </div>
                  )}
                </div>
              )}
              */}
            </div>

            {/* Fechas y numeración */}

            {/* Cliente - Solo mostrar si NO es presupuesto */}
            {tipoComprobante !== "PRESUPUESTO" && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Información del Cliente
                </h3>

                <div className="space-y-4">
                  {/* Mensaje informativo sobre filtrado de clientes */}
                  {tipoComprobante && (
                    <div className="flex items-center gap-2 text-purple-600 text-sm bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {tipoComprobante === "A" &&
                          `Clientes disponibles: ${clientesList.length} cliente(s) con condición IVA válida para Factura A`}
                        {tipoComprobante === "B" &&
                          `Clientes disponibles: ${clientesList.length} cliente(s) con condición IVA válida para Factura B`}
                        {/* COMENTADO: Esta empresa no emite facturas tipo C
                        {tipoComprobante === "C" &&
                          `Clientes disponibles: ${clientesList.length} cliente(s) con condición IVA válida para Factura C`}
                        */}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Buscar cliente
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        ref={clienteSearchInputRef}
                        type="text"
                        placeholder="Buscar cliente por nombre o DNI..."
                        value={clienteSearchInput}
                        onChange={handleClienteSearch}
                        onKeyDown={handleClienteSearchKeyDown}
                        onFocus={(e) => {
                          // Prevenir scroll automático al enfocar
                          e.target.scrollIntoView = () => {};
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      <button
                        type="button"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
                        onClick={() => setModalClienteOpen(true)}
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="hidden xs:inline">Nuevo Cliente</span>
                        <span className="xs:hidden">+ Cliente</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Cliente seleccionado{" "}
                      {!["B"].includes(tipoComprobante) ? "*" : ""}
                    </label>
                    <select
                      {...register("cliente", {
                        required: !["B"].includes(tipoComprobante)
                          ? "Campo requerido"
                          : false,
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Seleccione un cliente...</option>
                      {clientesList.map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.name} - {cli.ivaCondition} -{" "}
                          {cli.documentNumber && `(${cli.documentNumber} ) `}
                        </option>
                      ))}
                    </select>
                    {errors.cliente && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.cliente.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Fechas y Numeración
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Fecha de emisión *
                  </label>
                  <input
                    type="date"
                    {...register("fechaEmision", {
                      required: "Campo requerido",
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  />
                  {errors.fechaEmision && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.fechaEmision.message}
                    </div>
                  )}
                </div>

                {tipoComprobante !== "PRESUPUESTO" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-500"
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
                      Número de factura *
                    </label>
                    <div className="flex gap-2">
                      {/* Campos ocultos para el formulario */}
                      <input
                        type="hidden"
                        {...register("numeroFactura", {
                          required: "Debe generar un número de comprobante",
                        })}
                      />
                      <input
                        type="hidden"
                        {...register("numeroFacturaDisplay")}
                      />
                      <div
                        className={`flex-1 px-4 py-3 border-2 rounded-xl font-mono text-lg flex items-center justify-between ${
                          watch("numeroFactura")
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        }`}
                      >
                        <span>
                          {watch("numeroFacturaDisplay") ||
                            "Sin número generado"}
                        </span>
                        {watch("numeroFactura") && (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateInvoiceNumber}
                        disabled={
                          isLoadingNextNumber ||
                          !tipoComprobante ||
                          numberGenerated
                        }
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed flex items-center gap-2"
                        title={
                          numberGenerated
                            ? "Ya se ha generado un número válido"
                            : ""
                        }
                      >
                        {isLoadingNextNumber ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generando...
                          </>
                        ) : numberGenerated ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Número generado
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Generar número
                          </>
                        )}
                      </button>
                    </div>
                    {errors.numeroFactura && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.numeroFactura.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Productos */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Productos
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                    onClick={() =>
                      setShowCustomProductForm(!showCustomProductForm)
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {showCustomProductForm
                      ? "Cancelar"
                      : "Producto personalizado"}
                  </button>
                  <button
                    type="button"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                    onClick={() => setModalOpen(true)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Agregar producto
                  </button>
                </div>
              </div>

              {/* Formulario de producto personalizado */}
              {showCustomProductForm && (
                <div className="bg-white p-4 rounded-xl border-2 border-green-200 mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Agregar Producto Personalizado
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Nombre del producto *
                      </label>
                      <input
                        type="text"
                        value={customProductName}
                        onChange={(e) => setCustomProductName(e.target.value)}
                        placeholder="Ingrese el nombre del producto"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={customProductQuantity}
                        onChange={(e) =>
                          setCustomProductQuantity(Number(e.target.value))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Precio unitario *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customProductPrice}
                        onChange={(e) => setCustomProductPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleCancelCustomProduct}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomProduct}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Agregar a la lista
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border-2 border-gray-200 rounded-xl bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Código
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Nombre
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Precio Unit.
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Cantidad
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-700">
                        Subtotal
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 py-12"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <svg
                              className="w-12 h-12 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <div className="text-lg font-medium">
                              No hay productos agregados
                            </div>
                            <div className="text-sm">
                              Haga clic en "Agregar producto" para comenzar
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {fields.map((item, index) => {
                      const isCustomProduct = item.id.startsWith("custom_");
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="p-4 font-mono text-sm bg-gray-50 rounded-lg mx-2 my-1">
                            {item.codigo}
                            {isCustomProduct && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Personalizado
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {item.nombre}
                            {isCustomProduct && (
                              <div className="text-xs text-gray-500 mt-1">
                                Producto personalizado
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-mono font-semibold text-green-600">
                            ${Number(item.precio).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              min={1}
                              {...register(`productos.${index}.cantidad`, {
                                required: true,
                                min: 1,
                                valueAsNumber: true,
                                onChange: (e) => {
                                  const cantidad = Number(e.target.value) || 1;
                                  update(index, {
                                    ...fields[index],
                                    cantidad,
                                  });
                                },
                              })}
                              className="border-2 border-gray-200 rounded-lg px-3 py-2 w-20 text-center focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                              defaultValue={item.cantidad || 1}
                            />
                          </td>
                          <td className="p-4 font-mono font-bold text-blue-600">
                            $
                            {(
                              (Number(item.precio) || 0) *
                              (Number(productos?.[index]?.cantidad) || 1)
                            ).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:scale-105"
                              onClick={() => remove(index)}
                            >
                              <svg
                                className="w-4 h-4 inline mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Quitar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.productos && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Debe haber al menos un producto
                </div>
              )}
            </div>

            {/* Total y acciones finales */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="cargarEnArca"
                      {...register("cargarEnArca")}
                      disabled={tipoComprobante === "PRESUPUESTO"}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="cargarEnArca"
                      className={`font-semibold flex items-center gap-2 ${
                        tipoComprobante === "PRESUPUESTO"
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          tipoComprobante === "PRESUPUESTO"
                            ? "text-gray-400"
                            : "text-blue-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Cargar en ARCA
                      {tipoComprobante === "PRESUPUESTO" && (
                        <span className="text-xs text-gray-500 ml-2">
                          (No disponible para presupuestos)
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="text-right">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold">
                      Total: ${totalFactura.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    fields.length === 0 ||
                    createVoucherMutation.isPending
                  }
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isSubmitting || createVoucherMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {tipoComprobante === "PRESUPUESTO"
                        ? "Creando presupuesto..."
                        : "Creando factura..."}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {tipoComprobante === "PRESUPUESTO"
                        ? "Crear Presupuesto"
                        : "Crear Factura"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de búsqueda y selección */}
      <ProductoSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(producto) => {
          // Validar y redondear precios usando la función de utilidad
          const precioValidado = validarYRedondearPrecio(
            producto.precio,
            producto.nombre
          );
          const precioBaseValidado = validarYRedondearPrecio(
            producto.precioBase,
            producto.nombre
          );

          append({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: precioValidado,
            precioBase: precioBaseValidado,
            proveedor: producto.proveedor,
            codigoProveedor: producto.codigoProveedor,
            cantidad: 1,
          });
        }}
        productosAgregadosCodigos={productosAgregadosCodigos}
      />

      {/* Modal de nuevo cliente - FUERA del formulario principal */}
      {modalClienteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setModalClienteOpen(false)}
              className="absolute   top-4 right-4 text-2xl font-bold hover:text-gray-600 transition-colors duration-200"
            >
              &times;
            </button>

            <div className="mt-4">
              <ClienteForm
                onSubmit={handleNuevoCliente}
                useInternalMutation={false}
                onCancel={() => setModalClienteOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
