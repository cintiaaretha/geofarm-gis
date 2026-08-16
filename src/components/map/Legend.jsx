import { useAppState } from "../../context/useAppState";

const Legend = () => {
  const { activeLayer } = useAppState();

  const isMoisture = activeLayer === "Kelembapan";
  const isNDVI = activeLayer === "NDVI";

  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white p-4 shadow-lg">
      <h3 className="mb-3 font-semibold">
        {isMoisture
          ? "Kelembapan Tanah"
          : isNDVI
          ? "Indeks Vegetasi (NDVI)"
          : "Status Lahan"}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500"></div>

          <span>
            {isMoisture
              ? "< 40%  Kering"
              : isNDVI
              ? "< 0.30  Buruk"
              : "Prioritas"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-400"></div>

          <span>
            {isMoisture
              ? "40–59%  Sedang"
              : isNDVI
              ? "0.30–0.59  Sedang"
              : "Perlu Perhatian"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500"></div>

          <span>
            {isMoisture
              ? "≥ 60%  Baik"
              : isNDVI
              ? "≥ 0.60  Baik"
              : "Baik"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Legend;