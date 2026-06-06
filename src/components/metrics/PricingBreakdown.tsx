import { NurseryData } from "@/types";

export default function PricingBreakdown({ data }: { data: NurseryData }) {
  const { pricing } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Selling Price Build-Up (EUR)
      </h3>
      <p dir="rtl" className="mt-1 text-xs text-gray-400 text-right">
        מחיר סופי = בסיס × (1 + פרמיית איכות) × (1 + הנחת חוזה) × (1 + השפעת מט&quot;ח). כל הנוסחאות חיות בקוד.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="text-left py-2 pr-3">Product</th>
              <th className="text-right py-2 px-2">Base ILS</th>
              <th className="text-right py-2 px-2">Premium</th>
              <th className="text-right py-2 px-2">Discount</th>
              <th className="text-right py-2 px-2">Export</th>
              <th className="text-right py-2 px-2">FX Impact</th>
              <th className="text-right py-2 pl-2">Final ILS</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2 pr-3 font-medium text-gray-900">
                  {p.productName}
                </td>
                <td className="text-right py-2 px-2 text-gray-700">
                  {p.baseMarketPrice.toFixed(2)}
                </td>
                <td className="text-right py-2 px-2 text-green-600">
                  {p.qualityPremiumPct === 0
                    ? "—"
                    : `+${(p.qualityPremiumPct * 100).toFixed(1)}%`}
                </td>
                <td className="text-right py-2 px-2 text-orange-600">
                  {p.contractDiscountPct === 0
                    ? "—"
                    : `${(p.contractDiscountPct * 100).toFixed(1)}%`}
                </td>
                <td className="text-right py-2 px-2 text-gray-700">
                  {(p.exportSharePct * 100).toFixed(0)}%
                </td>
                <td
                  className={`text-right py-2 px-2 font-medium ${
                    p.fxImpactPct < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {(p.fxImpactPct * 100).toFixed(2)}%
                </td>
                <td className="text-right py-2 pl-2 font-bold text-gray-900">
                  {p.finalSellingPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p dir="rtl" className="mt-3 text-xs text-gray-400 text-right">
        שער בסיס = {pricing[0]?.baseFxRate.toFixed(2)} EUR/NIS &middot; שער נוכחי = {pricing[0]?.currentFxRate.toFixed(2)} EUR/NIS
      </p>
    </div>
  );
}
