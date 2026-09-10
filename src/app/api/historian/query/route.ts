import { NextResponse } from "next/server";
import { querySamples } from "@/lib/historian";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get("tagId") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "100");
  const result = await querySamples({ tagId, limit });
  if (!result.ok) {
    return NextResponse.json(result, { status: 503 });
  }
  return NextResponse.json(result);
}
