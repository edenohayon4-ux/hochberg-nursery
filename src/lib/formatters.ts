// Display currency as "ILS" code instead of the ₪ symbol.
// Format: "1,234,567 ILS" (number then code, space-separated).
export function formatNIS(value: number): string {
  const sign = value < 0 ? "-" : "";
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.abs(Math.round(value)));
  return `${sign}${formatted} ILS`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
