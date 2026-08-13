import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { ndviData } from "../../data/chartData";

const ChartSection = ({ title }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold">
        {title}
      </h2>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={ndviData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="hari" />

            <YAxis domain={[0.5, 0.9]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="ndvi"
              stroke="#16A34A"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;