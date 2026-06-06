import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function ContributionMargin({ data }: { data: NurseryData }) {
  const { pnl } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        מרווח תרומה (Contribution Margin)
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        מרווח תרומה ליחידה = מחיר מכירה − עלות משתנה ליחידה.
        מבטא את התרומה לכיסוי ההוצאות הקבועות וליצירת רווח.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="text-right py-2 pr-2">מוצר</th>
              <th className="text-left py-2 px-2">מחיר מכירה</th>
              <th className="text-left py-2 px-2">עלות משתנה/יח'</th>
              <th className="text-left py-2 px-2">מרווח תרומה/יח'</th>
              <th className="text-left py-2 px-2">% תרומה</th>
              <th className="text-left py-2 pl-2">תרומה שנתית</th>
            </tr>
          </thead>
          <tbody>
            {pnl.map((p) => {
              const variablePerUnit = p.netSaleUnits > 0
                ? p.totalVariableExpenses / p.netSaleUnits
                : 0;
              const margin = p.sellingPrice - variablePerUnit;
              const marginPct = p.sellingPrice > 0 ? (margin / p.sellingPrice) * 100 : 0;
              const annualContribution = margin * p.netSaleUnits;

              return (
                <tr key={p.productName} className="border-b border-gray-100">
                  <td className="py-3 pr-2 font-medium text-gray-900">{p.productName}</td>
                  <td className="text-left py-3 px-2 text-gray-700">
                    {formatNIS(p.sellingPrice)}
                  </td>
                  <td className="text-left py-3 px-2 text-gray-700">
                    {formatNIS(variablePerUnit)}
                  </td>
                  <td className="text-left py-3 px-2 font-bold text-blue-700">
                    {formatNIS(margin)}
                  </td>
                  <td className="text-left py-3 px-2 font-bold text-blue-700">
                    {marginPct.toFixed(1)}%
                  </td>
                  <td className="text-left py-3 pl-2 font-bold text-gray-900">
                    {formatNIS(annualContribution)}
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
