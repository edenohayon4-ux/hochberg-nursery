// ============================================================
// Storage layer — Vercel Blob backed
// ============================================================
// Snapshots & insights are stored as JSON files in Vercel Blob.
// Layout:
//   snapshots/{id}.json    — full Snapshot object
//   insights/{id}.json     — Insight tied to that snapshot
// We list snapshots by scanning the `snapshots/` prefix.
// Requires env var:
//   BLOB_READ_WRITE_TOKEN  (auto-set when blob store linked to project)
// ============================================================

import { put, list, del } from "@vercel/blob";
import { NurseryData } from "@/types";

// ---------- Types ----------
export interface SnapshotMeta {
  id: string;
  savedAt: string;
  totalRevenue: number;
  totalNetProfit: number;
  overallProfitMargin: number;
  hasInsight: boolean;
}

export interface Snapshot extends SnapshotMeta {
  data: NurseryData;
}

export interface Insight {
  snapshotId: string;
  generatedAt: string;
  summary: string;
  recommendations: string[];
  insights: string[];
  warnings: string[];
}

// ---------- Path helpers ----------
const snapshotPath = (id: string) => `snapshots/${id}.json`;
const insightPath = (id: string) => `insights/${id}.json`;

// ---------- ID generation ----------
function newId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function pickMeta(snapshot: Snapshot, hasInsight: boolean): SnapshotMeta {
  return {
    id: snapshot.id,
    savedAt: snapshot.savedAt,
    totalRevenue: snapshot.totalRevenue,
    totalNetProfit: snapshot.totalNetProfit,
    overallProfitMargin: snapshot.overallProfitMargin,
    hasInsight,
  };
}

// Fetch a blob's JSON content via its public URL.
async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

// ---------- Public API ----------

/** Save a new snapshot of the current nursery data. Returns its ID. */
export async function saveSnapshot(data: NurseryData): Promise<string> {
  const id = newId();
  const savedAt = new Date().toISOString();
  const snapshot: Snapshot = {
    id,
    savedAt,
    totalRevenue: data.totals.totalRevenue,
    totalNetProfit: data.totals.totalNetProfit,
    overallProfitMargin: data.totals.overallProfitMargin,
    hasInsight: false,
    data,
  };
  await put(snapshotPath(id), JSON.stringify(snapshot), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return id;
}

/** List all snapshots, newest first. */
export async function listSnapshots(): Promise<SnapshotMeta[]> {
  // Get all snapshot blobs and all insight blobs in parallel
  const [snapsList, insightsList] = await Promise.all([
    list({ prefix: "snapshots/", limit: 1000 }),
    list({ prefix: "insights/", limit: 1000 }),
  ]);

  // Build a set of snapshot IDs that have insights
  const insightIds = new Set<string>();
  for (const b of insightsList.blobs) {
    const match = b.pathname.match(/^insights\/(.+)\.json$/);
    if (match) insightIds.add(match[1]);
  }

  // Download all snapshots (metadata only) in parallel
  const snapshots = await Promise.all(
    snapsList.blobs.map((b) => fetchJson<Snapshot>(b.url))
  );

  return snapshots
    .filter((s): s is Snapshot => s !== null)
    .map((s) => pickMeta(s, insightIds.has(s.id)))
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)); // newest first
}

/** Get a single snapshot by ID. */
export async function getSnapshot(id: string): Promise<Snapshot | null> {
  // We need the public URL — list and find it
  const { blobs } = await list({ prefix: snapshotPath(id), limit: 1 });
  const blob = blobs[0];
  if (!blob) return null;
  return await fetchJson<Snapshot>(blob.url);
}

/** Delete a snapshot AND its insight if it exists. */
export async function deleteSnapshot(id: string): Promise<void> {
  const [snapList, insList] = await Promise.all([
    list({ prefix: snapshotPath(id), limit: 1 }),
    list({ prefix: insightPath(id), limit: 1 }),
  ]);
  const urls: string[] = [];
  if (snapList.blobs[0]) urls.push(snapList.blobs[0].url);
  if (insList.blobs[0]) urls.push(insList.blobs[0].url);
  if (urls.length) await del(urls);
}

/** Save an AI insight tied to a specific snapshot. */
export async function saveInsight(snapshotId: string, insight: Insight): Promise<void> {
  await put(insightPath(snapshotId), JSON.stringify(insight), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Get the insight for a specific snapshot, if it exists. */
export async function getInsight(snapshotId: string): Promise<Insight | null> {
  const { blobs } = await list({ prefix: insightPath(snapshotId), limit: 1 });
  const blob = blobs[0];
  if (!blob) return null;
  return await fetchJson<Insight>(blob.url);
}
