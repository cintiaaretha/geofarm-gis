import StatisticCard from "../components/dashboard/StatisticCard";
import MapSection from "../components/dashboard/MapSection";
import AreaDetail from "../components/dashboard/AreaDetail";
import ChartSection from "../components/dashboard/ChartSection";
import WeatherCard from "../components/dashboard/WeatherCard";
import StatusChart from "../components/dashboard/StatusChart";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import QuickActions from "../components/dashboard/QuickActions";
import { useAppState } from "../context/useAppState";

const Dashboard = () => {
  const { farmland, droneFlying } = useAppState();

  const totalArea = farmland
    .reduce((sum, f) => sum + parseFloat(f.area), 0)
    .toFixed(1);

  const priorityCount = farmland.filter((f) => f.status === "Prioritas").length;

  return (
    <div className="space-y-6">

      {/* Statistik */}
      <div className="grid grid-cols-4 gap-5">
        <StatisticCard
          title="Luas Lahan"
          value={`${totalArea} Ha`}
          color="text-green-600"
        />

        <StatisticCard
          title="Area Prioritas"
          value={String(priorityCount)}
          color="text-red-500"
        />

        <StatisticCard
          title="Drone Aktif"
          value={droneFlying ? "1 / 5" : "0 / 5"}
          color="text-blue-500"
        />

        <StatisticCard
          title="Monitoring Hari Ini"
          value="48"
          color="text-yellow-500"
        />
      </div>

      {/* Monitoring Perubahan */}
      <PeriodSelector />

      {/* Map */}
      <div className="grid grid-cols-4 gap-5">

        <div className="col-span-3">
          <MapSection />
        </div>

        <AreaDetail />

      </div>

      {/* Aksi Cepat, sesuai mockup dashboard mobile */}
      <QuickActions />

      {/* Analytics */}
      <div className="grid grid-cols-4 gap-5">

        <div className="col-span-2">
          <ChartSection
            title="Tren NDVI Mingguan"
          />
        </div>

        <WeatherCard />

        <StatusChart />

      </div>

    </div>
  );
};

export default Dashboard;
