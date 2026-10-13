export const MAKEUP_ZONES = [
  "lips", "eyeshadow", "eyeliner", "mascara", "brows",
  "blush", "contour", "highlighter", "foundation",
] as const;

export type MakeupZone = (typeof MAKEUP_ZONES)[number];

export type Shade = { id: string; name: string; hex: string; preview?: string };

export type Product = {
  id: string;
  brand: string;
  name: string;
  kind: MakeupZone;
  category: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviewsCount: string;
  finish: string;
  image: string;
  tag: string;
  shades: Shade[];
  details: string;
  productUrl?: string;
};

export type RegionAnalysis = {
  zone: MakeupZone;
  color: string | null;
  present: boolean;
  finish: string | null;
  confidence: "high" | "medium" | "low";
  note: string;
};

export type ProductMatch = {
  product: Product;
  shade: Shade;
  score: number;
  reason: string;
};

export type LookAnalysis = {
  model: string;
  imageWidth: number;
  imageHeight: number;
  regions: RegionAnalysis[];
  recommendations: Record<MakeupZone, ProductMatch[]>;
  note: string;
};

export type CartLine = { productId: string; shadeId: string; quantity: number };
