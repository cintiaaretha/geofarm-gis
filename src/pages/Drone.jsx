import { Plane, Battery, Gauge, MapPin, CalendarClock } from "lucide-react";
import { useAppState } from "../context/useAppState";
import QuickActions from "../components/dashboard/QuickActions";

const fleet = [
  { id: "D-01", model: "DJI Phantom 4 RTK", status: "flying" },
  { id: "D-02", model: "DJI Mavic 3M", status: "standby" },
  { id: "D-03", model: "DJI Mavic 3M", status: "charging" },
  { id: "D-04", model: "senseFly eBee X", status: "standby" },
  { id: "D-05", model: "senseFly eBee X", status: "maintenance" },
];

const statusLabel = {
  flying: { text: "Sedang Terbang", color: "bg-green-100 text-green-700" },
  standby: { text: "Standby", color: "bg-slate-100 text-slate-600" },
  charging: { text: "Mengisi Daya", color: "bg-yellow-100 text-yellow-700" },
  maintenance: { text: "Perawatan", color: "bg-red-100 text-red-700" },
};

const Drone = () => {
  const { droneFlying, droneBattery, missions } = useAppState();

  return (
    <div className="space-y-6">

      {/* Status drone utama */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Plane size={18} />
            <span className="text-sm">Status</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {droneFlying ? "Sedang Memetakan" : "Standby"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Drone DJI Phantom 4 RTK</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Battery size={18} />
            <span className="text-sm">Baterai</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{droneBattery}%</h2>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${droneBattery}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-500">
            <Gauge size={18} />
            <span className="text-sm">Kecepatan & Ketinggian</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {droneFlying ? "24 km/jam" : "0 km/jam"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Ketinggian 120 meter</p>
        </div>
      </div>

      <QuickActions />

      {/* Armada drone */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Armada Drone</h2>

        <div className="space-y-3">
          {fleet.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Plane size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">{d.id} &middot; {d.model}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin size={12} /> Sleman, DIY
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusLabel[d.status].color}`}
              >
                {statusLabel[d.status].text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Misi terjadwal */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <CalendarClock size={20} className="text-green-600" />
          Misi Terjadwal
        </h2>

        {missions.length === 0 ? (
          <p className="text-sm text-slate-400">
            Belum ada misi. Gunakan tombol "Rencanakan Misi" untuk menjadwalkan penerbangan drone.
          </p>
        ) : (
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-100 p-3 text-sm"
              >
                <p className="font-medium text-slate-700">{m.blockName}</p>
                <p className="text-slate-400">{m.date}</p>
                {m.note && <p className="mt-1 text-slate-500">{m.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drone;
