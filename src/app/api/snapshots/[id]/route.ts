import { NextResponse } from "next/server";
import { deleteSnapshot, getSnapshot } from "@/lib/storage";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

// GET /api/snapshots/[id] — fetch full snapshot with data.
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const snapshot = await getSnapshot(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/snapshots/[id] — remove a single snapshot and its insight.
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteSnapshot(id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
