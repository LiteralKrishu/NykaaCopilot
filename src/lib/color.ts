export type Lab = { l: number; a: number; b: number };

export function parseHex(hex: string): [number, number, number] {
  const value = hex.replace(/^#/, "");
  if (!/^[\da-fA-F]{6}$/.test(value)) throw new Error(`Invalid hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function rgbToLab(r: number, g: number, b: number): Lab {
  const linear = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  const x = (0.4124564 * linear[0] + 0.3575761 * linear[1] + 0.1804375 * linear[2]) / 0.95047;
  const y = (0.2126729 * linear[0] + 0.7151522 * linear[1] + 0.0721750 * linear[2]);
  const z = (0.0193339 * linear[0] + 0.1191920 * linear[1] + 0.9503041 * linear[2]) / 1.08883;
  const f = (v: number) => v > 0.008856 ? Math.cbrt(v) : (7.787 * v + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function hexToLab(hex: string): Lab {
  return rgbToLab(...parseHex(hex));
}

// CIEDE2000 with kL = kC = kH = 1 (reference viewing conditions).
export function deltaE2000(left: Lab, right: Lab): number {
  const deg = 180 / Math.PI;
  const rad = Math.PI / 180;
  const c1 = Math.hypot(left.a, left.b), c2 = Math.hypot(right.a, right.b);
  const cBar = (c1 + c2) / 2;
  const g = 0.5 * (1 - Math.sqrt(cBar ** 7 / (cBar ** 7 + 25 ** 7)));
  const a1 = (1 + g) * left.a, a2 = (1 + g) * right.a;
  const cp1 = Math.hypot(a1, left.b), cp2 = Math.hypot(a2, right.b);
  const hue = (a: number, b: number) => ((Math.atan2(b, a) * deg) + 360) % 360;
  const h1 = hue(a1, left.b), h2 = hue(a2, right.b);
  const dL = right.l - left.l;
  const dC = cp2 - cp1;
  let dh = 0;
  if (cp1 * cp2 !== 0) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin((dh / 2) * rad);
  const lBar = (left.l + right.l) / 2;
  const cpBar = (cp1 + cp2) / 2;
  let hBar = h1 + h2;
  if (cp1 * cp2 === 0) hBar = h1 + h2;
  else if (Math.abs(h1 - h2) <= 180) hBar = (h1 + h2) / 2;
  else if (h1 + h2 < 360) hBar = (h1 + h2 + 360) / 2;
  else hBar = (h1 + h2 - 360) / 2;
  const t = 1 - 0.17 * Math.cos((hBar - 30) * rad)
    + 0.24 * Math.cos((2 * hBar) * rad)
    + 0.32 * Math.cos((3 * hBar + 6) * rad)
    - 0.20 * Math.cos((4 * hBar - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hBar - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(cpBar ** 7 / (cpBar ** 7 + 25 ** 7));
  const sl = 1 + 0.015 * (lBar - 50) ** 2 / Math.sqrt(20 + (lBar - 50) ** 2);
  const sc = 1 + 0.045 * cpBar;
  const sh = 1 + 0.015 * cpBar * t;
  const rt = -Math.sin(2 * dTheta * rad) * rc;
  const lTerm = dL / sl, cTerm = dC / sc, hTerm = dH / sh;
  return Math.sqrt(lTerm ** 2 + cTerm ** 2 + hTerm ** 2 + rt * cTerm * hTerm);
}
