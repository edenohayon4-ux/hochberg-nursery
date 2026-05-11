import { NurseryData } from "@/types";
import { formatNIS } from "@/lib/formatters";

export default function FxSensitivity({ data }: { data: NurseryData }) {
  const { fxSensitivity, pricing } = data;
  const baseRate = pricing[0]?.baseFxRate ?? 3.85;
  const currentRate = pricing[0]?.currentFxRate ?? 3.42;

  // Find max abs profit for bar scaling
  const maxAbs = Math.max(
    ...fxSensitivity.map((s) => Math.abs(s.netProfit))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        FX Sensitivity (EUR/NIS)
      </h3>
      <p className="mt-1 text-xs text-gray-400">
        Net profit at different EUR/NIS rates, recomputed in code.
        Base = {baseRate.toFixed(2)} &middot; Current = {currentRate.toFixed(2)}
      </p>

      <div className="mt-4 space-y-2">
        {fxSensitivity.map((s) => {
          const isCurrent = Math.abs(s.fxRate - currentRate) < 0.01;
          const isBase = Math.abs(s.fxRate - baseRate) < 0.01;
          const widthPct = (Math.abs(s.netProfit) / maxAbs) * 100;
          const color = s.netProfit >= 0 ? "bg-green-500" : "bg-red-500";

          return (
            <div key={s.fxRate} className="flex items-center gap-3">
              <span
                className={`text-xs font-mono w-14 ${
                  isCurrent
                    ? "font-bold text-blue-600"
                    : isBase
                    ? "font-bold text-gray-700"
                    : "text-gray-500"
                }`}
              >
                {s.fxRate.toFixed(2)}
                {isCurrent && " ★"}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span
                className={`text-sm font-medium w-32 text-right ${
                  s.netProfit >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {formatNIS(s.netProfit)}
              </span>
              <span className="text-xs text-gray-500 w-14 text-right">
                {s.netMarginPct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        ★ = current FX rate. Every column above is a hypothetical scenario —
        revenue is rebuilt from base price × premium × discount × FX impact.
      </p>
    </div>
  );
}
