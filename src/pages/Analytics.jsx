import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import ChartSection from "../components/dashboard/ChartSection";
import StatusChart from "../components/dashboard/StatusChart";
import { useAppState } from "../context/useAppState";

const Analytics = () => {
  const { farmland } = useAppState();

  const comparisonData = useMemo(() => {
    return farmland.map((field) => ({
      name: field.name?.replace("Blok ", "") || field.id,
      "NDVI": Number(field.ndvi) || 0,
    }));
  }, [farmland]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartSection title="Tren NDVI" />
        <StatusChart />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">
          Kondisi NDVI per Blok
        </h2>

        <p className="mb-5 text-sm text-slate-500">
          Menampilkan nilai NDVI berdasarkan data lahan yang telah dipetakan.
        </p>

        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis
                domain={[0, 1]}
                tickCount={6}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="NDVI"
                fill="#16A34A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;