import { NurseryData } from "@/types";
import { formatPercent, formatNumber } from "@/lib/formatters";

export default function ConversionRate({ data }: { data: NurseryData }) {
  const { depreciation } = data;

  // Conversion rate = units that survived waste / total units produced
  const products = depreciation.map((d) => {
    const survivedUnits = d.totalAnnualUnits - d.wasteQuantity;
    const conversionRate = (survivedUnits / d.totalAnnualUnits) * 100;
    return {
      name: d.productName,
      totalUnits: d.totalAnnualUnits,
      wasteQuantity: d.wasteQuantity,
      survivedUnits,
      wastePercent: d.wastePercent,
      conversionRate,
    };
  });

  const totalUnits = products.reduce((s, p) => s + p.totalUnits, 0);
  const totalSurvived = products.reduce((s, p) => s + p.survivedUnits, 0);
  const overallConversion = (totalSurvived / totalUnits) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Conversion Rate (Yield)
      </h3>
      <p className="mt-2 text-3xl font-bold text-blue-600">
        {formatPercent(overallConversion)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {formatNumber(totalSurvived)} / {formatNumber(totalUnits)} units usable
      </p>
      <div className="mt-4 space-y-3">
        {products.map((p) => (
          <div key={p.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{p.name}</span>
              <span className="font-medium text-gray-900">
                {formatPercent(p.conversionRate)}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{ width: `${p.conversionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Waste: {formatNumber(p.wasteQuantity)} units ({formatPercent(p.wastePercent)})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
