"use client";

import { useEffect, useState, useCallback } from "react";

interface SnapshotMeta {
  id: string;
  savedAt: string;
  totalRevenue: number;
  totalNetProfit: number;
  overallProfitMargin: number;
  hasInsight: boolean;
}

interface Insight {
  snapshotId: string;
  generatedAt: string;
  summary: string;
  recommendations: string[];
  insights: string[];
  warnings: string[];
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB")} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function InsightsView() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[] | null>(null);
  const [insights, setInsights] = useState<Record<string, Insight | null>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/snapshots", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load snapshots");
      const body = await res.json();
      const snaps: SnapshotMeta[] = body.snapshots ?? [];
      setSnapshots(snaps);

      // For snapshots that already have an insight, fetch them
      const insightsObj: Record<string, Insight | null> = {};
      await Promise.all(
        snaps
          .filter((s) => s.hasInsight)
          .map(async (s) => {
            const r = await fetch(`/api/insights/${s.id}`, { cache: "no-store" });
            if (r.ok) {
              const b = await r.json();
              insightsObj[s.id] = b.insight;
            }
          })
      );
      setInsights(insightsObj);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate(snapshotId: string) {
    setGeneratingId(snapshotId);
    setError(null);
    try {
      const res = await fetch(`/api/insights/${snapshotId}`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Generation failed");
      setInsights((prev) => ({ ...prev, [snapshotId]: body.insight }));
      // Mark the snapshot as having insight
      setSnapshots((prev) =>
        prev ? prev.map((s) => (s.id === snapshotId ? { ...s, hasInsight: true } : s)) : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed");
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
        <h2 className="text-lg font-bold text-gray-900">תובנות ניהוליות מבוססות AI</h2>
        <p className="text-sm text-gray-600 mt-1">
          לכל סנאפשוט שמור, ניתן להפיק תובנות, המלצות ואזהרות אישיות שמיוצרות
          על-ידי מנוע ה-AI (Claude). התובנות נשמרות ולא מתחדשות אלא אם תפיקי
          אותן מחדש.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <strong>שגיאה:</strong> {error}
        </div>
      )}

      {snapshots && snapshots.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">
            אין עדיין סנאפשוטים. כדי להפיק תובנות, שמרי קודם סנאפשוט בכפתור
            &quot;💾 שמירת Data&quot; שבכותרת.
          </p>
        </div>
      )}

      {snapshots && snapshots.length > 0 && (
        <div className="space-y-4">
          {snapshots.map((s) => {
            const insight = insights[s.id];
            const isGenerating = generatingId === s.id;

            return (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-mono text-gray-500">
                      📅 {formatDateTime(s.savedAt)}
                    </p>
                  </div>
                  {!insight && !isGenerating && (
                    <button
                      onClick={() => generate(s.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                    >
                      ✨ הפיקי תובנות AI
                    </button>
                  )}
                  {isGenerating && (
                    <span className="text-sm text-purple-600 font-medium">
                      🤖 ה-AI חושב…
                    </span>
                  )}
                  {insight && (
                    <button
                      onClick={() => generate(s.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                      title="הפק תובנות חדשות"
                    >
                      🔄 רענון תובנות
                    </button>
                  )}
                </div>

                {insight && (
                  <div className="mt-4 space-y-4">
                    {/* Summary */}
                    {insight.summary && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-xs uppercase text-blue-600 font-semibold mb-1">
                          סקירה ניהולית
                        </p>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {insight.summary}
                        </p>
                      </div>
                    )}

                    {/* Insights */}
                    {insight.insights.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                          💡 תובנות
                        </p>
                        <ul className="space-y-2">
                          {insight.insights.map((it, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-800 flex gap-2 leading-relaxed"
                            >
                              <span className="text-purple-500 flex-shrink-0">◆</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                          ✅ המלצות
                        </p>
                        <ul className="space-y-2">
                          {insight.recommendations.map((r, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-800 flex gap-2 leading-relaxed bg-green-50 p-2 rounded"
                            >
                              <span className="text-green-600 flex-shrink-0">▸</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {insight.warnings.length > 0 && (
                      <div>
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
                          ⚠️ אזהרות
                        </p>
                        <ul className="space-y-2">
                          {insight.warnings.map((w, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-800 flex gap-2 leading-relaxed bg-orange-50 p-2 rounded"
                            >
                              <span className="text-orange-600 flex-shrink-0">⚠</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                      תובנות יוצרו: {formatDateTime(insight.generatedAt)}
                    </p>
                  </div>
                )}

                {!insight && !isGenerating && (
                  <p className="text-sm text-gray-400 mt-3">
                    טרם הופקו תובנות לסנאפשוט זה. לחצי על &quot;הפיקי תובנות AI&quot;.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
