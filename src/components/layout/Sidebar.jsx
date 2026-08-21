import {
  LayoutDashboard,
  Map,
  Plane,
  BarChart3,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

import { useAppState } from "../../context/useAppState";
import geofarmLogo from "../../assets/geofarm-logo.png";

const menus = [
  { title: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { title: "Monitoring", icon: <Map size={20} /> },
  { title: "Drone", icon: <Plane size={20} /> },
  { title: "Analytics", icon: <BarChart3 size={20} /> },
  { title: "Settings", icon: <SettingsIcon size={20} /> },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { activePage, setActivePage, droneFlying } = useAppState();

  const handleSelect = (title) => {
    setActivePage(title);
    onClose();
  };

  return (
    <>
      {/* Overlay saat sidebar terbuka di layar kecil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r
        border-slate-200 bg-white transition-transform duration-300 ease-in-out
        lg:static lg:z-auto lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <img
              src={geofarmLogo}
              alt="GeoFarm GIS"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                GeoFarm GIS
              </h1>

              <p className="text-sm text-slate-500">
                 Precision Agriculture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menus.map((menu) => (
            <button
              key={menu.title}
              onClick={() => handleSelect(menu.title)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all
              ${
                activePage === menu.title
                  ? "bg-green-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {menu.icon}
              <span>{menu.title}</span>
            </button>
          ))}
        </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-5">
        <div
          className={`rounded-xl p-4 ${
            droneFlying ? "bg-green-50" : "bg-slate-100"
          }`}
        >
          <h3
            className={`font-semibold ${
              droneFlying ? "text-green-700" : "text-slate-600"
            }`}
          >
            {droneFlying ? "Sistem Aktif" : "Drone Standby"}
          </h3>

          <p
            className={`mt-1 text-sm ${
              droneFlying ? "text-green-600" : "text-slate-500"
            }`}
          >
            {droneFlying
              ? "Semua layanan berjalan normal."
              : "Drone sedang tidak terbang."}
          </p>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
