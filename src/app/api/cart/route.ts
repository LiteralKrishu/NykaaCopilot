import { NextRequest, NextResponse } from "next/server";
import { getCart, setCart } from "@/lib/cart";
import type { CartLine } from "@/lib/types";

export const runtime = "nodejs";
const cookieName = "nykaa_demo_session";

function sessionFor(request: NextRequest) {
  const existing = request.cookies.get(cookieName)?.value;
  return existing && /^[a-f0-9-]{36}$/i.test(existing) ? existing : crypto.randomUUID();
}

function respond(lines: CartLine[], session: string) {
  const response = NextResponse.json({ lines });
  response.cookies.set(cookieName, session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}

export async function GET(request: NextRequest) {
  const session = sessionFor(request);
  return respond(await getCart(session), session);
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !Array.isArray((body as { lines?: unknown }).lines)) {
    return NextResponse.json({ error: "Expected a lines array." }, { status: 400 });
  }
  try {
    const session = sessionFor(request);
    const lines = await setCart(session, (body as { lines: CartLine[] }).lines);
    return respond(lines, session);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save cart." }, { status: 400 });
  }
}
