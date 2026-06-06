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
import PricingBreakdown from "@/components/metrics/PricingBreakdown";
import FxSensitivity from "@/components/metrics/FxSensitivity";
import TaxAndNetProfit from "@/components/metrics/TaxAndNetProfit";
import WorkforceAndWage from "@/components/metrics/WorkforceAndWage";
import DirectCostPerUnit from "@/components/management/DirectCostPerUnit";
import ContributionMargin from "@/components/management/ContributionMargin";
import ProfitabilityAnalysis from "@/components/management/ProfitabilityAnalysis";
import HistoryView from "@/components/HistoryView";
import InsightsView from "@/components/InsightsView";
import RefreshButton from "@/components/RefreshButton";
import Tabs, { TabDef } from "@/components/Tabs";

export const dynamic = "force-dynamic";

const TAB_DEFS: TabDef[] = [
  { id: "main", label: "📊 דשבורד ראשי" },
  { id: "management", label: "💼 דשבורד ניהולי" },
  { id: "history", label: "🕒 היסטוריית דאטה" },
  { id: "insights", label: "💡 תובנות ניהוליות" },
];

export default async function Dashboard() {
  const data = await fetchNurseryData();

  const { efficiency } = data;
  const products = [efficiency.cercis, efficiency.albizia, efficiency.lagerstroemia];

  // ===== Main Dashboard tab =====
  const mainContent = (
    <div className="space-y-6">
      {/* Row 1: Key KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalRevenue data={data} />
        <ProfitMargin data={data} />
        <ConversionRate data={data} />
        <GrowthAnalysis data={data} />
      </div>

      {/* Row 2: Tax & Net Profit + Pricing Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxAndNetProfit data={data} />
        <PricingBreakdown data={data} />
      </div>

      {/* Row 3: Product Profitability Table */}
      <ProductProfitability data={data} />

      {/* Row 4: Cost Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CostPerUnit data={data} />
        <FixedCostsBreakdown data={data} />
        <LaborCosts data={data} />
      </div>

      {/* Row 5: FX Sensitivity + Workforce */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FxSensitivity data={data} />
        <WorkforceAndWage data={data} />
      </div>

      {/* Row 6: Efficiency Tables */}
      <EfficiencyTable products={products} />

      {/* Row 7: Exchange Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExchangeRates data={data} />
      </div>
    </div>
  );

  // ===== Management Dashboard tab =====
  const managementContent = (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <h2 className="text-lg font-bold text-gray-900">דשבורד ניהולי</h2>
        <p className="text-sm text-gray-600 mt-1">
          שלושה מדדים מרכזיים לקבלת החלטות ניהוליות יומיומיות: עלות ישירה
          ליחידה, מרווח תרומה, וניתוח רווחיות מלא.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DirectCostPerUnit data={data} />
        <ContributionMargin data={data} />
      </div>

      <ProfitabilityAnalysis data={data} />
    </div>
  );

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

      <Tabs tabs={TAB_DEFS}>
        {{
          main: mainContent,
          management: managementContent,
          history: <HistoryView />,
          insights: <InsightsView />,
        }}
      </Tabs>

      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <p className="text-center text-xs text-gray-400">
          Hochberg Nursery Project &middot; Data synced from Google Sheets
        </p>
      </footer>
    </main>
  );
}
