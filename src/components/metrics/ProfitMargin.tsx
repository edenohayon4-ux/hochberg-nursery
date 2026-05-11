import { NurseryData } from "@/types";
import { formatPercent, formatNIS } from "@/lib/formatters";

export default function ProfitMargin({ data }: { data: NurseryData }) {
  const { totals, pnl } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Profit Margin
      </h3>
      <p className="mt-2 text-3xl font-bold text-emerald-600">
        {formatPercent(totals.overallProfitMargin)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Net Profit: {formatNIS(totals.totalNetProfit)}
      </p>
      <div className="mt-4 space-y-2">
        {pnl.map((p) => {
          const color =
            p.profitMargin >= 70
              ? "text-emerald-600"
              : p.profitMargin >= 50
                ? "text-yellow-600"
                : "text-red-600";
          return (
            <div key={p.productName} className="flex justify-between text-sm">
              <span className="text-gray-600">{p.productName}</span>
              <span className={`font-semibold ${color}`}>
                {formatPercent(p.profitMargin)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
