import {
  MapPin,
  Sprout,
  Ruler,
  Activity,
  Droplets,
  Thermometer,
  CalendarClock,
} from "lucide-react";

import { useAppState } from "../../context/useAppState";
import { ndviLevel, moistureLevel } from "../../utils/geo";

// =========================================================
// STATUS STYLE MAPPING
// =========================================================
const STATUS_STYLES = {
  Baik: "bg-green-100 text-green-700",
  "Perlu Perhatian": "bg-yellow-100 text-yellow-700",
  Prioritas: "bg-red-100 text-red-700",
};

// =========================================================
// METRIC BAR
// =========================================================
// Indikator visual (bar warna + label level) supaya nilai NDVI
// dan kelembapan lebih gampang dibaca sekilas, tidak cuma angka.
// =========================================================
const MetricBar = ({ percent, color, label }) => (
  <div className="mt-1.5">
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(4, percent))}%`,
          backgroundColor: color,
        }}
      />
    </div>
    <p
      className="mt-1 text-xs font-medium"
      style={{ color }}
    >
      {label}
    </p>
  </div>
);

// =========================================================
// AREA DETAIL COMPONENT
// =========================================================
const AreaDetail = () => {
  const { selectedArea, periods, activePeriod } = useAppState();

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

  const ndviInfo = ndvi != null ? ndviLevel(ndvi) : null;
  const moistureInfo = moisture != null ? moistureLevel(moisture) : null;

  const periodLabel =
    periods?.find((p) => p.id === activePeriod)?.label ||
    "Saat Ini";

  return (
    <div className="h-[450px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="mb-4">
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

      {/* PERIODE DATA */}
      <div className="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <CalendarClock size={14} className="shrink-0" />
        <span>
          Menampilkan data periode <strong>{periodLabel}</strong>
          {lastScan ? ` · Pemindaian terakhir: ${lastScan}` : ""}
        </span>
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
        <div className="flex items-start gap-3">
          <Activity size={20} className="mt-0.5 shrink-0 text-green-600" />
          <div className="w-full">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                NDVI (Indeks Vegetasi)
              </p>
              <p className="font-medium">{ndvi ?? "-"}</p>
            </div>
            {ndviInfo && (
              <MetricBar
                percent={Math.round((ndvi ?? 0) * 100)}
                color={ndviInfo.color}
                label={ndviInfo.label}
              />
            )}
          </div>
        </div>

        {/* Kelembapan */}
        <div className="flex items-start gap-3">
          <Droplets size={20} className="mt-0.5 shrink-0 text-blue-500" />
          <div className="w-full">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Kelembapan Tanah</p>
              <p className="font-medium">{moisture ?? "-"}</p>
            </div>
            {moistureInfo && (
              <MetricBar
                percent={parseInt(moisture, 10) || 0}
                color={moistureInfo.color}
                label={moistureInfo.label}
              />
            )}
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
    </div>
  );
};

export default AreaDetail;