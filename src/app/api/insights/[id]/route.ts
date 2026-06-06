import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getInsight, getSnapshot, saveInsight, Insight } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Ctx {
  params: Promise<{ id: string }>;
}

// GET /api/insights/[id] — return cached insight if it exists.
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const insight = await getInsight(id);
    if (!insight) {
      return NextResponse.json({ error: "Insight not generated yet" }, { status: 404 });
    }
    return NextResponse.json({ insight });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/insights/[id] — generate AI insights for the given snapshot.
export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const snapshot = await getSnapshot(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    // ---- Build a tight summary of the snapshot for the LLM ----
    const d = snapshot.data;
    const summaryForLLM = {
      capturedAt: snapshot.savedAt,
      totals: d.totals,
      products: d.pnl.map((p) => ({
        name: p.productName,
        annualQuantity: p.annualQuantity,
        netSaleUnits: p.netSaleUnits,
        sellingPrice: Math.round(p.sellingPrice * 100) / 100,
        revenue: Math.round(p.totalRevenue),
        cogs: Math.round(p.cogs),
        grossMarginPct: Math.round(p.grossMarginPct * 10) / 10,
        netMarginPct: Math.round(p.profitMargin * 10) / 10,
        netProfitAfterTax: Math.round(p.netProfitAfterTax),
        wastePercent: p.wastePercent,
        depreciationLoss: Math.round(p.depreciationLoss),
      })),
      pricing: d.pricing.map((p) => ({
        product: p.productName,
        basePrice: p.baseMarketPrice,
        exportSharePct: p.exportSharePct,
        fxImpactPct: Math.round(p.fxImpactPct * 10000) / 100,
        finalPrice: p.finalSellingPrice,
      })),
      workforce: d.workerCalc.map((w) => ({
        product: w.productName,
        ftes: w.numberOfWorkers,
        annualHours: w.totalAnnualHours,
      })),
      currentFxRate: d.exchangeRates.find((e) => e.code === "EUR")?.rate,
    };

    const systemPrompt = `אתה יועץ ניהולי בכיר המתמחה בכלכלה חקלאית ובתמחור מבוסס פעילות (ABC).
משתלת הוכברג היא משתלת עצי נוי ישראלית המייצאת לאירופה. אתה מקבל סנאפשוט של נתוני המשק וצריך לייצר ניתוח ניהולי קצר וחד.

חוקי כתיבה:
- כתוב בעברית מקצועית, ללא קלישאות
- אל תמציא מספרים — השתמש רק במה שמופיע בנתונים
- כל נקודה צריכה להיות ספציפית, פעולה-תכליתית, וניתנת ליישום
- הימנע ממילים כמו "כדאי לשקול" — תכתוב המלצה ברורה
- כל פריט: עד שתי שורות`;

    const userPrompt = `הנה סנאפשוט מנתוני משתלת הוכברג:

${JSON.stringify(summaryForLLM, null, 2)}

צור ניתוח ניהולי במבנה JSON הבא בדיוק:
{
  "summary": "סקירה ניהולית קצרה (2-3 משפטים) על מצב המשק בנקודה זו",
  "insights": [
    "תובנה 1 — תצפית עסקית מהותית מהנתונים",
    "תובנה 2 — ...",
    "תובנה 3 — ..."
  ],
  "recommendations": [
    "המלצה 1 — פעולה ניהולית קונקרטית",
    "המלצה 2 — ...",
    "המלצה 3 — ..."
  ],
  "warnings": [
    "אזהרה 1 — סיכון או נקודת חולשה שדורשת תשומת לב"
  ]
}

החזר רק את ה-JSON, ללא טקסט נוסף לפניו או אחריו.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text : "";

    // Parse the JSON the LLM produced (it may be wrapped in code fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI response did not contain valid JSON", raw: rawText },
        { status: 500 }
      );
    }
    const parsed = JSON.parse(jsonMatch[0]);

    const insight: Insight = {
      snapshotId: id,
      generatedAt: new Date().toISOString(),
      summary: String(parsed.summary || ""),
      insights: Array.isArray(parsed.insights) ? parsed.insights.map(String) : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map(String)
        : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    };

    await saveInsight(id, insight);
    return NextResponse.json({ insight, ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
