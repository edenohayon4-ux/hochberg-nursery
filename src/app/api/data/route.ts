import { NextResponse } from "next/server";
import { fetchNurseryData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchNurseryData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data from Google Sheets" },
      { status: 500 }
    );
  }
}
