import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function TaxAndNetProfit({ data }: { data: NurseryData }) {
  const { totals, pnl, corporateTaxRate } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Tax & Net Profit ({(corporateTaxRate * 100).toFixed(0)}% Corporate Tax)
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        Tax = max(0, pre-tax profit) × {(corporateTaxRate * 100).toFixed(0)}%.
        Loss-making products pay 0 tax.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 uppercase">Pre-Tax</p>
          <p className="text-lg font-bold text-blue-900 mt-1">
            {formatNIS(totals.totalPreTaxProfit)}
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-600 uppercase">Tax</p>
          <p className="text-lg font-bold text-orange-900 mt-1">
            {formatNIS(totals.totalCorporateTax)}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${
            totals.totalNetProfit >= 0 ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p
            className={`text-xs uppercase ${
              totals.totalNetProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Net After Tax
          </p>
          <p
            className={`text-lg font-bold mt-1 ${
              totals.totalNetProfit >= 0 ? "text-green-900" : "text-red-900"
            }`}
          >
            {formatNIS(totals.totalNetProfit)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {pnl.map((p) => (
          <div
            key={p.productName}
            className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
          >
            <span className="font-medium text-gray-700">{p.productName}</span>
            <div className="flex gap-4 text-right">
              <div className="w-28">
                <p className="text-xs text-gray-500">Pre-tax</p>
                <p
                  className={`font-medium ${
                    p.preTaxProfit >= 0 ? "text-gray-900" : "text-red-700"
                  }`}
                >
                  {formatNIS(p.preTaxProfit)}
                </p>
              </div>
              <div className="w-20">
                <p className="text-xs text-gray-500">Tax</p>
                <p className="font-medium text-orange-700">
                  {p.corporateTax > 0 ? formatNIS(p.corporateTax) : "—"}
                </p>
              </div>
              <div className="w-28">
                <p className="text-xs text-gray-500">Net</p>
                <p
                  className={`font-bold ${
                    p.netProfitAfterTax >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {formatNIS(p.netProfitAfterTax)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
