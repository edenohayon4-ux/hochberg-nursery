// ============================================================
// Hochberg Nursery — Data Types
// ============================================================
// All P&L numbers are COMPUTED IN CODE (lib/sheets.ts) from raw
// input sheets only. We do NOT read the "חישובים כוללים" sheet
// or "גיליון1" — those are derived sheets that will be deleted.
// ============================================================

export interface EfficiencyRow {
  id: number;
  action: string;
  unitsPerHour: number;
  totalUnits: number;
  totalHours: number;
  costPerHour: number;
  totalCost: number;
}

export interface ProductEfficiency {
  productId: number;
  productName: string;
  rows: EfficiencyRow[];
  totalCost: number;
}

export interface LaborRow {
  id: number;
  product: string;
  numberOfWorkers: number;
  monthlyHours: number;
  hourlyWage: number;
  totalAnnualCost: number;
}

export interface FixedCostRow {
  categoryHe: string;
  categoryEn: string;
  annualAmount: number;
}

export interface DepreciationRow {
  productName: string;
  totalAnnualUnits: number;
  wastePercent: number;
  wasteQuantity: number;
  unitSalesPrice: number;
  totalRevenueLoss: number;
}

export interface ExchangeRate {
  currency: string;
  code: string;
  rate: number;
  lastUpdated: string;
}

export interface SalesPricing {
  id: number;
  productName: string;
  sellingPrice: number;
}

// === NEW: Farm Inputs (from Farm_Inputs sheet) ===============
export interface FarmInput {
  id: number;
  productName: string;
  areaDunams: number;
  plantsPerDunam: number;
  cyclesPerYear: number;
  grossAnnualUnits: number;
  wastePercent: number;
  netSaleUnits: number;
  pctOfTotalArea: number;
}

// === NEW: Wage breakdown (from Wage_Components sheet) ========
export interface WageComponent {
  component: string;
  description: string;
  pctOfBase: number;
  amountPerHour: number;
}

export interface WageBuildup {
  components: WageComponent[];
  basePay: number;
  totalLoadingPct: number;
  totalLoadingAmount: number;
  loadedHourlyCost: number;
}

// === NEW: Workforce sizing (from Worker_Calc sheet) ==========
export interface WorkerCalcRow {
  id: number;
  productName: string;
  areaDunams: number;
  hoursPerDunamYear: number;
  totalAnnualHours: number;
  hoursPerFTE: number;
  numberOfWorkers: number;
}

// === NEW: Pricing breakdown (from Pricing_Components sheet) ==
export interface PricingBreakdown {
  id: number;
  productName: string;
  baseMarketPrice: number;
  qualityPremiumPct: number;
  contractDiscountPct: number;
  exportSharePct: number;
  baseFxRate: number;
  currentFxRate: number;
  fxImpactPct: number;
  finalSellingPrice: number;
}

// === NEW: Per-action output cost (from {Product}-Output_Costs) ==
export interface OutputCostRow {
  productId: number;
  action: string;
  unitsPerHour: number;
  totalUnits: number;
  totalHours: number;
  costPerHour: number;
  totalCost: number;
}

// === Computed Product P&L ====================================
export interface ProductPnL {
  productName: string;
  // Inputs (from sheets)
  annualQuantity: number;        // gross
  netSaleUnits: number;          // after waste
  sellingPrice: number;          // final selling price (after FX)
  basePrice: number;             // base before FX adjustments
  wastePercent: number;
  wasteQuantity: number;
  // Revenue
  productSalesRevenue: number;
  totalRevenue: number;          // alias for compatibility
  // Variable costs
  variableExpenses: OutputCostRow[];
  totalVariableExpenses: number;
  productionLaborCost: number;   // === totalVariableExpenses (compat)
  seedMaterialCost: number;      // not in new sheets; left 0
  depreciationLoss: number;      // revenue loss from waste
  // Labor & Fixed
  annualLaborCost: number;       // from Labor_Yearly
  allocatedFixedCosts: number;   // computed in code (revenue share)
  // Computed P&L
  cogs: number;                  // variable + labor
  grossProfit: number;
  grossMarginPct: number;
  totalExpenses: number;
  preTaxProfit: number;
  corporateTax: number;          // 23% if positive
  netProfit: number;             // alias for compat (= netProfitAfterTax)
  netProfitAfterTax: number;
  profitMargin: number;          // net margin %
  // Useful per-unit metrics
  costPerNetUnit: number;
  profitPerUnit: number;
}

// === NEW: FX sensitivity scenario =============================
export interface FxScenario {
  fxRate: number;
  totalRevenue: number;
  grossProfit: number;
  allocatedFixed: number;
  preTaxProfit: number;
  corporateTax: number;
  netProfit: number;
  netMarginPct: number;
}

// === Aggregated NurseryData ==================================
export interface NurseryData {
  // raw inputs (for breakdowns)
  farmInputs: FarmInput[];
  wageBuildup: WageBuildup;
  workerCalc: WorkerCalcRow[];
  pricing: PricingBreakdown[];
  efficiency: {
    cercis: ProductEfficiency;
    albizia: ProductEfficiency;
    lagerstroemia: ProductEfficiency;
  };
  labor: LaborRow[];
  fixedCosts: FixedCostRow[];
  depreciation: DepreciationRow[];
  exchangeRates: ExchangeRate[];
  salesPricing: SalesPricing[];
  // computed P&L
  pnl: ProductPnL[];
  fxSensitivity: FxScenario[];
  // tax model
  corporateTaxRate: number;
  // totals (all computed)
  totals: {
    totalRevenue: number;
    totalCogs: number;
    totalGrossProfit: number;
    overallGrossMarginPct: number;
    totalFixedCosts: number;
    totalLaborCost: number;
    totalVariableExpenses: number;
    totalPreTaxProfit: number;
    totalCorporateTax: number;
    totalNetProfit: number;     // alias for compat
    totalNetProfitAfterTax: number;
    overallProfitMargin: number;
    totalGrossUnits: number;
    totalNetUnits: number;
    totalUnits: number;          // alias = totalGrossUnits
    totalArea: number;
    totalWorkers: number;
    totalAnnualHours: number;
    totalDepreciationLoss: number;
    totalExpenses: number;
  };
}
