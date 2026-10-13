import { NextResponse } from "next/server";
import { presets } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({ presets });
}
