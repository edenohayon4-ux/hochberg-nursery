import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function DirectCostPerUnit({ data }: { data: NurseryData }) {
  const { pnl } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        עלות ישירה ליחידה (Direct Cost per Unit)
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        עלות ישירה = (עלות ייצור משתנה + עלות עבודה שנתית) ÷ יחידות מכירה נטו
      </p>

      <div className="mt-5 space-y-4">
        {pnl.map((p) => {
          const directCost = (p.totalVariableExpenses + p.annualLaborCost) / p.netSaleUnits;
          const pricePerUnit = p.sellingPrice;
          const ratio = pricePerUnit > 0 ? (directCost / pricePerUnit) * 100 : 0;
          const color =
            ratio > 80 ? "bg-red-500" : ratio > 60 ? "bg-yellow-500" : "bg-green-500";

          return (
            <div key={p.productName} className="border-b border-gray-100 pb-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-medium text-gray-900">{p.productName}</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatNIS(directCost)} / יח'
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>מחיר מכירה: {formatNIS(pricePerUnit)}</span>
                <span>·</span>
                <span>יחס עלות/מחיר: {ratio.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${color} transition-all`}
                  style={{ width: `${Math.min(ratio, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
