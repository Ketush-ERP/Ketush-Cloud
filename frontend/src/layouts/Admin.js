// layouts/Admin.js
import React from "react";
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import { Outlet } from "react-router-dom"; // <-- Importa desde react-router-dom

export default function Admin() {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <div className="px-2 min-h-screen w-full">
          <Outlet /> {/* Aquí se renderizan las rutas hijas */}
        </div>
      </div>
    </>
  );
}
