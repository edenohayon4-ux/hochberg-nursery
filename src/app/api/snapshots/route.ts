import { NextResponse } from "next/server";
import { fetchNurseryData } from "@/lib/sheets";
import { listSnapshots, saveSnapshot } from "@/lib/storage";

export const dynamic = "force-dynamic";

// GET /api/snapshots — list all snapshot metadata, newest first.
export async function GET() {
  try {
    const snapshots = await listSnapshots();
    return NextResponse.json({ snapshots });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/snapshots — capture the CURRENT live nursery data as a snapshot.
export async function POST() {
  try {
    const data = await fetchNurseryData();
    const id = await saveSnapshot(data);
    return NextResponse.json({ id, ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
