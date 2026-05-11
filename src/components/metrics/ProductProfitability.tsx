import { NurseryData } from "@/types";
import { formatNIS, formatPercent, formatNumber } from "@/lib/formatters";

export default function ProductProfitability({ data }: { data: NurseryData }) {
  const { pnl } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-full">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        Product Profitability Analysis
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Product</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Units</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Revenue</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Expenses</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Net Profit</th>
              <th className="text-right py-3 px-2 font-medium text-gray-500">Margin</th>
              <th className="text-center py-3 px-2 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {pnl.map((p) => {
              const isProfitable = p.netProfit > 0;
              return (
                <tr key={p.productName} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{p.productName}</td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {formatNumber(p.annualQuantity)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-900">
                    {formatNIS(p.totalRevenue)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {formatNIS(p.totalExpenses)}
                  </td>
                  <td
                    className={`py-3 px-2 text-right font-semibold ${isProfitable ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatNIS(p.netProfit)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-900">
                    {formatPercent(p.profitMargin)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isProfitable
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {isProfitable ? "Profitable" : "Loss"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
