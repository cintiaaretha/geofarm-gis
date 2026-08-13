import {
  Camera,
  Layers3,
  MapPinned,
  ScanSearch,
  MonitorSmartphone,
  UserCheck,
} from "lucide-react";

import MapSection from "../components/dashboard/MapSection";
import AreaDetail from "../components/dashboard/AreaDetail";
import PeriodSelector from "../components/dashboard/PeriodSelector";

const steps = [
  { icon: <Camera size={22} />, title: "Mengambil citra udara lahan pertanian" },
  { icon: <Layers3 size={22} />, title: "Diproses menjadi orthomosaic" },
  { icon: <MapPinned size={22} />, title: "Mengubah citra menjadi peta digital" },
  { icon: <ScanSearch size={22} />, title: "Mendeteksi kekeringan, hama, dan pertumbuhan tidak merata" },
  { icon: <MonitorSmartphone size={22} />, title: "Menampilkan hasil analisis secara interaktif" },
  { icon: <UserCheck size={22} />, title: "Digunakan untuk pengambilan keputusan" },
];

const Monitoring = () => {
  return (
    <div className="space-y-6">

      {/* Cara Kerja Sistem */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Cara Kerja Sistem</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                {s.icon}
              </div>
              <p className="text-xs text-slate-500">Langkah {i + 1}</p>
              <p className="text-sm text-slate-700">{s.title}</p>
            </div>
          ))}
        </div>
      </div>

      <PeriodSelector />

      <div className="grid grid-cols-4 gap-5">
        <div className="col-span-3">
          <MapSection />
        </div>
        <AreaDetail />
      </div>
    </div>
  );
};

export default Monitoring;
