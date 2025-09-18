import React, { useState } from "react";
import BancoForm from "components/Gestion/BancoForm";
import UsuarioForm from "components/Gestion/UsuarioForm";
import CardForm from "components/Gestion/CardForm";
import { useBanks, useCreateBank, useDeleteBank } from "hooks/useBanksApi";
import { useUsers, useCreateUser, useDeleteUser } from "hooks/useUsersApi";
import { useCards, useCreateCard, useDeleteCard } from "hooks/useCardsApi";
import toast from "react-hot-toast";
import { FaUserTie, FaCreditCard, FaUniversity, FaUsers } from "react-icons/fa";
import "assets/styles/gestion.css";

export const Gestion = () => {
  const [tab, setTab] = useState("banco");

  // Hooks para bancos
  const {
    data: bancos = [],
    isLoading: isLoadingBancos,
    error: errorBancos,
  } = useBanks();
  const { mutate: createBank, isLoading: isCreatingBank } = useCreateBank();
  const { mutate: deleteBank, isLoading: isDeletingBank } = useDeleteBank();

  // Hooks para tarjetas
  const {
    data: tarjetas = [],
    isLoading: isLoadingTarjetas,
    error: errorTarjetas,
  } = useCards();
  const { mutate: createCard, isLoading: isCreatingCard } = useCreateCard();
  const { mutate: deleteCard, isLoading: isDeletingCard } = useDeleteCard();

  // Hooks para usuarios
  const {
    data: usuarios = [],
    isLoading: isLoadingUsers,
    error: errorUsers,
  } = useUsers();
  const { mutate: createUser, isLoading: isCreatingUser } = useCreateUser();
  const { mutate: deleteUser, isLoading: isDeletingUser } = useDeleteUser();

  // Handlers para bancos
  const handleAddBanco = (data) => {
    // Solo enviar los campos requeridos por la API
    const bankData = {
      name: data.name,
      account: data.account,
      cbu: data.cbu,
      currency: data.currency,
    };

    console.log("Datos del banco a enviar:", bankData);

    createBank(bankData, {
      onSuccess: () => {
        toast.success("Banco creado correctamente");
      },
      onError: (err) => {
        console.error("Error completo:", err);
        toast.error("Error al crear banco", err.message);
      },
    });
  };

  const handleDeleteBanco = (id) => {
    deleteBank(id, {
      // Cambiar de deleteBank.mutate(id, ...) a deleteBank(id, ...)
      onSuccess: () => {
        toast.success("Banco eliminado correctamente");
      },
      onError: (err) => {
        toast.error("Error al eliminar banco: " + err.message);
      },
    });
  };

  // Handlers para tarjetas
  const handleAddTarjeta = (data) => {
    console.log("Datos de la tarjeta a enviar:", data);

    createCard(data, {
      onSuccess: (res) => {
        if (res?.message) {
          toast.error(res?.message);
        } else {
          toast.success("Tarjeta creada correctamente");
        }
      },
      onError: (err) => {
        console.error("Error completo:", err);
        toast.error("Error al crear tarjeta", err.message);
      },
    });
  };

  const handleDeleteTarjeta = (id) => {
    deleteCard(id, {
      onSuccess: () => {
        toast.success("Tarjeta eliminada correctamente");
      },
      onError: (err) => {
        toast.error("Error al eliminar tarjeta", err.message);
      },
    });
  };

  // Handler para registrar usuario
  const handleAddUsuario = (data) => {
    createUser(
      {
        name: data.nombre,
        email: data.gmail,
        password: data.password,
        cuil: data.cuil,
        role: data.role || "ADMIN",
      },
      {
        onSuccess: () => {
          toast.success("Usuario creado correctamente");
        },
        onError: (err) => {
          toast.error("Error al registrar usuario", err.message);
        },
      }
    );
  };
  const handleDeleteUsuario = (id) => {
    deleteUser(id, {
      onSuccess: () => {
        toast.success("Usuario eliminado correctamente");
      },
      onError: (err) => {
        toast.error("Error al eliminar usuario", err.message);
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 py-8">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-4 rounded-full shadow-lg mb-3">
          <FaUserTie className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-blue-800 drop-shadow mb-1">
          Gestión
        </h1>
        <p className="text-blue-900 text-sm">
          Administración de bancos y usuarios
        </p>
      </div>
      {/* Navegación mejorada */}
      <div className="nav-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-4xl">
        <button
          className={`nav-button hover-scale p-6 rounded-2xl font-semibold shadow-lg border-2 flex flex-col items-center gap-3 ${
            tab === "banco"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 active"
              : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:shadow-xl"
          }`}
          onClick={() => setTab("banco")}
        >
          <FaUniversity className="w-8 h-8" />
          <span className="text-lg">Bancos</span>
          <span className="text-sm opacity-80">Gestión bancaria</span>
        </button>

        <button
          className={`nav-button hover-scale p-6 rounded-2xl font-semibold shadow-lg border-2 flex flex-col items-center gap-3 ${
            tab === "tarjeta"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 active"
              : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:shadow-xl"
          }`}
          onClick={() => setTab("tarjeta")}
        >
          <FaCreditCard className="w-8 h-8" />
          <span className="text-lg">Tarjetas</span>
          <span className="text-sm opacity-80">Métodos de pago</span>
        </button>

        <button
          className={`nav-button hover-scale p-6 rounded-2xl font-semibold shadow-lg border-2 flex flex-col items-center gap-3 ${
            tab === "usuario"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 active"
              : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:shadow-xl"
          }`}
          onClick={() => setTab("usuario")}
        >
          <FaUsers className="w-8 h-8" />
          <span className="text-lg">Usuarios</span>
          <span className="text-sm opacity-80">Gestión de usuarios</span>
        </button>
      </div>
      {/* Contenido */}
      <div className="w-full max-w-4xl">
        <div className="bg-white/90 p-6 rounded-2xl shadow border border-blue-100 form-container">
          {tab === "banco" && (
            <>
              <BancoForm onSubmit={handleAddBanco} isLoading={isCreatingBank} />
              {errorBancos && (
                <div className="text-red-600 my-2">
                  Error al cargar bancos:{" "}
                  {errorBancos?.response?.data?.message || errorBancos.message}
                </div>
              )}
              <h2 className="text-xl font-bold mt-8 mb-2 text-blue-800">
                Bancos cargados
              </h2>
              <div className="overflow-x-auto table-fade-in">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 border">Nombre</th>
                      <th className="p-2 border">Cuenta</th>
                      <th className="p-2 border">CBU</th>
                      <th className="p-2 border">Moneda</th>
                      <th className="p-2 border">Estado</th>
                      <th className="p-2 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingBancos && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 py-2"
                        >
                          Cargando bancos...
                        </td>
                      </tr>
                    )}
                    {!isLoadingBancos && bancos.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 py-2"
                        >
                          No hay bancos cargados.
                        </td>
                      </tr>
                    )}
                    {!isLoadingBancos &&
                      bancos.map((banco) => (
                        <tr key={banco.id}>
                          <td className="border p-2">{banco.name}</td>
                          <td className="border p-2">{banco.account}</td>
                          <td className="border p-2">{banco.cbu}</td>
                          <td className="border p-2">{banco.currency}</td>
                          <td className="border p-2">
                            <span
                              className={`status-badge px-2 py-1 rounded text-xs font-semibold ${
                                banco.available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {banco.available ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="border p-2">
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                              onClick={() => handleDeleteBanco(banco.id)}
                              disabled={isDeletingBank}
                            >
                              {isDeletingBank ? "Eliminando..." : "Borrar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "tarjeta" && (
            <>
              <CardForm
                onSubmit={handleAddTarjeta}
                isLoading={isCreatingCard}
              />
              {errorTarjetas && (
                <div className="text-red-600 my-2">
                  Error al cargar tarjetas:{" "}
                  {errorTarjetas?.response?.data?.message ||
                    errorTarjetas.message}
                </div>
              )}
              <h2 className="text-xl font-bold mt-8 mb-2 text-blue-800">
                Tarjetas cargadas
              </h2>
              <div className="overflow-x-auto table-fade-in">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 border">Comisión (%)</th>
                      <th className="p-2 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTarjetas && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-gray-500 py-2"
                        >
                          Cargando tarjetas...
                        </td>
                      </tr>
                    )}
                    {!isLoadingTarjetas && tarjetas.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-gray-500 py-2"
                        >
                          No hay tarjetas cargadas.
                        </td>
                      </tr>
                    )}
                    {!isLoadingTarjetas &&
                      tarjetas.map((tarjeta) => (
                        <tr key={tarjeta.id} className="text-center">
                          <td className="border p-2">
                            <span className="font-semibold text-green-600">
                              {tarjeta.commissionPercentage
                                ? `${tarjeta.commissionPercentage}%`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="border p-2">
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                              onClick={() => handleDeleteTarjeta(tarjeta.id)}
                              disabled={isDeletingCard}
                            >
                              {isDeletingCard ? "Eliminando..." : "Borrar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "usuario" && (
            <>
              <UsuarioForm
                onSubmit={handleAddUsuario}
                isLoading={isCreatingUser}
              />
              {errorUsers && (
                <div className="text-red-600 my-2">
                  Error al cargar usuarios:{" "}
                  {errorUsers?.response?.data?.message || errorUsers.message}
                </div>
              )}
              <h2 className="text-xl font-bold mt-8 mb-2 text-blue-800">
                Usuarios cargados
              </h2>
              <div className="overflow-x-auto table-fade-in">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Nombre</th>
                      <th className="p-2 border">CUIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-500 py-2"
                        >
                          Cargando usuarios...
                        </td>
                      </tr>
                    )}
                    {!isLoadingUsers && usuarios.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-500 py-2"
                        >
                          No hay usuarios cargados.
                        </td>
                      </tr>
                    )}
                    {!isLoadingUsers &&
                      usuarios.map((usuario) => (
                        <tr key={usuario.id} className="">
                          <td className="border p-2">{usuario.email}</td>
                          <td className="border p-2">{usuario.name}</td>
                          <td className="border p-2">{usuario.cuil}</td>
                          <td className="border p-2">
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                              onClick={() => handleDeleteUsuario(usuario.id)}
                              disabled={isDeletingUser}
                            >
                              {isDeletingUser ? "Eliminando..." : "Borrar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
