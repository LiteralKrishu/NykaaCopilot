import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/analysis";

export const runtime = "nodejs";
export const maxDuration = 120;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  let image: FormDataEntryValue | null;
  try { image = (await request.formData()).get("image"); }
  catch { return NextResponse.json({ error: "Send an image using multipart form data." }, { status: 400 }); }
  if (!(image instanceof File)) return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 415 });
  }
  if (image.size === 0 || image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be between 1 byte and 8 MB." }, { status: 413 });
  }
  try {
    const result = await analyzeImage(new Uint8Array(await image.arrayBuffer()), image.type);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image analysis failed.";
    const isImageIssue = /Image must|face|visible eyes/i.test(message);
    console.error("Image analysis failed:", error);
    return NextResponse.json({ error: isImageIssue ? message : "The face model could not load or analyze this image. Check the server log and model download connection." }, { status: isImageIssue ? 422 : 503 });
  }
}
