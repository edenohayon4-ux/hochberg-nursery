import { NurseryData } from "@/types";

export default function ExchangeRates({ data }: { data: NurseryData }) {
  const { exchangeRates } = data;
  const flags: Record<string, string> = { EUR: "EU", USD: "US", GBP: "GB" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        Exchange Rates (NIS)
      </h3>
      <div className="mt-4 space-y-3">
        {exchangeRates.map((rate) => (
          <div
            key={rate.code}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {rate.code === "EUR" ? "\u20AC" : rate.code === "USD" ? "$" : "\u00A3"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">{rate.code}</p>
                <p className="text-xs text-gray-500">{rate.currency}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {rate.rate.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">{rate.lastUpdated}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
