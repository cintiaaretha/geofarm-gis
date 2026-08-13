import { MapPin, Sprout, Ruler, Activity, Droplets } from "lucide-react";
import { useAppState } from "../../context/useAppState";

const AreaDetail = () => {
  const { selectedArea, activePeriod, periods } = useAppState();

  if (!selectedArea) {
    return (
      <div className="h-[450px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">
          Detail Area
        </h2>

        <div className="flex h-[350px] items-center justify-center text-center text-slate-400">
          Pilih salah satu petak sawah
          <br />
          untuk melihat informasi.
        </div>
      </div>
    );
  }

  return (
    <div className="h-[450px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        {selectedArea.name}
      </h2>

      <p className="mb-6 text-sm text-slate-500">
        Informasi Lahan &middot; {periods.find((p) => p.id === activePeriod)?.label}
      </p>

      <div className="space-y-5">

        <div className="flex items-center gap-3">
          <MapPin className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <h4>{selectedArea.status}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Ruler className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Luas</p>
            <h4>{selectedArea.area}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Sprout className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">NDVI</p>
            <h4>{selectedArea.ndvi}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Droplets className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Kelembapan</p>
            <h4>{selectedArea.moisture}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Activity className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Rekomendasi</p>
            <h4>{selectedArea.recommendation}</h4>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AreaDetail;