// ============================================================
// Hochberg Nursery — Data Fetching & P&L Computation
// ============================================================
// All financial calculations live IN THIS FILE — we never read
// the "חישובים כוללים" (Calculations) sheet or "גיליון1"; those
// are derived sheets in the spreadsheet that will be deleted.
// The dashboard is fed only by the raw input sheets:
//   Farm_Inputs, Time_Per_Action, Wage_Components, Worker_Calc,
//   Pricing_Components, Fixed_Cost_Components,
//   {Cercis|Albizia|Lagerstroemia}-Output_Costs,
//   Labor_Yearly, Fixed Costs, Depreciation per Crop,
//   Exchange Rates, Sales_Pricing
// ============================================================

import {
  NurseryData,
  EfficiencyRow,
  ProductEfficiency,
  LaborRow,
  FixedCostRow,
  DepreciationRow,
  ExchangeRate,
  SalesPricing,
  FarmInput,
  WageBuildup,
  WageComponent,
  WorkerCalcRow,
  PricingBreakdown,
  OutputCostRow,
  ProductPnL,
  FxScenario,
} from "@/types";

// === Config =================================================
const SPREADSHEET_ID = "1AfRSC17P438SlMGRILbMx0vf5PWb-oHV";

// Tax model constants (sourced from the Tax_Model sheet, hard-coded
// in code per requirement — formula lives in code, not in sheet)
const CORPORATE_TAX_RATE = 0.23;

// === URL helpers ============================================
function sheetCsvUrl(sheetName: string): string {
  const encoded = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

// === Number parsing =========================================
// Sheet values may include commas, ₪ signs, parentheses (negatives),
// quotes, percent signs. parseNumber strips them all.
function parseNumber(val: string | undefined | null): number {
  if (!val) return 0;
  let s = String(val).replace(/[",₪\s]/g, "").trim();
  if (!s || s === "-" || s === "—") return 0;
  // Parentheses indicate negative numbers in finance
  let negative = false;
  if (s.startsWith("(") && s.endsWith(")")) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  return negative ? -n : n;
}

function parsePercent(val: string | undefined | null): number {
  if (!val) return 0;
  const cleaned = String(val).replace(/[",%\s]/g, "").trim();
  if (!cleaned || cleaned === "-" || cleaned === "—") return 0;
  let negative = false;
  let s = cleaned;
  if (s.startsWith("(") && s.endsWith(")")) {
    negative = true;
    s = s.slice(1, -1);
  }
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  return negative ? -n : n;
}

// Returns the percent as a *fraction* (e.g. "5%" -> 0.05).
// If the value contains a '%' sign we ALWAYS divide by 100.
// Otherwise we apply a heuristic: values |x| > 1.5 are treated as percent.
function parsePercentFraction(val: string | undefined | null): number {
  if (!val) return 0;
  const raw = String(val);
  const hasPercentSign = raw.includes("%");
  const n = parsePercent(val);
  if (hasPercentSign) return n / 100;
  return Math.abs(n) > 1.5 ? n / 100 : n;
}

// === CSV parser =============================================
function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (current || row.length > 0) {
        row.push(current.trim());
        rows.push(row);
        row = [];
        current = "";
      }
      if (char === "\r" && csv[i + 1] === "\n") i++;
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

async function fetchCsv(sheetName: string): Promise<string[][]> {
  const res = await fetch(sheetCsvUrl(sheetName), {
    next: { revalidate: 60 },
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet '${sheetName}': ${res.status}`);
  }
  const text = await res.text();
  return parseCsvRows(text);
}

// === Sheet parsers ==========================================

// Farm_Inputs: header rows may include description text; we find
// the data rows by looking for an ID column with a numeric value.
function parseFarmInputs(rows: string[][]): FarmInput[] {
  const out: FarmInput[] = [];
  for (const r of rows) {
    if (r.length < 8) continue;
    const id = parseNumber(r[0]);
    if (!id || id < 98 || id > 100) continue;
    out.push({
      id,
      productName: r[1].replace(/"/g, ""),
      areaDunams: parseNumber(r[2]),
      plantsPerDunam: parseNumber(r[3]),
      cyclesPerYear: parseNumber(r[4]),
      grossAnnualUnits: parseNumber(r[5]),
      wastePercent: parsePercentFraction(r[6]),
      netSaleUnits: parseNumber(r[7]),
      pctOfTotalArea: parsePercentFraction(r[9] ?? ""),
    });
  }
  return out;
}

// Wage_Components: rows look like "Component,Description,%base,₪/hr".
// We grab the row where label matches; the last data row contains the
// loaded hourly cost.
function parseWageBuildup(rows: string[][]): WageBuildup {
  const components: WageComponent[] = [];
  let basePay = 0;
  let totalLoadingPct = 0;
  let totalLoadingAmount = 0;
  let loadedHourlyCost = 0;

  for (const r of rows) {
    if (r.length < 4) continue;
    const label = (r[0] || "").trim();
    if (!label) continue;
    // Skip obvious header rows
    if (label.includes("רכיב") || label.includes("הסבר")) continue;

    const amount = parseNumber(r[3]);
    const pct = parsePercentFraction(r[2]);

    if (label.startsWith("שכר בסיס")) {
      basePay = amount;
      components.push({ component: label, description: r[1] || "", pctOfBase: pct, amountPerHour: amount });
    } else if (label.includes("סה") && label.includes("העמסה")) {
      // "סה"כ העמסה" — total loading row
      totalLoadingPct = pct;
      totalLoadingAmount = amount;
    } else if (label.includes("שכר שעתי טעון") || label.includes("Cost/Hr")) {
      loadedHourlyCost = amount;
    } else if (amount > 0 || pct > 0) {
      components.push({ component: label, description: r[1] || "", pctOfBase: pct, amountPerHour: amount });
    }
  }

  // Fall back: compute loaded cost from base + sum of components
  if (!loadedHourlyCost) {
    const componentsSum = components
      .filter((c) => !c.component.startsWith("שכר בסיס"))
      .reduce((s, c) => s + c.amountPerHour, 0);
    loadedHourlyCost = basePay + componentsSum;
    if (!totalLoadingAmount) totalLoadingAmount = componentsSum;
  }

  return { components, basePay, totalLoadingPct, totalLoadingAmount, loadedHourlyCost };
}

// Worker_Calc: rows include ID, product, area, hours/dunam, total hours, FTE hours, workers
function parseWorkerCalc(rows: string[][]): WorkerCalcRow[] {
  const out: WorkerCalcRow[] = [];
  for (const r of rows) {
    if (r.length < 7) continue;
    const id = parseNumber(r[0]);
    if (!id || id < 98 || id > 100) continue;
    out.push({
      id,
      productName: r[1].replace(/"/g, ""),
      areaDunams: parseNumber(r[2]),
      hoursPerDunamYear: parseNumber(r[3]),
      totalAnnualHours: parseNumber(r[4]),
      hoursPerFTE: parseNumber(r[5]),
      numberOfWorkers: parseNumber(r[6]),
    });
  }
  return out;
}

// Pricing_Components: two FX blocks (EUR, USD). We use only the EUR
// block — the dashboard displays EUR-based final prices.
function parsePricingComponents(rows: string[][]): PricingBreakdown[] {
  const out: PricingBreakdown[] = [];
  for (const r of rows) {
    if (r.length < 10) continue;
    const id = parseNumber(r[0]);
    if (!id || id < 98 || id > 100) continue;
    // Avoid USD duplicates: keep only the first occurrence of each ID
    if (out.find((p) => p.id === id)) continue;
    out.push({
      id,
      productName: r[1].replace(/"/g, ""),
      baseMarketPrice: parseNumber(r[2]),
      qualityPremiumPct: parsePercentFraction(r[3]),
      contractDiscountPct: parsePercentFraction(r[4]),
      exportSharePct: parsePercentFraction(r[5]),
      baseFxRate: parseNumber(r[6]),
      currentFxRate: parseNumber(r[7]),
      fxImpactPct: parsePercentFraction(r[8]),
      finalSellingPrice: parseNumber(r[9]),
    });
  }
  return out;
}

// {Product}-Output_Costs: variable expenses per action
function parseOutputCosts(rows: string[][]): OutputCostRow[] {
  const out: OutputCostRow[] = [];
  for (const r of rows) {
    if (r.length < 7) continue;
    const id = parseNumber(r[0]);
    const action = (r[1] || "").trim();
    if (!id || !action || action === "Action") continue;
    out.push({
      productId: id,
      action,
      unitsPerHour: parseNumber(r[2]),
      totalUnits: parseNumber(r[3]),
      totalHours: parseNumber(r[4]),
      costPerHour: parseNumber(r[5]),
      totalCost: parseNumber(r[6]),
    });
  }
  return out;
}

// === Sales Pricing fallback parser ===========================
function parseSalesPricing(rows: string[][]): SalesPricing[] {
  return rows
    .slice(1)
    .filter((r) => r.length >= 3 && parseNumber(r[0]))
    .map((r) => ({
      id: parseNumber(r[0]),
      productName: r[1].replace(/"/g, ""),
      sellingPrice: parseNumber(r[2]),
    }));
}

// === Main fetch function ====================================
export async function fetchNurseryData(): Promise<NurseryData> {
  // ---- Step 1: Parallel-fetch all raw input sheets ---------
  // NOTE: The Albizia and Lagerstroemia output_cost tabs have a
  // leading space in their sheet names — that's how they were
  // saved in the workbook. We do NOT fetch:
  //   - Sales_Pricing (doesn't exist; we use Pricing_Components.finalSellingPrice)
  //   - Depreciation per Crop (doesn't exist; computed in code from Farm_Inputs + Pricing_Components)
  //   - חישובים כוללים / גיליון1 (per requirement, all P&L is computed here)
  const [
    farmInputsRaw,
    wageRaw,
    workerCalcRaw,
    pricingRaw,
    cercisOutRaw,
    albiziaOutRaw,
    lagerOutRaw,
    laborRaw,
    fixedRaw,
    fxRaw,
  ] = await Promise.all([
    fetchCsv("Farm_Inputs"),
    fetchCsv("Wage_Components"),
    fetchCsv("Worker_Calc"),
    fetchCsv("Pricing_Components"),
    fetchCsv("Cercis-Output_Costs"),
    fetchCsv(" Albizia-Output_Costs"),
    fetchCsv(" Lagerstroemia-Output_Costs"),
    fetchCsv("Labor_Yearly"),
    fetchCsv("Fixed_Cost_Components"),
    fetchCsv("Exchange Rates"),
  ]);

  // ---- Step 2: Parse inputs --------------------------------
  const farmInputs = parseFarmInputs(farmInputsRaw);
  const wageBuildup = parseWageBuildup(wageRaw);
  const workerCalc = parseWorkerCalc(workerCalcRaw);
  const pricing = parsePricingComponents(pricingRaw);

  const cercisOutputCosts = parseOutputCosts(cercisOutRaw);
  const albiziaOutputCosts = parseOutputCosts(albiziaOutRaw);
  const lagerOutputCosts = parseOutputCosts(lagerOutRaw);

  // Labor_Yearly columns: ID, Product, Workers, MonthlyHours, HourlyWage, AnnualCost
  const labor: LaborRow[] = laborRaw
    .slice(1)
    .filter((r) => r.length >= 6 && parseNumber(r[0]))
    .map((r) => ({
      id: parseNumber(r[0]),
      product: r[1].replace(/"/g, ""),
      numberOfWorkers: parseNumber(r[2]),
      monthlyHours: parseNumber(r[3]),
      hourlyWage: parseNumber(r[4]),
      totalAnnualCost: parseNumber(r[5]),
    }));

  // Fixed_Cost_Components columns: #, He, En, qty, qty_desc, rate, rate_desc,
  // total100%, allocPct, total70% (the 70% portion attributable to our 3 varieties)
  // We use the 70% allocated amount since the dashboard only covers these 3 varieties.
  const fixedCosts: FixedCostRow[] = fixedRaw
    .slice(1)
    .filter((r) => r.length >= 10 && r[1] && !r[1].toUpperCase().includes("TOTAL") && parseNumber(r[0]))
    .map((r) => ({
      categoryHe: r[1].replace(/"/g, ""),
      categoryEn: r[2].replace(/"/g, ""),
      annualAmount: parseNumber(r[9]), // 70% allocated amount
    }));

  // Depreciation is COMPUTED in code (no sheet exists for it). Each row mirrors
  // the previous Depreciation per Crop layout, derived from Farm_Inputs + Pricing.
  const depreciation: DepreciationRow[] = farmInputs.map((fi) => {
    const pr = pricing.find((p) => p.productName.toLowerCase().includes(fi.productName.toLowerCase().split(" ")[0]));
    const unitPrice = pr?.finalSellingPrice ?? 0;
    const wasteQty = fi.grossAnnualUnits - fi.netSaleUnits;
    return {
      productName: fi.productName,
      totalAnnualUnits: fi.grossAnnualUnits,
      wastePercent: fi.wastePercent * 100, // store as percentage (e.g. 5)
      wasteQuantity: wasteQty,
      unitSalesPrice: unitPrice,
      totalRevenueLoss: wasteQty * unitPrice,
    };
  });

  // Exchange Rates: only the first 3 data rows hold real FX values
  // (Euro/USD/GBP from GOOGLEFINANCE). Everything after is an explanatory
  // sub-table for the spreadsheet user. The "Code" column is sometimes
  // empty in the live sheet, so we derive it from the currency name.
  const currencyCodeMap: Record<string, string> = {
    "Euro": "EUR",
    "US Dollar": "USD",
    "British Pound": "GBP",
  };
  const exchangeRates: ExchangeRate[] = fxRaw
    .slice(1)
    .map((r) => {
      const currency = (r[0] || "").replace(/"/g, "").trim();
      const codeFromSheet = (r[1] || "").replace(/"/g, "").trim();
      const code = codeFromSheet || currencyCodeMap[currency] || "";
      return {
        currency,
        code,
        rate: parseNumber(r[2]),
        lastUpdated: (r[3] || "").replace(/"/g, ""),
      };
    })
    .filter((r) => !!currencyCodeMap[r.currency] && r.rate > 0);

  // Sales_Pricing is derived from Pricing_Components (we don't fetch a separate sheet)
  const salesPricing: SalesPricing[] = pricing.map((p) => ({
    id: p.id,
    productName: p.productName,
    sellingPrice: p.finalSellingPrice,
  }));

  // ---- Step 3: Build efficiency objects --------------------
  // For backward compatibility with existing components, expose
  // the production output costs as ProductEfficiency.
  const toEfficiency = (
    productId: number,
    productName: string,
    outputCosts: OutputCostRow[]
  ): ProductEfficiency => {
    const eRows: EfficiencyRow[] = outputCosts.map((o) => ({
      id: o.productId,
      action: o.action,
      unitsPerHour: o.unitsPerHour,
      totalUnits: o.totalUnits,
      totalHours: o.totalHours,
      costPerHour: o.costPerHour,
      totalCost: o.totalCost,
    }));
    return {
      productId,
      productName,
      rows: eRows,
      totalCost: eRows.reduce((s, r) => s + r.totalCost, 0),
    };
  };

  const efficiency = {
    cercis: toEfficiency(98, "Cercis", cercisOutputCosts),
    albizia: toEfficiency(99, "Albizia", albiziaOutputCosts),
    lagerstroemia: toEfficiency(100, "Lagerstroemia", lagerOutputCosts),
  };

  // ---- Step 4: Compute P&L per product IN CODE -------------
  // Formulas (all live here, NOT in any spreadsheet):
  //
  //   Revenue           = annualQuantity × sellingPrice
  //   COGS              = totalVariableExpenses + annualLaborCost
  //   GrossProfit       = Revenue - COGS
  //   GrossMargin%      = GrossProfit / Revenue
  //   FixedAllocation   = TotalFixedCosts × (Revenue / TotalRevenue)
  //   TotalExpenses     = COGS + FixedAllocation
  //   PreTaxProfit      = Revenue - TotalExpenses
  //   CorporateTax      = max(0, PreTaxProfit) × 0.23
  //   NetProfitAfterTax = PreTaxProfit - CorporateTax
  //   NetMargin%        = NetProfitAfterTax / Revenue
  //
  // We use Farm_Inputs as the source of truth for quantities
  // (grossAnnualUnits) and Pricing_Components for selling prices
  // (which already incorporate FX, premium and discount logic).

  const totalFixedCosts = fixedCosts.reduce((s, c) => s + c.annualAmount, 0);

  type WorkProduct = {
    name: string;
    farmInput: FarmInput;
    pricing: PricingBreakdown;
    outputCosts: OutputCostRow[];
    laborCost: number;
    depreciationLoss: number;
  };

  const findBy = <T extends { productName: string }>(arr: T[], name: string) =>
    arr.find((x) => x.productName.toLowerCase().includes(name.toLowerCase()));

  const productOrder: { key: string; name: string }[] = [
    { key: "cercis", name: "Cercis" },
    { key: "albizia", name: "Albizia" },
    { key: "lagerstroemia", name: "Lagerstroemia" },
  ];

  const workProducts: WorkProduct[] = productOrder.map((p) => {
    const fi = findBy(farmInputs, p.name);
    const pr = findBy(pricing, p.name);
    if (!fi || !pr) {
      throw new Error(`Missing inputs for product ${p.name}`);
    }
    const outputCosts =
      p.key === "cercis"
        ? cercisOutputCosts
        : p.key === "albizia"
        ? albiziaOutputCosts
        : lagerOutputCosts;
    const laborRow = labor.find((l) => l.product.toLowerCase().includes(p.name.toLowerCase()));
    const depRow = depreciation.find((d) => d.productName.toLowerCase().includes(p.name.toLowerCase()));
    return {
      name: p.name,
      farmInput: fi,
      pricing: pr,
      outputCosts,
      laborCost: laborRow?.totalAnnualCost ?? 0,
      depreciationLoss: depRow?.totalRevenueLoss ?? 0,
    };
  });

  // First pass: compute revenue (needed for fixed-cost allocation)
  const revenues = workProducts.map((wp) => {
    const qty = wp.farmInput.grossAnnualUnits;
    const price = wp.pricing.finalSellingPrice;
    return qty * price;
  });
  const totalRevenue = revenues.reduce((s, v) => s + v, 0);

  // Second pass: compute full P&L per product
  const pnl: ProductPnL[] = workProducts.map((wp, idx) => {
    const annualQuantity = wp.farmInput.grossAnnualUnits;
    const netSaleUnits = wp.farmInput.netSaleUnits;
    const sellingPrice = wp.pricing.finalSellingPrice;
    const wastePct = wp.farmInput.wastePercent;
    const wasteQty = annualQuantity - netSaleUnits;

    const revenue = revenues[idx];
    const totalVariableExpenses = wp.outputCosts.reduce((s, r) => s + r.totalCost, 0);
    const annualLaborCost = wp.laborCost;
    const cogs = totalVariableExpenses + annualLaborCost;
    const grossProfit = revenue - cogs;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Allocate fixed costs by revenue share
    const revenueShare = totalRevenue > 0 ? revenue / totalRevenue : 0;
    const allocatedFixedCosts = totalFixedCosts * revenueShare;

    const totalExpenses = cogs + allocatedFixedCosts;
    const preTaxProfit = revenue - totalExpenses;
    const corporateTax = preTaxProfit > 0 ? preTaxProfit * CORPORATE_TAX_RATE : 0;
    const netProfitAfterTax = preTaxProfit - corporateTax;
    const profitMargin = revenue > 0 ? (netProfitAfterTax / revenue) * 100 : 0;

    const costPerNetUnit = netSaleUnits > 0 ? totalExpenses / netSaleUnits : 0;
    const profitPerUnit = netSaleUnits > 0 ? netProfitAfterTax / netSaleUnits : 0;

    return {
      productName: wp.name,
      annualQuantity,
      netSaleUnits,
      sellingPrice,
      basePrice: wp.pricing.baseMarketPrice,
      wastePercent: wastePct,
      wasteQuantity: wasteQty,
      productSalesRevenue: revenue,
      totalRevenue: revenue,
      variableExpenses: wp.outputCosts,
      totalVariableExpenses,
      productionLaborCost: totalVariableExpenses, // compat alias
      seedMaterialCost: 0,
      depreciationLoss: wp.depreciationLoss,
      annualLaborCost,
      allocatedFixedCosts,
      cogs,
      grossProfit,
      grossMarginPct,
      totalExpenses,
      preTaxProfit,
      corporateTax,
      netProfit: netProfitAfterTax,
      netProfitAfterTax,
      profitMargin,
      costPerNetUnit,
      profitPerUnit,
    };
  });

  // ---- Step 5: Totals --------------------------------------
  const totalCogs = pnl.reduce((s, p) => s + p.cogs, 0);
  const totalGrossProfit = pnl.reduce((s, p) => s + p.grossProfit, 0);
  const totalLaborCost = pnl.reduce((s, p) => s + p.annualLaborCost, 0);
  const totalVariableExpenses = pnl.reduce((s, p) => s + p.totalVariableExpenses, 0);
  const totalPreTaxProfit = pnl.reduce((s, p) => s + p.preTaxProfit, 0);
  const totalCorporateTax = pnl.reduce((s, p) => s + p.corporateTax, 0);
  const totalNetProfit = pnl.reduce((s, p) => s + p.netProfitAfterTax, 0);
  const totalGrossUnits = pnl.reduce((s, p) => s + p.annualQuantity, 0);
  const totalNetUnits = pnl.reduce((s, p) => s + p.netSaleUnits, 0);
  const totalArea = farmInputs.reduce((s, f) => s + f.areaDunams, 0);
  const totalWorkers = workerCalc.reduce((s, w) => s + w.numberOfWorkers, 0);
  const totalAnnualHours = workerCalc.reduce((s, w) => s + w.totalAnnualHours, 0);
  const totalDepreciationLoss = pnl.reduce((s, p) => s + p.depreciationLoss, 0);
  const totalExpenses = pnl.reduce((s, p) => s + p.totalExpenses, 0);
  const overallGrossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const overallProfitMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

  // ---- Step 6: FX sensitivity scenarios --------------------
  // Re-compute P&L at hypothetical EUR/NIS rates. Each scenario
  // scales each product's revenue by (1 + exportShare × (newRate/baseRate - 1)).
  const fxScenarios: number[] = [3.2, 3.4, 3.6, 3.8, 3.85, 4.0, 4.2, 4.4];
  const fxSensitivity: FxScenario[] = fxScenarios.map((scenarioRate) => {
    const scenarioRevenues = workProducts.map((wp) => {
      const fxImpact = wp.pricing.exportSharePct * (scenarioRate / wp.pricing.baseFxRate - 1);
      const adjustedPrice =
        wp.pricing.baseMarketPrice *
        (1 + wp.pricing.qualityPremiumPct) *
        (1 + wp.pricing.contractDiscountPct) *
        (1 + fxImpact);
      return wp.farmInput.grossAnnualUnits * adjustedPrice;
    });
    const scenarioTotalRevenue = scenarioRevenues.reduce((s, v) => s + v, 0);
    const scenarioCogs = pnl.reduce((s, p) => s + p.cogs, 0); // unchanged
    const scenarioGross = scenarioTotalRevenue - scenarioCogs;
    const scenarioPreTax = scenarioGross - totalFixedCosts;
    const scenarioTax = scenarioPreTax > 0 ? scenarioPreTax * CORPORATE_TAX_RATE : 0;
    const scenarioNet = scenarioPreTax - scenarioTax;
    return {
      fxRate: scenarioRate,
      totalRevenue: scenarioTotalRevenue,
      grossProfit: scenarioGross,
      allocatedFixed: totalFixedCosts,
      preTaxProfit: scenarioPreTax,
      corporateTax: scenarioTax,
      netProfit: scenarioNet,
      netMarginPct: scenarioTotalRevenue > 0 ? (scenarioNet / scenarioTotalRevenue) * 100 : 0,
    };
  });

  return {
    farmInputs,
    wageBuildup,
    workerCalc,
    pricing,
    efficiency,
    labor,
    fixedCosts,
    depreciation,
    exchangeRates,
    salesPricing,
    pnl,
    fxSensitivity,
    corporateTaxRate: CORPORATE_TAX_RATE,
    totals: {
      totalRevenue,
      totalCogs,
      totalGrossProfit,
      overallGrossMarginPct,
      totalFixedCosts,
      totalLaborCost,
      totalVariableExpenses,
      totalPreTaxProfit,
      totalCorporateTax,
      totalNetProfit,
      totalNetProfitAfterTax: totalNetProfit,
      overallProfitMargin,
      totalGrossUnits,
      totalNetUnits,
      totalUnits: totalGrossUnits,
      totalArea,
      totalWorkers,
      totalAnnualHours,
      totalDepreciationLoss,
      totalExpenses,
    },
  };
}
