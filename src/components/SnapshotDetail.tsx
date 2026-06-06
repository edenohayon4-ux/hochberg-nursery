"use client";

import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

interface Props {
  data: NurseryData;
  savedAt: string;
}

export default function SnapshotDetail({ data, savedAt }: Props) {
  const { totals, pnl, pricing, workerCalc, exchangeRates, fixedCosts } = data;
  const eur = exchangeRates.find((r) => r.code === "EUR");

  return (
    <div dir="rtl" className="space-y-5 text-right">
      <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-600 uppercase font-semibold">
          סנאפשוט מתאריך:
        </p>
        <p className="text-lg font-bold text-gray-900 font-mono mt-1">
          {new Date(savedAt).toLocaleString("en-GB")}
        </p>
      </div>

      {/* === Totals === */}
      <section>
        <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          📊 סיכום כולל
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="הכנסות" value={formatNIS(totals.totalRevenue)} />
          <Kpi label="COGS" value={formatNIS(totals.totalCogs)} />
          <Kpi
            label="רווח גולמי"
            value={formatNIS(totals.totalGrossProfit)}
            sub={`${totals.overallGrossMarginPct.toFixed(1)}%`}
            color="indigo"
          />
          <Kpi
            label="רווח נקי אחרי מס"
            value={formatNIS(totals.totalNetProfit)}
            sub={`${totals.overallProfitMargin.toFixed(1)}%`}
            color={totals.totalNetProfit >= 0 ? "green" : "red"}
          />
          <Kpi label="עלויות קבועות" value={formatNIS(totals.totalFixedCosts)} />
          <Kpi label="עלות עבודה" value={formatNIS(totals.totalLaborCost)} />
          <Kpi label="עלויות משתנות" value={formatNIS(totals.totalVariableExpenses)} />
          <Kpi label="מס חברות (23%)" value={formatNIS(totals.totalCorporateTax)} />
        </div>
      </section>

      {/* === P&L per product === */}
      <section>
        <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          🌳 רווח והפסד לפי זן
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-right p-2">זן</th>
                <th className="text-right p-2">יחידות נטו</th>
                <th className="text-right p-2">מחיר/יח'</th>
                <th className="text-right p-2">הכנסה</th>
                <th className="text-right p-2">COGS</th>
                <th className="text-right p-2">% גולמי</th>
                <th className="text-right p-2">רווח נקי</th>
                <th className="text-right p-2">% נטו</th>
              </tr>
            </thead>
            <tbody>
              {pnl.map((p) => (
                <tr key={p.productName} className="border-t border-gray-100">
                  <td className="p-2 font-medium text-gray-900">{p.productName}</td>
                  <td className="p-2 text-gray-700">{p.netSaleUnits.toLocaleString()}</td>
                  <td className="p-2 text-gray-700">{formatNIS(p.sellingPrice)}</td>
                  <td className="p-2 text-gray-900 font-medium">
                    {formatNIS(p.totalRevenue)}
                  </td>
                  <td className="p-2 text-gray-600">{formatNIS(p.cogs)}</td>
                  <td className="p-2 text-blue-700 font-medium">
                    {p.grossMarginPct.toFixed(1)}%
                  </td>
                  <td
                    className={`p-2 font-bold ${
                      p.netProfitAfterTax >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formatNIS(p.netProfitAfterTax)}
                  </td>
                  <td
                    className={`p-2 font-bold ${
                      p.profitMargin >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {p.profitMargin.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Pricing === */}
      <section>
        <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          🏷️ פירוק מחירים (EUR)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-right p-2">זן</th>
                <th className="text-right p-2">מחיר בסיס</th>
                <th className="text-right p-2">% פרמיה</th>
                <th className="text-right p-2">% הנחה</th>
                <th className="text-right p-2">% יצוא</th>
                <th className="text-right p-2">% השפעת מט\"ח</th>
                <th className="text-right p-2">מחיר סופי</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-2 font-medium text-gray-900">{p.productName}</td>
                  <td className="p-2 text-gray-700">{p.baseMarketPrice.toFixed(2)}</td>
                  <td className="p-2 text-green-700">
                    {p.qualityPremiumPct === 0
                      ? "—"
                      : `+${(p.qualityPremiumPct * 100).toFixed(1)}%`}
                  </td>
                  <td className="p-2 text-orange-700">
                    {p.contractDiscountPct === 0
                      ? "—"
                      : `${(p.contractDiscountPct * 100).toFixed(1)}%`}
                  </td>
                  <td className="p-2 text-gray-700">{(p.exportSharePct * 100).toFixed(0)}%</td>
                  <td
                    className={`p-2 font-medium ${
                      p.fxImpactPct < 0 ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {(p.fxImpactPct * 100).toFixed(2)}%
                  </td>
                  <td className="p-2 font-bold text-gray-900">
                    {p.finalSellingPrice.toFixed(2)} ILS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Workforce === */}
      <section>
        <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
          👥 כוח עבודה
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-right p-2">זן</th>
                <th className="text-right p-2">שטח (דונם)</th>
                <th className="text-right p-2">שעות לדונם/שנה</th>
                <th className="text-right p-2">סך שעות שנתיות</th>
                <th className="text-right p-2">FTEs</th>
              </tr>
            </thead>
            <tbody>
              {workerCalc.map((w) => (
                <tr key={w.id} className="border-t border-gray-100">
                  <td className="p-2 font-medium text-gray-900">{w.productName}</td>
                  <td className="p-2 text-gray-700">{w.areaDunams}</td>
                  <td className="p-2 text-gray-700">{w.hoursPerDunamYear}</td>
                  <td className="p-2 text-gray-700">{w.totalAnnualHours.toLocaleString()}</td>
                  <td className="p-2 font-bold text-blue-700">{w.numberOfWorkers.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === FX + Fixed costs summary === */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
            💱 שערי חליפין
          </h4>
          <div className="space-y-1.5">
            {exchangeRates.map((r) => (
              <div key={r.code} className="flex justify-between text-xs bg-gray-50 rounded p-2">
                <span className="font-medium text-gray-900">
                  {r.code} ({r.currency})
                </span>
                <span className="font-bold text-gray-900">{r.rate.toFixed(2)} ILS</span>
              </div>
            ))}
          </div>
          {eur && (
            <p className="mt-2 text-xs text-gray-500">
              עודכן: {eur.lastUpdated}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">
            💰 הוצאות קבועות עיקריות
          </h4>
          <div className="space-y-1.5">
            {fixedCosts
              .slice()
              .sort((a, b) => b.annualAmount - a.annualAmount)
              .slice(0, 6)
              .map((c) => (
                <div
                  key={c.categoryEn}
                  className="flex justify-between text-xs bg-gray-50 rounded p-2"
                >
                  <span className="text-gray-700">{c.categoryEn}</span>
                  <span className="font-medium text-gray-900">
                    {formatNIS(c.annualAmount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  color = "gray",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "gray" | "indigo" | "green" | "red" | "blue";
}) {
  const colorMap = {
    gray: "bg-gray-50 text-gray-900",
    indigo: "bg-indigo-50 text-indigo-900",
    green: "bg-green-50 text-green-900",
    red: "bg-red-50 text-red-900",
    blue: "bg-blue-50 text-blue-900",
  };
  return (
    <div className={`p-3 rounded-lg ${colorMap[color]}`}>
      <p className="text-xs uppercase opacity-70 font-semibold">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
