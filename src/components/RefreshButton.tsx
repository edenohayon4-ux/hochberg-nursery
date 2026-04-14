"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    try {
      // Hit the API route to force a fresh fetch from Google Sheets
      const res = await fetch("/api/data", { cache: "no-store" });
      if (!res.ok) throw new Error("Refresh failed");
      // Refresh the server component page
      router.refresh();
      setLastRefresh(new Date().toLocaleTimeString());
    } catch {
      alert("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {lastRefresh && (
        <span className="text-xs text-gray-400">Last refresh: {lastRefresh}</span>
      )}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
        {loading ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  );
}
