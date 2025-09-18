/*eslint-disable*/
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaBox,
  FaTruck,
  FaFileInvoice,
  FaUsers,
  FaCogs,
  FaTv,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaList,
} from "react-icons/fa";

import NotificationDropdown from "components/Dropdowns/NotificationDropdown.js";
import SidebarItem from "./SidebarItem";
import { LogoutButton } from "components/Buttons/LogoutButton";
import useAuthStore from "stores/useAuthStore";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const [facturacionExpanded, setFacturacionExpanded] = React.useState(false);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Si no hay usuario, no renderizar el sidebar
  if (!user) {
    return null;
  }

  // Verificar si estamos en una ruta de facturación
  const isFacturacionRoute = location.pathname.includes("/admin/facturacion");

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <FaBars className="text-lg" />
          </button>

          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
            to="/"
          >
            Sistema de gestión Ketush
          </Link>

          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <NotificationDropdown />
            </li>
          </ul>

          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Botón de cerrar (X) solo en móviles */}
            <div className="flex justify-end md:hidden">
              <button
                className="text-black px-3 py-1 text-xl bg-transparent rounded focus:outline-none"
                type="button"
                onClick={() => setCollapseShow("hidden")}
              >
                <FaTimes />
              </button>
            </div>
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <SidebarItem
                icon={<FaTv className="text-blueGray-400" />}
                label="Inicio"
                path="/admin/dashboard"
                activeMatch={["/", "/admin/dashboard"]}
              />
              <hr className="my-2 border-blueGray-200" />

              <SidebarItem
                icon={<FaBox className="text-blueGray-400" />}
                label="Productos"
                path="productos"
                activeMatch={"/admin/productos"}
              />
              <hr className="my-2 border-blueGray-200" />

              <SidebarItem
                icon={<FaTruck className="text-blueGray-400" />}
                label="Proveedores"
                path="proveedores"
                activeMatch={"/admin/proveedores"}
              />
              <hr className="my-2 border-blueGray-200" />

              {/* Facturación con subrutas */}
              <li className="relative">
                <button
                  onClick={() => setFacturacionExpanded(!facturacionExpanded)}
                  className={`w-full flex items-center justify-between  py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isFacturacionRoute
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex text-lg font-bold items-center">
                    <FaFileInvoice
                      className={`mr-3 ${isFacturacionRoute ? "text-blue-600" : "text-blueGray-400"}`}
                    />
                    Facturación
                  </div>
                  {facturacionExpanded ? (
                    <FaChevronDown className="w-4 h-4" />
                  ) : (
                    <FaChevronRight className="w-4 h-4" />
                  )}
                </button>

                {facturacionExpanded && (
                  <ul className="ml-8 mt-2 space-y-1  font-bold">
                    <li>
                      <Link
                        to="/admin/facturacion"
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                          location.pathname === "/admin/facturacion"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                      >
                        <FaPlus className="mr-3 w-3 h-3" />
                        Crear Factura
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/facturacion/listar"
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                          location.pathname === "/admin/facturacion/listar"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                      >
                        <FaList className="mr-3 w-3 h-3" />
                        Ver Facturas
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <hr className="my-2 border-blueGray-200" />

              <SidebarItem
                icon={<FaUsers className="text-blueGray-400" />}
                label="Clientes"
                path="clientes"
                activeMatch={"/admin/clientes"}
              />
              <hr className="my-2 border-blueGray-200" />

              <SidebarItem
                icon={<FaCogs className="text-blueGray-400" />}
                label="Gestión"
                path="gestion"
                activeMatch={"/admin/gestion"}
              />
            </ul>
          </div>
          {/* Logout Button */}
          <div className="flex  flex-col items-center pb-2 mt-4 md:mt-0">
            <p>{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <LogoutButton className="mt-4 md:mt-0" />
        </div>
      </nav>
    </>
  );
}
