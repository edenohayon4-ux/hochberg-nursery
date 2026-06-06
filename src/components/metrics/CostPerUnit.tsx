import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function CostPerUnit({ data }: { data: NurseryData }) {
  const { pnl, salesPricing } = data;

  const products = pnl.map((p) => {
    const pricing = salesPricing.find(
      (s) => s.productName.toLowerCase() === p.productName.toLowerCase()
    );
    const costPerUnit = p.annualQuantity > 0 ? p.totalExpenses / p.annualQuantity : 0;
    const sellingPrice = pricing?.sellingPrice ?? p.sellingPrice;
    const marginPerUnit = sellingPrice - costPerUnit;

    return {
      name: p.productName,
      costPerUnit,
      sellingPrice,
      marginPerUnit,
      isProfitable: marginPerUnit > 0,
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Cost vs. Selling Price (Per Unit)
      </h3>
      <p dir="rtl" className="mt-1 text-xs text-gray-400 text-right">
        עלות הייצור הכוללת ליחידה מול מחיר המכירה. הפס הצבעוני מראה את היחס ביניהם.
      </p>
      <div className="mt-4 space-y-4">
        {products.map((p) => (
          <div key={p.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-900">{p.name}</span>
              <span
                className={`text-xs font-medium ${p.isProfitable ? "text-emerald-600" : "text-red-600"}`}
              >
                {p.isProfitable ? "+" : ""}
                {formatNIS(p.marginPerUnit)}/unit
              </span>
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>Cost: {formatNIS(p.costPerUnit)}</span>
              <span>|</span>
              <span>Sell: {formatNIS(p.sellingPrice)}</span>
            </div>
            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${p.isProfitable ? "bg-emerald-400" : "bg-red-400"}`}
                style={{
                  width: `${Math.min((p.costPerUnit / p.sellingPrice) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
