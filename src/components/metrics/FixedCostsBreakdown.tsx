import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function FixedCostsBreakdown({ data }: { data: NurseryData }) {
  const { fixedCosts, totals } = data;
  const sorted = [...fixedCosts].sort((a, b) => b.annualAmount - a.annualAmount);
  const top8 = sorted.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Fixed Costs Breakdown
      </h3>
      <p dir="rtl" className="mt-1 text-xs text-gray-400 text-right">
        פירוט קטגוריות העלויות הקבועות השנתיות (הקצאה של 70% משטח הגידול ל-3 הזנים)
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {formatNIS(totals.totalFixedCosts)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {fixedCosts.length} expense categories
      </p>
      <div className="mt-4 space-y-2">
        {top8.map((c) => {
          const pct = (c.annualAmount / totals.totalFixedCosts) * 100;
          return (
            <div key={c.categoryEn}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-600 truncate mr-2">{c.categoryEn}</span>
                <span className="font-medium text-gray-900 whitespace-nowrap">
                  {formatNIS(c.annualAmount)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
