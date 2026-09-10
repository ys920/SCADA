import { NextResponse } from "next/server";
import { historianStatus } from "@/lib/historian";

export const runtime = "nodejs";

export async function GET() {
  const status = await historianStatus();
  return NextResponse.json(status, { status: status.ok ? 200 : 503 });
}
