// ============================================================
// Storage layer for snapshots and AI insights
// ============================================================
// Uses Vercel KV (Upstash Redis) under the hood. Requires the
// following env vars (auto-populated by Vercel when KV is linked):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
//   KV_REST_API_READ_ONLY_TOKEN
// ============================================================

import { kv } from "@vercel/kv";
import { NurseryData } from "@/types";

// ---------- Types ----------
export interface SnapshotMeta {
  id: string;
  savedAt: string;       // ISO timestamp
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

// ---------- Keys ----------
const KEY_LIST = "snapshots:list";              // sorted set: id → savedAt epoch
const KEY_SNAPSHOT = (id: string) => `snapshot:${id}`;
const KEY_INSIGHT = (id: string) => `insight:${id}`;

// ---------- Helpers ----------
function newId(): string {
  // 32-char ID: timestamp + random suffix
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function pickMeta(snapshot: Snapshot): SnapshotMeta {
  return {
    id: snapshot.id,
    savedAt: snapshot.savedAt,
    totalRevenue: snapshot.totalRevenue,
    totalNetProfit: snapshot.totalNetProfit,
    overallProfitMargin: snapshot.overallProfitMargin,
    hasInsight: snapshot.hasInsight,
  };
}

// ---------- Public API ----------

/** Save a full snapshot of the current nursery data. Returns the new ID. */
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
  // Store the full snapshot
  await kv.set(KEY_SNAPSHOT(id), snapshot);
  // Add to sorted index (score = epoch ms, so newest sort first when reversed)
  await kv.zadd(KEY_LIST, { score: Date.now(), member: id });
  return id;
}

/** List all snapshot metadata (without full data), newest first. */
export async function listSnapshots(): Promise<SnapshotMeta[]> {
  // Fetch in reverse score order (newest first)
  const ids = (await kv.zrange(KEY_LIST, 0, -1, { rev: true })) as string[];
  if (!ids.length) return [];
  // Fetch each snapshot's metadata (we store the full object but only return meta)
  const snapshots = await Promise.all(
    ids.map((id) => kv.get<Snapshot>(KEY_SNAPSHOT(id)))
  );
  // Also check which have insights
  const insightKeys = await Promise.all(
    ids.map((id) => kv.exists(KEY_INSIGHT(id)))
  );
  return snapshots
    .map((s, i) => (s ? { ...pickMeta(s), hasInsight: insightKeys[i] === 1 } : null))
    .filter((s): s is SnapshotMeta => s !== null);
}

/** Get a single snapshot by ID, including full data. */
export async function getSnapshot(id: string): Promise<Snapshot | null> {
  return (await kv.get<Snapshot>(KEY_SNAPSHOT(id))) ?? null;
}

/** Delete a single snapshot AND its insight if exists. */
export async function deleteSnapshot(id: string): Promise<void> {
  await Promise.all([
    kv.del(KEY_SNAPSHOT(id)),
    kv.del(KEY_INSIGHT(id)),
    kv.zrem(KEY_LIST, id),
  ]);
}

/** Save an AI-generated insight for a snapshot. */
export async function saveInsight(snapshotId: string, insight: Insight): Promise<void> {
  await kv.set(KEY_INSIGHT(snapshotId), insight);
}

/** Get the insight for a specific snapshot, if it exists. */
export async function getInsight(snapshotId: string): Promise<Insight | null> {
  return (await kv.get<Insight>(KEY_INSIGHT(snapshotId))) ?? null;
}
