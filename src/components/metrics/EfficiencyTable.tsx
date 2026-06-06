import { ProductEfficiency } from "@/types";
import { formatNIS, formatNumber } from "@/lib/formatters";

export default function EfficiencyTable({
  products,
}: {
  products: ProductEfficiency[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-full">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Production Efficiency by Crop
      </h3>
      <p dir="rtl" className="mt-1 mb-4 text-xs text-gray-400 text-right">
        פירוק ABC: כל פעולה ייצורית לכל זן — יחידות לשעה, סך שעות עבודה, ועלות כוללת
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.productId} className="border border-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">{product.productName}</h4>
              <span className="text-sm font-medium text-violet-600">
                {formatNIS(product.totalCost)}
              </span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500">Action</th>
                  <th className="text-right py-1.5 text-gray-500">Units/Hr</th>
                  <th className="text-right py-1.5 text-gray-500">Hours</th>
                  <th className="text-right py-1.5 text-gray-500">Cost</th>
                </tr>
              </thead>
              <tbody>
                {product.rows.map((row) => (
                  <tr key={row.action} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-700">{row.action}</td>
                    <td className="py-1.5 text-right text-gray-600">
                      {formatNumber(row.unitsPerHour)}
                    </td>
                    <td className="py-1.5 text-right text-gray-600">
                      {row.totalHours.toFixed(1)}
                    </td>
                    <td className="py-1.5 text-right font-medium text-gray-900">
                      {formatNIS(row.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
