import { deltaE2000, hexToLab } from "./color";
import { catalog } from "./catalog";
import { MAKEUP_ZONES, type LookAnalysis, type MakeupZone, type ProductMatch, type RegionAnalysis } from "./types";

export function matchProducts(region: RegionAnalysis): ProductMatch[] {
  if (!region.present || !region.color) return [];
  const target = hexToLab(region.color);
  const maxDistance = region.zone === "foundation" ? 8 : 15;
  return catalog
    .filter((product) => product.kind === region.zone)
    .flatMap((product) => product.shades.map((shade) => {
      const distance = deltaE2000(target, hexToLab(shade.hex));
      return {
        product,
        shade,
        score: Math.round(distance * 10) / 10,
        reason: `ΔE00 ${distance.toFixed(1)} from the sampled ${region.zone} color. Shade swatches are catalog estimates.`,
      };
    }))
    .filter((match) => match.score <= maxDistance)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}

export function recommendationsFor(regions: RegionAnalysis[]): LookAnalysis["recommendations"] {
  return Object.fromEntries(MAKEUP_ZONES.map((zone: MakeupZone) => [zone, matchProducts(regions.find((r) => r.zone === zone) ?? {
    zone, color: null, present: false, finish: null, confidence: "low", note: "No region was measured.",
  })])) as LookAnalysis["recommendations"];
}
