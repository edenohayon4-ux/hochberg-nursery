import { NurseryData } from "@/types";
import { formatNIS, formatPercent } from "@/lib/formatters";

export default function GrowthAnalysis({ data }: { data: NurseryData }) {
  const { pnl, totals } = data;

  // Revenue share per product — shows growth potential
  const revenueShare = pnl.map((p) => ({
    name: p.productName,
    share: totals.totalRevenue > 0 ? (p.totalRevenue / totals.totalRevenue) * 100 : 0,
    revenue: p.totalRevenue,
    profitPerUnit:
      p.annualQuantity > 0 ? p.netProfit / p.annualQuantity : 0,
  }));

  // Efficiency: revenue per NIS spent
  const efficiency = pnl.map((p) => ({
    name: p.productName,
    revenuePerNIS: p.totalExpenses > 0 ? p.totalRevenue / p.totalExpenses : 0,
  }));

  const bestProduct = [...revenueShare].sort((a, b) => b.profitPerUnit - a.profitPerUnit)[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Growth & Efficiency
      </h3>
      <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
        <p className="text-xs text-emerald-600 font-medium">Highest Profit/Unit</p>
        <p className="text-lg font-bold text-emerald-700">
          {bestProduct.name} — {formatNIS(bestProduct.profitPerUnit)}/unit
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Revenue Share</p>
        <div className="flex h-4 rounded-full overflow-hidden">
          {revenueShare.map((p, i) => {
            const colors = ["bg-blue-400", "bg-amber-400", "bg-emerald-400"];
            return (
              <div
                key={p.name}
                className={`${colors[i]} transition-all`}
                style={{ width: `${p.share}%` }}
                title={`${p.name}: ${formatPercent(p.share)}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {revenueShare.map((p, i) => {
            const dots = ["bg-blue-400", "bg-amber-400", "bg-emerald-400"];
            return (
              <span key={p.name} className="text-xs text-gray-500 flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${dots[i]}`} />
                {p.name} ({formatPercent(p.share)})
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 mb-2">
          Revenue per NIS Spent
        </p>
        <div className="space-y-2">
          {efficiency.map((p) => (
            <div key={p.name} className="flex justify-between text-sm">
              <span className="text-gray-600">{p.name}</span>
              <span className="font-medium text-gray-900">
                {p.revenuePerNIS.toFixed(2)}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
