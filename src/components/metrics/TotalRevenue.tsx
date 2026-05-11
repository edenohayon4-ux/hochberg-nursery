import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function TotalRevenue({ data }: { data: NurseryData }) {
  const { totals, pnl } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Total Revenue
      </h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {formatNIS(totals.totalRevenue)}
      </p>
      <div className="mt-4 space-y-2">
        {pnl.map((p) => (
          <div key={p.productName} className="flex justify-between text-sm">
            <span className="text-gray-600">{p.productName}</span>
            <span className="font-medium text-gray-900">
              {formatNIS(p.totalRevenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
