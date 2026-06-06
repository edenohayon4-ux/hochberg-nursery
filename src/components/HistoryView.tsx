"use client";

import { useEffect, useState, useCallback } from "react";
import { formatNIS } from "@/lib/formatters";
import { NurseryData } from "@/types";
import SnapshotDetail from "./SnapshotDetail";

interface SnapshotMeta {
  id: string;
  savedAt: string;
  totalRevenue: number;
  totalNetProfit: number;
  overallProfitMargin: number;
  hasInsight: boolean;
}

interface FullSnapshot extends SnapshotMeta {
  data: NurseryData;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

export default function HistoryView() {
  const [snapshots, setSnapshots] = useState<SnapshotMeta[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<FullSnapshot | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snapshots", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const body = await res.json();
      setSnapshots(body.snapshots ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandedId(id);
    setExpandedData(null);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/snapshots/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load snapshot");
      const body = await res.json();
      setExpandedData(body.snapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load detail");
      setExpandedId(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("למחוק את הסנאפשוט הזה? לא ניתן לשחזר.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSnapshots((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
      if (expandedId === id) {
        setExpandedId(null);
        setExpandedData(null);
      }
    } catch {
      alert("המחיקה נכשלה. נסי שוב.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div dir="rtl" className="space-y-6 text-right">
      <div className="bg-gradient-to-l from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 flex items-center justify-between gap-3 flex-row-reverse">
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 disabled:opacity-50"
        >
          🔄 רענון
        </button>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-900">היסטוריית דאטה</h2>
          <p className="text-sm text-gray-600 mt-1">
            כל סנאפשוט שומר את כל המדדים והנתונים של הדשבורד באותו רגע. לחיצה על
            שורה פותחת תצוגה מפורטת. ניתן למחוק סנאפשוטים בודדים מבלי לפגוע באחרים.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <strong>שגיאה:</strong> {error}
        </div>
      )}

      {loading && !snapshots && (
        <div className="text-center text-gray-500 py-10">טוען היסטוריה…</div>
      )}

      {snapshots && snapshots.length === 0 && !loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-base font-semibold text-gray-900">עוד לא שמרת סנאפשוט</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            כשתלחצי על &quot;💾 Save Data&quot; בכותרת הדשבורד, הסנאפשוט יופיע כאן עם
            תאריך, שעה, ואפשרות מחיקה.
          </p>
        </div>
      )}

      {snapshots && snapshots.length > 0 && (
        <div className="space-y-3">
          {snapshots.map((s) => {
            const isPositive = s.totalNetProfit >= 0;
            const isExpanded = expandedId === s.id;

            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  isExpanded ? "border-blue-300 shadow-md" : "border-gray-100 hover:shadow-md"
                }`}
              >
                {/* Clickable row */}
                <div
                  onClick={() => toggleExpand(s.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer flex-row-reverse"
                >
                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    disabled={deletingId === s.id}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-50"
                    title="מחיקת סנאפשוט"
                  >
                    {deletingId === s.id ? "מוחק…" : "🗑️ מחיקה"}
                  </button>

                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2 flex-row-reverse justify-start">
                      <span className="text-sm font-mono text-gray-500">
                        📅 {formatDateTime(s.savedAt)}
                      </span>
                      {s.hasInsight && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                          ✨ יש תובנות AI
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mr-auto">
                        {isExpanded ? "▲ סגור" : "▼ פתח לפרטים"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-500">הכנסות</span>
                        <p className="font-semibold text-gray-900">
                          {formatNIS(s.totalRevenue)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">רווח נקי</span>
                        <p
                          className={`font-semibold ${
                            isPositive ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {formatNIS(s.totalNetProfit)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">שיעור רווח</span>
                        <p
                          className={`font-semibold ${
                            isPositive ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {s.overallProfitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                    {loadingDetail && (
                      <div className="text-center text-gray-500 py-6">
                        טוען פרטים מלאים…
                      </div>
                    )}
                    {expandedData && (
                      <SnapshotDetail
                        data={expandedData.data}
                        savedAt={expandedData.savedAt}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
