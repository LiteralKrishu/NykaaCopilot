import { NextRequest, NextResponse } from "next/server";
import { encodeCartCookie, readCartCookie, validateCart } from "@/lib/cart";
import type { CartLine } from "@/lib/types";

export const runtime = "nodejs";
const cookieName = "nykaa_demo_cart";

function respond(lines: CartLine[]) {
  const response = NextResponse.json({ lines });
  response.cookies.set(cookieName, encodeCartCookie(lines), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}

export async function GET(request: NextRequest) {
  return respond(readCartCookie(request.cookies.get(cookieName)?.value));
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  try {
    const lines = validateCart(body && typeof body === "object" ? (body as { lines?: unknown }).lines : undefined);
    return respond(lines);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save cart." }, { status: 400 });
  }
}
