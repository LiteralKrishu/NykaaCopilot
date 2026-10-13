import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { MAKEUP_ZONES } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const zone = url.searchParams.get("zone");
  if (zone && !MAKEUP_ZONES.includes(zone as (typeof MAKEUP_ZONES)[number])) {
    return NextResponse.json({ error: "Unknown makeup zone." }, { status: 400 });
  }
  const products = catalog.filter((item) => (!zone || item.kind === zone) && (!query ||
    `${item.brand} ${item.name} ${item.category} ${item.finish} ${item.shades.map((shade) => shade.name).join(" ")}`.toLowerCase().includes(query)));
  return NextResponse.json({ products, total: products.length });
}
