import { NextResponse } from "next/server";
import { ingestSamples, type HistorianSampleInput } from "@/lib/historian";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { samples?: HistorianSampleInput[] };
    const samples = Array.isArray(body.samples) ? body.samples : [];
    if (samples.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "Too many samples (max 2000)" },
        { status: 400 },
      );
    }
    const result = await ingestSamples(samples);
    if (!result.ok) {
      return NextResponse.json(result, { status: 503 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ingest failed",
      },
      { status: 500 },
    );
  }
}
