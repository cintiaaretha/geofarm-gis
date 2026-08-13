import {
  Sprout,
  AlertTriangle,
  Plane,
  ScanSearch,
} from "lucide-react";

const iconMap = {
  "Luas Lahan": <Sprout size={28} />,
  "Area Prioritas": <AlertTriangle size={28} />,
  "Drone Aktif": <Plane size={28} />,
  "Monitoring Hari Ini": <ScanSearch size={28} />,
};

const StatisticCard = ({ title, value, color }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 ${color}`}
        >
          {iconMap[title]}
        </div>

        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Live
        </span>
      </div>

      <h3 className="text-sm text-slate-500">
        {title}
      </h3>

      <h1 className="mt-2 text-3xl font-bold text-slate-800">
        {value}
      </h1>

      <p className="mt-3 text-sm text-slate-400">
        Data diperbarui hari ini
      </p>
    </div>
  );
};

export default StatisticCard;