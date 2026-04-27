import {
  NurseryData,
  EfficiencyRow,
  ProductEfficiency,
  LaborRow,
  FixedCostRow,
  DepreciationRow,
  ExchangeRate,
  SalesPricing,
  ProductPnL,
} from "@/types";

const SPREADSHEET_ID = "1G3tRrmesiT5F2jYcclEJ2jPemJ7gqzOR";

function sheetCsvUrl(sheetName: string): string {
  const encoded = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

function parseNumber(val: string): number {
  return parseFloat(val.replace(/,/g, "").replace(/"/g, "")) || 0;
}

function parsePercent(val: string): number {
  const cleaned = val.replace(/"/g, "").replace(/%/g, "").trim();
  return parseFloat(cleaned) || 0;
}

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
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${sheetName}`);
  const text = await res.text();
  return parseCsvRows(text);
}

function parseEfficiency(rows: string[][], productId: number, productName: string): ProductEfficiency {
  const dataRows = rows.slice(1).filter((r) => r.length >= 7 && r[0]);
  const parsed: EfficiencyRow[] = dataRows.map((r) => ({
    id: parseNumber(r[0]),
    action: r[1].replace(/"/g, ""),
    unitsPerHour: parseNumber(r[2]),
    totalUnits: parseNumber(r[3]),
    totalHours: parseNumber(r[4]),
    costPerHour: parseNumber(r[5]),
    totalCost: parseNumber(r[6]),
  }));
  return {
    productId,
    productName,
    rows: parsed,
    totalCost: parsed.reduce((sum, r) => sum + r.totalCost, 0),
  };
}

export async function fetchNurseryData(): Promise<NurseryData> {
  const [
    lagerRows,
    albiziaRows,
    cercisRows,
    laborRows,
    fixedRows,
    depRows,
    exRows,
    salesRows,
    pnlRows,
  ] = await Promise.all([
    fetchCsv("Lagerstroemia_Efficiency"),
    fetchCsv("Albizia_Efficiency"),
    fetchCsv("Cercis_Efficiency"),
    fetchCsv("Labor_Yearly"),
    fetchCsv("Fixed Costs"),
    fetchCsv("Depreciation per Crop"),
    fetchCsv("Exchange Rates"),
    fetchCsv("Sales_Pricing"),
    fetchCsv("גיליון1"),
  ]);

  const lagerstroemia = parseEfficiency(lagerRows, 100, "Lagerstroemia");
  const albizia = parseEfficiency(albiziaRows, 99, "Albizia");
  const cercis = parseEfficiency(cercisRows, 98, "Cercis");

  const labor: LaborRow[] = laborRows
    .slice(1)
    .filter((r) => r.length >= 6 && r[0] && r[1])
    .map((r) => ({
      id: parseNumber(r[0]),
      product: r[1].replace(/"/g, ""),
      numberOfWorkers: parseNumber(r[2]),
      monthlyHours: parseNumber(r[3]),
      hourlyWage: parseNumber(r[4]),
      totalAnnualCost: parseNumber(r[5]),
    }));

  const fixedCosts: FixedCostRow[] = fixedRows
    .slice(1)
    .filter((r) => r.length >= 3 && r[0] && r[2] && !r[0].includes("TOTAL"))
    .map((r) => ({
      categoryHe: r[0].replace(/"/g, ""),
      categoryEn: r[1].replace(/"/g, ""),
      annualAmount: parseNumber(r[2]),
    }));

  const depreciation: DepreciationRow[] = depRows
    .slice(1)
    .filter((r) => r.length >= 6 && r[0] && !r[0].includes("TOTAL"))
    .map((r) => ({
      productName: r[0].replace(/"/g, ""),
      totalAnnualUnits: parseNumber(r[1]),
      wastePercent: parsePercent(r[2]),
      wasteQuantity: parseNumber(r[3]),
      unitSalesPrice: parseNumber(r[4]),
      totalRevenueLoss: parseNumber(r[5]),
    }));

  const exchangeRates: ExchangeRate[] = exRows
    .slice(1)
    .filter((r) => r.length >= 4 && r[0])
    .map((r) => ({
      currency: r[0].replace(/"/g, ""),
      code: r[1].replace(/"/g, ""),
      rate: parseNumber(r[2]),
      lastUpdated: r[3].replace(/"/g, ""),
    }));

  const salesPricing: SalesPricing[] = salesRows
    .slice(1)
    .filter((r) => r.length >= 3 && r[0])
    .map((r) => ({
      id: parseNumber(r[0]),
      productName: r[1].replace(/"/g, ""),
      sellingPrice: parseNumber(r[2]),
    }));

  // Parse P&L from גיליון1
  const pnlData = pnlRows.slice(1).filter((r) => r.length >= 5);
  const products = ["Cercis", "Albizia", "Lagerstroemia"];
  const pnl: ProductPnL[] = [];

  const getVal = (label: string, col: number): number => {
    const row = pnlData.find((r) => r[0]?.includes(label));
    return row ? parseNumber(row[col]) : 0;
  };

  for (let i = 0; i < 3; i++) {
    const col = i + 1;
    const annualQuantity = getVal("Annual Quantity", col);
    const pnlSellingPrice = getVal("Selling Price", col);
    // Fix: Lagerstroemia's Total Revenue in the P&L sheet is incorrect because
    // the P&L uses an outdated selling price (111) instead of the canonical
    // value from Sales_Pricing (113). Recompute Total Revenue for Lagerstroemia
    // using the Sales_Pricing value: annualQuantity × sellingPrice.
    const sheetTotalRevenue = getVal("Total Revenue", col);
    const salesPriceEntry = salesPricing.find(
      (s) => s.productName === products[i]
    );
    const sellingPrice =
      products[i] === "Lagerstroemia" && salesPriceEntry
        ? salesPriceEntry.sellingPrice
        : pnlSellingPrice;
    const totalRevenue =
      products[i] === "Lagerstroemia"
        ? annualQuantity * sellingPrice
        : sheetTotalRevenue;
    pnl.push({
      productName: products[i],
      annualQuantity,
      sellingPrice,
      productSalesRevenue: getVal("Product Sales Revenue", col),
      totalRevenue,
      productionLaborCost: getVal("Production Labor", col),
      seedMaterialCost: getVal("Seed & Material", col),
      depreciationLoss: getVal("Depreciation", col),
      totalVariableExpenses: getVal("Total Variable Expenses", col),
      annualLaborCost: getVal("Annual Labor", col),
      allocatedFixedCosts: getVal("Allocated Fixed", col),
      totalExpenses: getVal("TOTAL EXPENSES", col),
      netProfit: getVal("NET PROFIT", col),
      profitMargin: parsePercent(
        pnlData.find((r) => r[0]?.includes("Profit Margin"))?.[col] || "0"
      ),
    });
  }

  const totalRevenue = pnl.reduce((s, p) => s + p.totalRevenue, 0);
  const totalExpenses = pnl.reduce((s, p) => s + p.totalExpenses, 0);
  const totalNetProfit = pnl.reduce((s, p) => s + p.netProfit, 0);
  const totalFixedCosts = fixedCosts.reduce((s, c) => s + c.annualAmount, 0);
  const totalLaborCost = labor.reduce((s, l) => s + l.totalAnnualCost, 0);
  const totalVariableExpenses = pnl.reduce((s, p) => s + p.totalVariableExpenses, 0);
  const totalUnits = pnl.reduce((s, p) => s + p.annualQuantity, 0);
  const totalDepreciationLoss = depreciation.reduce((s, d) => s + d.totalRevenueLoss, 0);

  return {
    efficiency: { lagerstroemia, albizia, cercis },
    labor,
    fixedCosts,
    depreciation,
    exchangeRates,
    salesPricing,
    pnl,
    totals: {
      totalRevenue,
      totalExpenses,
      totalNetProfit,
      overallProfitMargin: totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0,
      totalFixedCosts,
      totalLaborCost,
      totalVariableExpenses,
      totalUnits,
      totalDepreciationLoss,
    },
  };
}
