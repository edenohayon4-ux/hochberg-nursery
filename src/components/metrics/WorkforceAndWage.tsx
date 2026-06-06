import { NurseryData } from "@/types";

export default function WorkforceAndWage({ data }: { data: NurseryData }) {
  const { wageBuildup, workerCalc, totals } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Workforce & Loaded Wage
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        Loaded hourly cost = base pay + all employer-side social loadings.
      </p>

      {/* Loaded wage summary */}
      <div className="mt-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-500 uppercase">Loaded Cost / Hr</span>
          <span className="text-2xl font-bold text-gray-900">
            {wageBuildup.loadedHourlyCost.toFixed(2)} ILS
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-2 text-sm">
          <span className="text-gray-500">
            Base {wageBuildup.basePay.toFixed(2)} ILS + Loading{" "}
            {(wageBuildup.totalLoadingPct * 100).toFixed(1)}%
          </span>
          <span className="text-gray-700 font-medium">
            +{wageBuildup.totalLoadingAmount.toFixed(2)} ILS
          </span>
        </div>
      </div>

      {/* Workforce per product */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Cultivation Workforce ({totals.totalWorkers.toFixed(2)} FTEs total)
        </p>
        <div className="space-y-2">
          {workerCalc.map((w) => {
            const widthPct =
              totals.totalWorkers > 0
                ? (w.numberOfWorkers / totals.totalWorkers) * 100
                : 0;
            return (
              <div key={w.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{w.productName}</span>
                  <span className="text-gray-900 font-medium">
                    {w.numberOfWorkers.toFixed(2)} FTE
                  </span>
                </div>
                <div className="mt-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {w.areaDunams} dunams × {w.hoursPerDunamYear} hrs/dunam/yr ={" "}
                  {w.totalAnnualHours.toLocaleString()} hrs
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top wage components */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 uppercase mb-2">
          Wage Components (top loadings)
        </p>
        <div className="text-xs space-y-1">
          {wageBuildup.components
            .filter((c) => !c.component.startsWith("שכר בסיס"))
            .slice(0, 5)
            .map((c) => (
              <div
                key={c.component}
                className="flex justify-between text-gray-600"
              >
                <span className="truncate">{c.component}</span>
                <span className="text-gray-800 font-mono">
                  +{c.amountPerHour.toFixed(2)} ILS
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
