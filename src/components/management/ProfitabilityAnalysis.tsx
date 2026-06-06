import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function ProfitabilityAnalysis({ data }: { data: NurseryData }) {
  const { pnl, totals } = data;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        ניתוח רווחיות (Profitability Analysis)
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        ניתוח מלא: הכנסה → COGS → רווח גולמי → הוצאות קבועות מוקצות → רווח לפני
        מס → מס חברות 23% → רווח נקי לאחר מס.
      </p>

      {/* Totals summary */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 uppercase">הכנסות כוללות</p>
          <p className="text-base font-bold text-blue-900 mt-1">
            {formatNIS(totals.totalRevenue)}
          </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-xs text-indigo-600 uppercase">רווח גולמי</p>
          <p className="text-base font-bold text-indigo-900 mt-1">
            {formatNIS(totals.totalGrossProfit)}
          </p>
          <p className="text-xs text-indigo-700 mt-1">
            {totals.overallGrossMarginPct.toFixed(1)}%
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-600 uppercase">מס חברות 23%</p>
          <p className="text-base font-bold text-orange-900 mt-1">
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
            רווח נקי לאחר מס
          </p>
          <p
            className={`text-base font-bold mt-1 ${
              totals.totalNetProfit >= 0 ? "text-green-900" : "text-red-900"
            }`}
          >
            {formatNIS(totals.totalNetProfit)}
          </p>
          <p
            className={`text-xs mt-1 ${
              totals.totalNetProfit >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {totals.overallProfitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Per-product P&L */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 text-xs uppercase text-gray-500">
              <th className="text-right py-2 pr-2">סעיף</th>
              {pnl.map((p) => (
                <th key={p.productName} className="text-left py-2 px-2">
                  {p.productName}
                </th>
              ))}
              <th className="text-left py-2 pl-2">סה\"כ</th>
            </tr>
          </thead>
          <tbody>
            <ProfitRow
              label="הכנסות"
              values={pnl.map((p) => p.totalRevenue)}
              total={totals.totalRevenue}
            />
            <ProfitRow
              label="COGS"
              values={pnl.map((p) => -p.cogs)}
              total={-totals.totalCogs}
              muted
            />
            <ProfitRow
              label="רווח גולמי"
              values={pnl.map((p) => p.grossProfit)}
              total={totals.totalGrossProfit}
              bold
              percentages={pnl.map((p) => p.grossMarginPct)}
              totalPct={totals.overallGrossMarginPct}
            />
            <ProfitRow
              label="הוצאות קבועות מוקצות"
              values={pnl.map((p) => -p.allocatedFixedCosts)}
              total={-totals.totalFixedCosts}
              muted
            />
            <ProfitRow
              label="רווח לפני מס"
              values={pnl.map((p) => p.preTaxProfit)}
              total={totals.totalPreTaxProfit}
            />
            <ProfitRow
              label="מס חברות 23%"
              values={pnl.map((p) => -p.corporateTax)}
              total={-totals.totalCorporateTax}
              muted
            />
            <ProfitRow
              label="רווח נקי לאחר מס"
              values={pnl.map((p) => p.netProfitAfterTax)}
              total={totals.totalNetProfit}
              bold
              highlight
              percentages={pnl.map((p) => p.profitMargin)}
              totalPct={totals.overallProfitMargin}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfitRow({
  label, values, total, bold, muted, highlight, percentages, totalPct,
}: {
  label: string;
  values: number[];
  total: number;
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
  percentages?: number[];
  totalPct?: number;
}) {
  const baseClass = highlight
    ? total >= 0 ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
    : "";
  const cellClass = muted ? "text-gray-500" : bold ? "font-bold" : "text-gray-700";

  return (
    <tr className={`border-b border-gray-100 ${baseClass}`}>
      <td className={`py-2.5 pr-2 ${bold ? "font-bold" : "font-medium"} text-gray-900`}>
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className={`text-left py-2.5 px-2 ${cellClass}`}>
          {formatNIS(v)}
          {percentages && (
            <span className="block text-xs text-gray-500">
              ({percentages[i].toFixed(1)}%)
            </span>
          )}
        </td>
      ))}
      <td className={`text-left py-2.5 pl-2 ${cellClass}`}>
        {formatNIS(total)}
        {totalPct !== undefined && (
          <span className="block text-xs text-gray-500">({totalPct.toFixed(1)}%)</span>
        )}
      </td>
    </tr>
  );
}
