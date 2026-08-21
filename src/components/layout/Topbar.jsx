import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  UserCircle2,
  AlertTriangle,
  Info,
  Menu,
} from "lucide-react";

import { useAppState } from "../../context/useAppState";

const pageSubtitle = {
  Dashboard: "Pantau kondisi lahan Anda hari ini.",
  Monitoring: "Peta digital, layer & perbandingan waktu",
  Drone: "Status armada & perencanaan misi",
  Analytics: "Tren NDVI & statistik lahan",
  Settings: "Preferensi akun & sistem",
};

const Topbar = ({ onMenuClick = () => {} }) => {
  const {
    activePage,
    farmland,
    setSelectedArea,
    setActivePage,
    notifications,
    markAllNotificationsRead,
  } = useAppState();

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return farmland.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.crop.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q)
    );
  }, [query, farmland]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const goToField = (field) => {
    setSelectedArea(field);
    setActivePage("Monitoring");
    setQuery("");
    setShowResults(false);
  };

  return (
    <header className="relative flex h-auto min-h-20 flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">

      {/* Judul */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-xl border border-slate-200 p-2.5 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl">
            {activePage}
          </h1>

          <p className="hidden truncate text-sm text-slate-500 sm:block">
            {pageSubtitle[activePage] || "GeoFarm GIS Monitoring System"}
          </p>
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 sm:px-4">
            <Search size={18} className="shrink-0 text-slate-500" />

            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              placeholder="Cari lahan..."
              className="w-20 bg-transparent outline-none sm:w-48"
            />
          </div>

          {showResults && query && (
            <div className="absolute right-0 z-[1100] mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {results.length === 0 ? (
                <p className="p-3 text-sm text-slate-400">
                  Tidak ditemukan lahan yang cocok.
                </p>
              ) : (
                results.map((f) => (
                  <button
                    key={f.id}
                    onMouseDown={() => goToField(f)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    <span>
                      <span className="font-medium">{f.name}</span>
                      <span className="ml-2 text-slate-400">{f.crop}</span>
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: f.color }}
                    >
                      {f.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 z-[1100] mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Notifikasi</h3>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-green-600 hover:underline"
                >
                  Tandai semua dibaca
                </button>
              </div>

              <div className="max-h-72 space-y-2 overflow-auto">
                {notifications.length === 0 && (
                  <p className="p-3 text-sm text-slate-400">
                    Belum ada notifikasi.
                  </p>
                )}

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-2 rounded-lg p-2 text-sm ${
                      n.read ? "bg-white" : "bg-green-50"
                    }`}
                  >
                    {n.type === "alert" ? (
                      <AlertTriangle size={16} className="mt-0.5 text-red-500" />
                    ) : (
                      <Info size={16} className="mt-0.5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium text-slate-700">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100">
          <UserCircle2 size={34} className="text-green-600" />
        </button>

      </div>

    </header>
  );
};

export default Topbar;
