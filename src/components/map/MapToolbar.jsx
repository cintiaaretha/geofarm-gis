import { useMemo, useState } from "react";
import {
  Search,
  LocateFixed,
  Plane,
  Camera,
} from "lucide-react";

import { useAppState } from "../../context/useAppState";
import { farmlandToFeature } from "../../utils/geo";

const MapToolbar = ({ onResetView }) => {
  const {
    farmland,
    setSelectedArea,
    droneFlying,
    toggleDroneFlying,
    addNotification,
  } = useAppState();

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return farmland.filter((f) => f.name.toLowerCase().includes(q));
  }, [query, farmland]);

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-lg">
          <Search size={18} />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Cari petak lahan..."
            className="w-60 bg-transparent outline-none"
          />
        </div>

        {showResults && query && (
          <div className="absolute left-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {results.length === 0 ? (
              <p className="p-2 text-sm text-slate-400">Tidak ditemukan.</p>
            ) : (
              results.map((f) => (
                <button
                  key={f.id}
                  onMouseDown={() => {
                    setSelectedArea(farmlandToFeature(f));
                    setQuery("");
                    setShowResults(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                >
                  {f.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="flex gap-2">
        <button
          onClick={onResetView}
          title="Tampilkan semua lahan"
          className="rounded-xl bg-white p-3 shadow-lg hover:bg-slate-100"
        >
          <LocateFixed size={18} />
        </button>

        <button
          onClick={toggleDroneFlying}
          title={droneFlying ? "Hentikan drone" : "Terbangkan drone"}
          className={`rounded-xl p-3 shadow-lg transition ${
            droneFlying
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-white hover:bg-slate-100"
          }`}
        >
          <Plane size={18} />
        </button>

        <button
          onClick={() =>
            addNotification("Citra udara terbaru berhasil diambil.", "info")
          }
          title="Ambil citra"
          className="rounded-xl bg-white p-3 shadow-lg hover:bg-slate-100"
        >
          <Camera size={18} />
        </button>
      </div>

    </div>
  );
};

export default MapToolbar;
