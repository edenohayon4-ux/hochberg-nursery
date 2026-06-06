import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function LaborCosts({ data }: { data: NurseryData }) {
  const { labor, totals } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Annual Labor Costs
      </h3>
      <p dir="rtl" className="mt-1 text-xs text-gray-400 text-right">
        עלות עבודה שנתית כוללת לכל זן (עבודת גידול שוטפת + פעולות ייצור)
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {formatNIS(totals.totalLaborCost)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {labor.reduce((s, l) => s + l.numberOfWorkers, 0)} avg workers
      </p>
      <div className="mt-4 space-y-3">
        {labor.map((l) => {
          const pct = (l.totalAnnualCost / totals.totalLaborCost) * 100;
          return (
            <div key={l.product}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{l.product}</span>
                <span className="font-medium text-gray-900">
                  {formatNIS(l.totalAnnualCost)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {l.numberOfWorkers} workers x {l.monthlyHours}h/mo x {formatNIS(l.hourlyWage)}/hr
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
