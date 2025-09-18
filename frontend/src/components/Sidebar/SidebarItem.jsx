import { Link, useLocation } from "react-router-dom";

export default function SidebarItem({ icon, label, path, activeMatch }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Soporta múltiples rutas que marcan el item como activo
  const isActive = activeMatch
    ? activeMatch.includes(currentPath)
    : currentPath === path;

  return (
    <li className="flex items-center ">
      <Link
        to={path}
        className={`text-md flex items-center uppercase py-3 font-bold block ${
          isActive
            ? "text-lightBlue-500 hover:text-lightBlue-600"
            : "text-blueGray-700 hover:text-blueGray-500"
        }`}
      >
        <span
          className={`mr-2 text-sm ${isActive ? "opacity-75" : "text-blueGray-300"}`}
        >
          {icon}
        </span>
        {label}
      </Link>
    </li>
  );
}
