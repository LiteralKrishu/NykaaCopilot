import rawCatalog from "../../data/catalog.json";
import rawPresets from "../../data/presets.json";
import type { MakeupZone, Product } from "./types";

export type Preset = { id: string; title: string; subtitle: string; image: string; tags: string[] };

function productKind(product: (typeof rawCatalog)[number]): MakeupZone {
  if (product.category === "Lipstick") return "lips";
  if (product.category === "Blush") return "blush";
  if (product.category === "Face") return "foundation";
  if (/mascara/i.test(product.name)) return "mascara";
  if (/kajal|liner/i.test(product.name)) return "eyeliner";
  return "eyeshadow";
}

export const catalog: Product[] = rawCatalog.map((item) => ({
  ...item,
  kind: productKind(item),
  image: `/${item.image}`,
}));

export const presets: Preset[] = rawPresets.map(({ id, title, subtitle, image, tags }) => ({
  id, title, subtitle, image: `/${image}`, tags,
}));

export function findProduct(id: string): Product | undefined {
  return catalog.find((product) => product.id === id);
}
