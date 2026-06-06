"use client";

import { useEffect, useState, useCallback } from "react";
import { formatNIS } from "@/lib/formatters";

interface SnapshotMeta {
  id: string;
  savedAt: string;
  totalRevenue: number;
  totalNetProfit: number;
  overallProfitMargin: number;
  hasInsight: boolean;
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

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הסנאפשוט הזה? לא ניתן לשחזר.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // Optimistic: remove locally then refresh
      setSnapshots((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch {
      alert("המחיקה נכשלה. נסי שוב.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">היסטוריית דאטה</h2>
          <p className="text-sm text-gray-600 mt-1">
            כל סנאפשוט שומר את כל המדדים והנתונים של הדשבורד באותו רגע. ניתן
            למחוק סנאפשוטים בודדים מבלי לפגוע באחרים. שמירת סנאפשוט נעשית מהכפתור
            למעלה בכותרת הדשבורד.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1 px-3 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 disabled:opacity-50"
        >
          🔄 רענון
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <strong>שגיאה:</strong> {error}
          <p className="mt-1 text-xs">
            אם זו הפעם הראשונה שאת משתמשת בהיסטוריה — ייתכן שיש להגדיר Vercel KV
            (Storage) בדשבורד של Vercel.
          </p>
        </div>
      )}

      {loading && !snapshots && (
        <div className="text-center text-gray-500 py-10">טוען היסטוריה…</div>
      )}

      {snapshots && snapshots.length === 0 && !loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            עוד לא שמרת סנאפשוט
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            כשתלחצי על &quot;💾 שמירת Data&quot; בכותרת הדשבורד, הסנאפשוט יופיע כאן עם
            תאריך, שעה, ואפשרות למחיקה.
          </p>
        </div>
      )}

      {snapshots && snapshots.length > 0 && (
        <div className="space-y-3">
          {snapshots.map((s) => {
            const isPositive = s.totalNetProfit >= 0;
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">
                      📅 {formatDateTime(s.savedAt)}
                    </span>
                    {s.hasInsight && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                        ✨ יש תובנות AI
                      </span>
                    )}
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
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-50"
                  title="מחיקת סנאפשוט"
                >
                  {deletingId === s.id ? "מוחק…" : "🗑️ מחיקה"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
