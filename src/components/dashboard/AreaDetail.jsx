import {
  MapPin,
  Sprout,
  Ruler,
  Activity,
  Droplets,
  Thermometer,
} from "lucide-react";

import { useAppState } from "../../context/useAppState";

// =========================================================
// STATUS STYLE MAPPING
// =========================================================
const STATUS_STYLES = {
  Baik: "bg-green-100 text-green-700",
  "Perlu Perhatian": "bg-yellow-100 text-yellow-700",
  Prioritas: "bg-red-100 text-red-700",
};

// =========================================================
// AREA DETAIL COMPONENT
// =========================================================
const AreaDetail = () => {
  const { selectedArea } = useAppState();

  if (!selectedArea) {
    return (
      <div className="h-[450px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">Detail Area</h2>
        <div className="flex h-[350px] items-center justify-center text-center text-slate-400">
          <div>
            <p>Pilih salah satu petak sawah</p>
            <p>untuk melihat informasi.</p>
          </div>
        </div>
      </div>
    );
  }

  const properties = selectedArea.properties || selectedArea || {};

  const {
    name,
    status,
    area,
    crop,
    ndvi,
    moisture,
    temperature,
    recommendation,
    lastScan,
  } = properties;

  return (
    <div className="h-[450px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{name || "Area Lahan"}</h2>

          {status && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Informasi Lahan · Data Pemetaan
        </p>
      </div>

      {/* INFORMASI UTAMA */}
      <div className="space-y-4">
        {/* Luas */}
        <div className="flex items-center gap-3">
          <Ruler size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Luas Lahan</p>
            <p className="font-medium">{area || "-"}</p>
          </div>
        </div>

        {/* Komoditas */}
        <div className="flex items-center gap-3">
          <Sprout size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">Komoditas</p>
            <p className="font-medium">{crop || "-"}</p>
          </div>
        </div>

        {/* NDVI */}
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-slate-500">NDVI</p>
            <p className="font-medium">{ndvi ?? "-"}</p>
          </div>
        </div>

        {/* Kelembapan */}
        <div className="flex items-center gap-3">
          <Droplets size={20} className="text-blue-500" />
          <div>
            <p className="text-xs text-slate-500">Kelembapan Tanah</p>
            <p className="font-medium">{moisture ?? "-"}</p>
          </div>
        </div>

        {/* Suhu */}
        <div className="flex items-center gap-3">
          <Thermometer size={20} className="text-orange-500" />
          <div>
            <p className="text-xs text-slate-500">Suhu</p>
            <p className="font-medium">{temperature ?? "-"}</p>
          </div>
        </div>
      </div>

      {/* REKOMENDASI */}
      {recommendation && (
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={18} className="text-green-600" />
            <h3 className="text-sm font-semibold">Rekomendasi</h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {recommendation}
          </p>
        </div>
      )}

      {/* LAST SCAN */}
      {lastScan && (
        <p className="mt-4 text-xs text-slate-400">
          Pemindaian terakhir: {lastScan}
        </p>
      )}
    </div>
  );
};

export default AreaDetail;