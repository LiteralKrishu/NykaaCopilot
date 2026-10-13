import { findProduct } from "./catalog";
import type { CartLine } from "./types";

export function validateCart(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) throw new Error("Expected a lines array.");
  if (lines.length > 50) throw new Error("Cart can contain at most 50 lines.");
  return lines.map((line) => {
    if (!line || typeof line !== "object") throw new Error("Invalid cart line.");
    const { productId, shadeId, quantity } = line as Partial<CartLine>;
    if (typeof productId !== "string" || typeof shadeId !== "string") throw new Error("Unknown product or shade.");
    const product = findProduct(productId);
    if (!product || !product.shades.some((shade) => shade.id === shadeId)) throw new Error("Unknown product or shade.");
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Quantity must be between 1 and 99.");
    }
    return { productId, shadeId, quantity };
  });
}

export function readCartCookie(value?: string): CartLine[] {
  if (!value || value.length > 3800) return [];
  try {
    const compact = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    if (!Array.isArray(compact)) return [];
    return validateCart(compact.map((line) => Array.isArray(line)
      ? { productId: line[0], shadeId: line[1], quantity: line[2] }
      : null));
  } catch {
    return [];
  }
}

export function encodeCartCookie(lines: CartLine[]): string {
  const value = Buffer.from(JSON.stringify(lines.map(({ productId, shadeId, quantity }) =>
    [productId, shadeId, quantity]))).toString("base64url");
  if (value.length > 3800) throw new Error("Cart has too many items to save.");
  return value;
}
