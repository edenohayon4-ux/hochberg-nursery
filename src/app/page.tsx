import { fetchNurseryData } from "@/lib/sheets";
import TotalRevenue from "@/components/metrics/TotalRevenue";
import ProfitMargin from "@/components/metrics/ProfitMargin";
import ProductProfitability from "@/components/metrics/ProductProfitability";
import CostPerUnit from "@/components/metrics/CostPerUnit";
import ConversionRate from "@/components/metrics/ConversionRate";
import GrowthAnalysis from "@/components/metrics/GrowthAnalysis";
import FixedCostsBreakdown from "@/components/metrics/FixedCostsBreakdown";
import LaborCosts from "@/components/metrics/LaborCosts";
import EfficiencyTable from "@/components/metrics/EfficiencyTable";
import ExchangeRates from "@/components/metrics/ExchangeRates";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const data = await fetchNurseryData();

  const { efficiency } = data;
  const products = [efficiency.cercis, efficiency.albizia, efficiency.lagerstroemia];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hochberg Nursery Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live KPIs from Google Sheets — auto-refreshes every 1 minute
            </p>
          </div>
          <RefreshButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Row 1: Key KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TotalRevenue data={data} />
          <ProfitMargin data={data} />
          <ConversionRate data={data} />
          <GrowthAnalysis data={data} />
        </div>

        {/* Row 2: Product Profitability Table */}
        <ProductProfitability data={data} />

        {/* Row 3: Cost Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CostPerUnit data={data} />
          <FixedCostsBreakdown data={data} />
          <LaborCosts data={data} />
        </div>

        {/* Row 4: Efficiency Tables */}
        <EfficiencyTable products={products} />

        {/* Row 5: Exchange Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExchangeRates data={data} />
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <p className="text-center text-xs text-gray-400">
          Hochberg Nursery Project &middot; Data synced from Google Sheets
        </p>
      </footer>
    </main>
  );
}
