import { Layers3 } from "lucide-react";
import { useAppState } from "../../context/useAppState";

const layers = [
  "Satelit",
  "Street",
  "Drone Imagery",
  "NDVI",
  "Kelembapan",
];

const LayerControl = () => {
  const {
    activeLayer,
    setActiveLayer,
    droneImagery,
    imageryReady,
  } = useAppState();

  return (
    <div className="absolute right-4 top-20 z-[1000] w-48 rounded-xl bg-white p-3 shadow-lg">
      {/* Header */}
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Layers3 size={16} />
        Layer Peta
      </p>

      {/* Layer Buttons */}
      <div className="space-y-2">
        {layers.map((layer) => {
          const isDroneLayer =
            layer === "Drone Imagery";

          const isAnalysisLayer =
            layer === "NDVI" ||
            layer === "Kelembapan";

          const disabled =
            (isDroneLayer && !imageryReady) ||
            (isAnalysisLayer && !imageryReady);

          return (
            <button
              key={layer}
              onClick={() => {
                if (!disabled) {
                  setActiveLayer(layer);
                }
              }}
              disabled={disabled}
              className={`
                w-full rounded-lg px-3 py-2
                text-left text-sm transition
                ${
                  activeLayer === layer
                    ? "bg-green-600 text-white"
                    : disabled
                    ? "cursor-not-allowed bg-slate-50 text-slate-300"
                    : "hover:bg-slate-100"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{layer}</span>

                {isDroneLayer && !imageryReady && (
                  <span className="text-[9px]">
                    Upload
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="mt-3 text-[11px] leading-snug text-slate-400">
        {activeLayer === "Satelit" &&
          "Menampilkan citra satelit sebagai basemap untuk melihat kondisi wilayah pertanian."}

        {activeLayer === "Street" &&
          "Menampilkan peta jalan dan infrastruktur sebagai basemap."}

        {activeLayer === "Drone Imagery" &&
          (imageryReady
            ? `Menampilkan citra udara dari ${droneImagery?.fileName || "file yang diunggah"}.`
            : "Upload citra udara terlebih dahulu untuk menampilkan imagery drone.")}

        {activeLayer === "NDVI" &&
          (imageryReady
            ? "Menampilkan hasil analisis kondisi vegetasi berdasarkan data citra yang diunggah."
            : "Layer tersedia setelah citra udara berhasil diproses.")}

        {activeLayer === "Kelembapan" &&
          (imageryReady
            ? "Menampilkan hasil analisis kondisi kelembapan lahan berdasarkan data citra."
            : "Layer tersedia setelah citra udara berhasil diproses.")}
      </p>
    </div>
  );
};

export default LayerControl;