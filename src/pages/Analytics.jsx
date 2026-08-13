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
import { farmland } from "../data/farmland";
import { buildFarmlandForPeriod, periods } from "../data/farmlandHistory";

const Analytics = () => {
  const comparisonData = useMemo(() => {
    return farmland.map((field) => {
      const row = { name: field.name.replace("Blok ", "") };
      periods.forEach((p) => {
        const dataset = buildFarmlandForPeriod(farmland, p.id);
        const f = dataset.find((d) => d.id === field.id);
        row[p.label] = f.ndvi;
      });
      return row;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartSection title="Tren NDVI Mingguan" />
        <StatusChart />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">
          Perbandingan NDVI Antar Periode per Blok
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Membandingkan kondisi lahan dari waktu ke waktu (Monitoring Perubahan).
        </p>

        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="30 Hari Lalu" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="7 Hari Lalu" fill="#86EFAC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Saat Ini" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
