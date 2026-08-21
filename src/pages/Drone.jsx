import { useState } from "react";
import {
  Plane,
  Battery,
  Gauge,
  MapPin,
  CalendarClock,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FileJson,
} from "lucide-react";

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
  const {
    droneFlying,
    droneBattery,
    missions,

    // DRONE IMAGERY & GIS STATE
    droneImagery,
    setDroneImagery,
    imageryReady,
    setImageryReady,
    setImageryBounds,
    setImageryProjection,
    setGeoJsonData,
    setActiveLayer,

    // NOTIFICATION
    addNotification,
  } = useAppState();

  // LOCAL FILE STATE
  const [selectedTif, setSelectedTif] = useState(droneImagery?.file || null);
  const [selectedGeoJSON, setSelectedGeoJSON] = useState(null);
  const [processing, setProcessing] = useState(false);

  // =========================================================
  // HANDLE TIFF
  // =========================================================

  const handleTifChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isGeoTiff = fileName.endsWith(".tif") || fileName.endsWith(".tiff");

    if (!isGeoTiff) {
      alert("File orthomosaic harus berformat .tif atau .tiff.");
      event.target.value = "";
      return;
    }

    setSelectedTif(file);
    setImageryReady(false);
    setImageryBounds(null);
    setImageryProjection(null);

    addNotification(`Orthomosaic ${file.name} berhasil dipilih`, "info");
  };

  // =========================================================
  // HANDLE GEOJSON
  // =========================================================

  const handleGeoJSONChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".geojson") && !fileName.endsWith(".json")) {
      alert("Data spasial harus berformat .geojson atau .json.");
      event.target.value = "";
      return;
    }

    setSelectedGeoJSON(file);
    addNotification(`Data spasial ${file.name} berhasil dipilih`, "info");
  };

  // =========================================================
  // PROSES DATA KE GIS & MAPSECTION
  // =========================================================

  const handleProcessImagery = async () => {
    if (!selectedTif && !selectedGeoJSON) {
      alert("Silakan upload sekurangnya satu file (GeoTIFF atau GeoJSON).");
      return;
    }

    try {
      setProcessing(true);

      // 1. Baca GeoJSON jika diunggah
      if (selectedGeoJSON) {
        const geojsonText = await selectedGeoJSON.text();
        const geojsonData = JSON.parse(geojsonText);

        if (!geojsonData || (geojsonData.type !== "FeatureCollection" && geojsonData.type !== "Feature")) {
          throw new Error("Format GeoJSON tidak valid.");
        }

        // Simpan GeoJSON ke State Peta Utama
        setGeoJsonData(geojsonData);
      }

      // 2. Set Active Layer ke "Drone Imagery" agar MapSection menampilkannya
      if (setActiveLayer) {
        setActiveLayer("Drone Imagery");
      }

      // 3. Simpan File Utama (GeoTIFF) ke Global State agar dibaca oleh MapSection.jsx
      if (selectedTif) {
        setDroneImagery((prev) => ({
          ...prev,
          file: selectedTif,
          fileName: selectedTif.name,
          type: selectedTif.type || "image/tiff",
          size: selectedTif.size,
        }));
      }

      setImageryReady(true);
      addNotification("Data citra berhasil diregistrasikan dan dikirim ke Peta GIS", "info");
    } catch (error) {
      console.error("Gagal memproses data drone:", error);
      alert("Gagal membaca file. Pastikan file valid.");
      setImageryReady(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STATUS DRONE UTAMA */}
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

      {/* CITRA DRONE UPLOAD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ImageIcon size={20} className="text-green-600" />
            Citra Drone
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            Upload hasil pemrosesan citra udara berupa orthomosaic GeoTIFF dan/atau data spasial GeoJSON untuk ditampilkan pada GIS.
          </p>
        </div>

        

        {/* UPLOAD TIFF */}
        <div>
          <label
            htmlFor="orthomosaic-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-green-400 hover:bg-green-50/30"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Upload size={22} className="text-green-600" />
            </div>
            <p className="font-medium text-slate-700">
              {selectedTif ? selectedTif.name : "Upload Orthomosaic (.TIF)"}
            </p>
            <p className="mt-1 text-xs text-slate-400">Format: .TIF atau .TIFF</p>
            <input
              id="orthomosaic-upload"
              type="file"
              accept=".tif,.tiff,image/tiff"
              className="hidden"
              onChange={handleTifChange}
            />
          </label>
        </div>

        {/* UPLOAD GEOJSON */}
        <div className="mt-4">
          <label
            htmlFor="geojson-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileJson size={22} className="text-blue-600" />
            </div>
            <p className="font-medium text-slate-700">
              {selectedGeoJSON ? selectedGeoJSON.name : "Upload Data Spasial (.GeoJSON)"}
            </p>
            <p className="mt-1 text-xs text-slate-400">Format: .GEOJSON</p>
            <input
              id="geojson-upload"
              type="file"
              accept=".geojson,application/geo+json,application/json"
              className="hidden"
              onChange={handleGeoJSONChange}
            />
          </label>
        </div>

        {/* FILE INFO */}
        {(selectedTif || selectedGeoJSON) && (
          <div className="mt-5 space-y-3">
            {selectedTif && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <ImageIcon size={18} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Orthomosaic</p>
                    <p className="mt-1 break-all font-semibold text-slate-700">{selectedTif.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Ukuran: {(selectedTif.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {selectedGeoJSON && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <FileJson size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Data Spasial</p>
                    <p className="mt-1 break-all font-semibold text-slate-700">{selectedGeoJSON.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(selectedTif || selectedGeoJSON) && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin size={19} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Lokasi mengikuti data spasial</p>
                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  Sistem membaca lokasi dari georeferensi GeoTIFF dan geometri GeoJSON secara otomatis.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleProcessImagery}
          disabled={processing || (!selectedTif && !selectedGeoJSON)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {processing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mendaftarkan Data...
            </>
          ) : (
            <>
              <ImageIcon size={18} />
              Tampilkan pada Peta
            </>
          )}
        </button>

        {imageryReady && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="font-medium text-green-800">Data drone berhasil dimuat</p>
                <p className="mt-1 text-sm leading-relaxed text-green-700">
                  Orthomosaic dan data spasial berhasil diteruskan ke MapSection GIS.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ARMADA DRONE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Armada Drone</h2>
        <div className="space-y-3">
          {fleet.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Plane size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">{d.id} · {d.model}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} /> Lokasi drone mengikuti area pemetaan
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusLabel[d.status].color}`}>
                {statusLabel[d.status].text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MISI TERJADWAL */}
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
              <div key={m.id} className="rounded-xl border border-slate-100 p-3 text-sm">
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