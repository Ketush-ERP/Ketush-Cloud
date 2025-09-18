import React, { useState } from "react";
import ClienteForm from "components/Clientes/ClienteForm";
import { useContacts, useDeleteContact } from "hooks/useContactsApi";
import useContactsTableStore from "stores/useContactsTableStore";
import LoadingScreen from "components/LoadingScreen";
import ErrorFallback from "components/ErrorFallback";
import { DataTable } from "components/Tables/DataTable";
import { ErrorBoundary } from "react-error-boundary";

export const Clientes = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { offset, pageSize, search, setOffset, setPageSize, setSearch } =
    useContactsTableStore();

  const { data, isLoading, isError, error } = useContacts({
    offset,
    pageSize,
    search,
    type: "CLIENT",
  });

  const deleteContactMutation = useDeleteContact();

  const handleAddCliente = () => {
    setShowForm(false);
  };

  const handleDeleteCliente = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await deleteContactMutation.mutateAsync(id);
      } catch (error) {
        // El error ya se maneja en el hook con toast
        console.error("Error al eliminar cliente:", error);
      }
    }
  };

  // Definir columnas para el DataTable
  const contactColumns = [
    { field: "code", headerName: "Código", width: 100 },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "ivaCondition", headerName: "IVA", width: 180 },
    { field: "documentType", headerName: "Tipo Doc.", width: 100 },
    { field: "documentNumber", headerName: "N° Doc.", width: 150 },
    { field: "phone", headerName: "Teléfono", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "address", headerName: "Dirección", width: 200 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: (params) => (
        <button
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          onClick={() => handleDeleteCliente(params.row.id)}
          disabled={deleteContactMutation.isLoading}
        >
          {deleteContactMutation.isLoading ? "Eliminando..." : "Borrar"}
        </button>
      ),
    },
  ];

  // Mapear datos de la API al formato que espera DataGrid
  const contactRows = (data?.data || []).map((contact) => ({
    id: contact.id,
    code: contact.code,
    name: contact.name,
    ivaCondition: contact.ivaCondition,
    documentType: contact.documentType,
    documentNumber: contact.documentNumber,
    phone: contact.phone,
    email: contact.email,
    address: contact.address,
    type: contact.type === "SUPPLIER" ? "Proveedor" : "Cliente",
  }));

  if (isLoading) return <LoadingScreen text="Cargando clientes..." />;
  if (isError) return <ErrorFallback error={error} />;

  // Verificar si no hay contactos
  const hasNoContacts = !data?.data || data.data.length === 0;
  const isSearchResult = search && hasNoContacts;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-full shadow-lg mb-3">
          <svg
            className="w-10 h-10 text-white"
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
        </div>
        <h1 className="text-3xl font-bold text-blue-800 drop-shadow mb-1">
          Clientes
        </h1>
        <p className="text-blue-900 text-sm">Gestión de clientes registrados</p>
      </div>

      <div className="w-full max-w-7xl flex-1 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center bg-white/90 p-4 rounded-xl shadow border border-blue-100">
          <div className="flex-1 mr-4">
            <input
              type="text"
              placeholder="Buscar cliente por nombre o número de documento..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOffset(1);
                  setSearch(searchInput);
                }
              }}
              className="border px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl shadow hover:from-blue-700 hover:to-purple-700 font-semibold transition-all"
            onClick={() => setShowForm(true)}
          >
            <svg
              className="w-5 h-5 inline-block mr-1 -mt-1"
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
            Nuevo cliente
          </button>
        </div>

        {showForm && (
          <div className="mb-4">
            <ClienteForm
              onSubmit={handleAddCliente}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {isSearchResult ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No se encontraron clientes
            </div>
            <div className="text-sm">
              Intenta con otros términos de búsqueda
            </div>
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setOffset(1);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : hasNoContacts ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-lg font-medium mb-2">
              No hay clientes cargados
            </div>
            <div className="text-sm">Comienza agregando un nuevo cliente</div>
          </div>
        ) : (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <DataTable
              columns={contactColumns}
              rows={contactRows}
              pageSize={pageSize}
              rowCount={data?.meta?.total || 0}
              page={offset - 1}
              paginationMode="server"
              onPageChange={(newPage) => {
                console.log("Clientes onPageChange called with:", newPage);
                setOffset(newPage + 1);
              }}
              onPageSizeChange={(newPageSize) => {
                console.log(
                  "Clientes onPageSizeChange called with:",
                  newPageSize
                );
                setPageSize(newPageSize);
              }}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
