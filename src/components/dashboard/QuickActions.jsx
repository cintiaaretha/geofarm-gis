import { useState } from "react";
import { Plane, CalendarClock, FileDown, Bell, X } from "lucide-react";
import { useAppState } from "../../context/useAppState";

const QuickActions = () => {
  const {
    droneFlying,
    toggleDroneFlying,
    farmland,
    addMission,
    notifications,
    markAllNotificationsRead,
  } = useAppState();

  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [missionBlock, setMissionBlock] = useState(farmland[0]?.id ?? "");
  const [missionDate, setMissionDate] = useState("");
  const [missionNote, setMissionNote] = useState("");

  const handleScheduleMission = (e) => {
    e.preventDefault();
    const block = farmland.find((f) => f.id === Number(missionBlock));
    addMission({
      blockName: block?.name ?? "Lahan",
      date: missionDate || "Belum dijadwalkan",
      note: missionNote,
    });
    setShowMissionModal(false);
    setMissionNote("");
    setMissionDate("");
  };

  const handleDownloadReport = () => {
    const header = "Blok,Status,NDVI,Kelembapan,Luas,Rekomendasi\n";
    const rows = farmland
      .map(
        (f) =>
          `${f.name},${f.status},${f.ndvi},${f.moisture},${f.area},"${f.recommendation}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-geofarm-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Aksi Cepat</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={toggleDroneFlying}
          className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition
            ${
              droneFlying
                ? "bg-green-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
        >
          <Plane size={22} />
          {droneFlying ? "Hentikan Drone" : "Terbangkan Drone"}
        </button>

        <button
          onClick={() => setShowMissionModal(true)}
          className="flex flex-col items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          <CalendarClock size={22} />
          Rencanakan Misi
        </button>

        <button
          onClick={handleDownloadReport}
          className="flex flex-col items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          <FileDown size={22} />
          Laporan
        </button>

        <button
          onClick={() => setShowNotifPanel(true)}
          className="relative flex flex-col items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          <Bell size={22} />
          Notifikasi
          {unreadCount > 0 && (
            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal Rencanakan Misi */}
      {showMissionModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rencanakan Misi Drone</h3>
              <button onClick={() => setShowMissionModal(false)}>
                <X size={20} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleScheduleMission} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-500">
                  Petak Lahan
                </label>
                <select
                  value={missionBlock}
                  onChange={(e) => setMissionBlock(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                >
                  {farmland.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} &middot; {f.crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-500">
                  Tanggal & Waktu
                </label>
                <input
                  type="datetime-local"
                  value={missionDate}
                  onChange={(e) => setMissionDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-500">
                  Catatan (opsional)
                </label>
                <textarea
                  value={missionNote}
                  onChange={(e) => setMissionNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-green-500"
                  placeholder="Misal: fokus pemetaan area kekeringan"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 py-2.5 font-medium text-white transition hover:bg-green-700"
              >
                Jadwalkan Misi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Panel Notifikasi */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notifikasi</h3>
              <button onClick={() => setShowNotifPanel(false)}>
                <X size={20} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <button
              onClick={markAllNotificationsRead}
              className="mb-3 text-xs text-green-600 hover:underline"
            >
              Tandai semua dibaca
            </button>

            <div className="max-h-80 space-y-2 overflow-auto">
              {notifications.length === 0 && (
                <p className="p-3 text-sm text-slate-400">Belum ada notifikasi.</p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-lg p-3 text-sm ${n.read ? "bg-slate-50" : "bg-green-50"}`}
                >
                  <p className="font-medium text-slate-700">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
