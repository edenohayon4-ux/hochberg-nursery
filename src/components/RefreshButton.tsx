"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatDateTime(d: Date): string {
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

export default function RefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setLastRefresh(formatDateTime(new Date()));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error("Refresh failed");
      router.refresh();
      setLastRefresh(formatDateTime(new Date()));
    } catch {
      alert("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/snapshots", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed");
      setSaveStatus("✅ נשמר!");
      setTimeout(() => setSaveStatus(null), 3000);
      // Trigger a router refresh so other tabs reload their lists
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setSaveStatus(`❌ ${msg.slice(0, 80)}`);
      setTimeout(() => setSaveStatus(null), 6000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {lastRefresh && (
        <span className="text-xs text-gray-500 font-mono">
          Last refresh: {lastRefresh}
        </span>
      )}
      {saveStatus && (
        <span className="text-xs font-medium text-gray-700">{saveStatus}</span>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="שמירת סנאפשוט להיסטוריה"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        {saving ? "שומר…" : "💾 שמירת Data"}
      </button>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {refreshing ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  );
}
