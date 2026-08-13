import { History } from "lucide-react";
import { useAppState } from "../../context/useAppState";

const PeriodSelector = () => {
  const { periods, activePeriod, setActivePeriod } = useAppState();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <History size={18} className="text-green-600" />
        Monitoring Perubahan
      </div>

      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePeriod(p.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition
              ${
                activePeriod === p.id
                  ? "bg-green-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <span className="ml-auto text-xs text-slate-400">
        Data per {periods.find((p) => p.id === activePeriod)?.date}
      </span>
    </div>
  );
};

export default PeriodSelector;
