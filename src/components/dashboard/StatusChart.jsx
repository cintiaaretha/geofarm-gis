import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { useMemo } from "react";
import { useAppState } from "../../context/useAppState";

const STATUS_COLORS = {
  Baik: "#22C55E",
  "Perlu Perhatian": "#FACC15",
  Prioritas: "#EF4444",
};

const StatusChart = () => {
  const { farmland } = useAppState();

  const statusData = useMemo(() => {
    const totals = { Baik: 0, "Perlu Perhatian": 0, Prioritas: 0 };
    farmland.forEach((f) => {
      totals[f.status] = (totals[f.status] || 0) + parseFloat(f.area);
    });
    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value: +value.toFixed(1) }));
  }, [farmland]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">
        Status Lahan
      </h2>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={55}
              paddingAngle={4}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>

            <Tooltip formatter={(v) => `${v} Ha`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusChart;