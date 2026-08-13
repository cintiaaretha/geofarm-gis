import { CloudSun, Droplets, Wind } from "lucide-react";

const WeatherCard = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-5 flex items-center gap-3">
        <CloudSun className="text-yellow-500" size={34} />

        <div>
          <h2 className="font-semibold">
            Cuaca Saat Ini
          </h2>

          <p className="text-sm text-slate-500">
            Sleman, DIY
          </p>
        </div>
      </div>

      <h1 className="text-5xl font-bold">
        30°
      </h1>

      <p className="mt-2 text-slate-500">
        Cerah Berawan
      </p>

      <div className="mt-6 space-y-3">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={18} />
            <span>Kelembapan</span>
          </div>

          <span>72%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind size={18} />
            <span>Kecepatan Angin</span>
          </div>

          <span>12 km/jam</span>
        </div>

      </div>

    </div>
  );
};

export default WeatherCard;