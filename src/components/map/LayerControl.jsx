import { Layers3 } from "lucide-react";
import { useAppState } from "../../context/useAppState";

const layers = [
  "Satelit",
  "Street",
  "NDVI",
  "Kelembapan",
];

const LayerControl = () => {
  const {
    activeLayer,
    setActiveLayer,
  } = useAppState();

  return (
    <div className="absolute right-4 top-20 z-[1000] w-44 rounded-xl bg-white p-3 shadow-lg">
      {/* Header */}
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Layers3 size={16} />
        Layer Peta
      </p>
      {/* Layer Buttons */}
      <div className="space-y-2">
        {layers.map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`
              w-full rounded-lg px-3 py-2
              text-left text-sm transition
              ${
                activeLayer === layer
                  ? "bg-green-600 text-white"
                  : "hover:bg-slate-100"
              }
            `}
          >
            {layer}
          </button>
        ))}
      </div>
      {/* Description */}
      <p className="mt-3 text-[11px] leading-snug text-slate-400">
        {activeLayer === "Satelit" &&
          "Menampilkan citra satelit untuk melihat kondisi area pertanian."}
        {activeLayer === "Street" &&
          "Menampilkan peta jalan dan infrastruktur di sekitar lahan."}
        {activeLayer === "NDVI" &&
          "Menampilkan kondisi vegetasi berdasarkan nilai NDVI."}
        {activeLayer === "Kelembapan" &&
          "Menampilkan tingkat kelembapan tanah pada area pertanian."}
      </p>
    </div>
  );
};

export default LayerControl;