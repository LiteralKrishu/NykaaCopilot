import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { findProduct } from "./catalog";
import type { CartLine } from "./types";

const filePath = path.join(process.cwd(), ".data", "carts.json");
type CartStore = Record<string, CartLine[]>;

async function readStore(): Promise<CartStore> {
  try { return JSON.parse(await readFile(filePath, "utf8")) as CartStore; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

export async function getCart(session: string): Promise<CartLine[]> {
  return (await readStore())[session] ?? [];
}

let writeQueue: Promise<unknown> = Promise.resolve();
export function setCart(session: string, lines: CartLine[]): Promise<CartLine[]> {
  const validated = lines.map((line) => {
    const product = findProduct(line.productId);
    if (!product || !product.shades.some((shade) => shade.id === line.shadeId)) throw new Error("Unknown product or shade.");
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) throw new Error("Quantity must be between 1 and 99.");
    return { productId: line.productId, shadeId: line.shadeId, quantity: line.quantity };
  });
  if (validated.length > 50) throw new Error("Cart can contain at most 50 lines.");
  const operation = writeQueue.catch(() => undefined).then(async () => {
    const store = await readStore();
    store[session] = validated;
    await mkdir(path.dirname(filePath), { recursive: true });
    const temp = `${filePath}.${crypto.randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(store), "utf8");
    await rename(temp, filePath);
    return validated;
  });
  writeQueue = operation;
  return operation;
}
