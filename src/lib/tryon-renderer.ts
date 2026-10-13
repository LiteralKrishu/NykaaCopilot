import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { MakeupZone } from "./types";

export type Finish = "natural" | "glow" | "soft-matte";
type Colors = Partial<Record<MakeupZone, string>>;
type Point = readonly [number, number];

// Ordered contours from MediaPipe's Face Mesh connections.
const FACE = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
const OUTER_LIPS = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
const INNER_LIPS = [78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95];
const RIGHT_EYE = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7];
const LEFT_EYE = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249];
const RIGHT_BROW = [70,63,105,66,107,55,65,52,53,46];
const LEFT_BROW = [300,293,334,296,336,285,295,282,283,276];
const RIGHT_LASH = [33,246,161,160,159,158,157,173,133];
const LEFT_LASH = [263,466,388,387,386,385,384,398,362];
const scratchLayers = new WeakMap<CanvasRenderingContext2D, { mask: HTMLCanvasElement; tint: HTMLCanvasElement }>();

function scratch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  let layers = scratchLayers.get(ctx);
  if (!layers) {
    layers = { mask: document.createElement("canvas"), tint: document.createElement("canvas") };
    scratchLayers.set(ctx, layers);
  }
  if (layers.mask.width !== w || layers.mask.height !== h) {
    layers.mask.width = layers.tint.width = w;
    layers.mask.height = layers.tint.height = h;
  }
  return layers;
}

function path(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], indices: number[], w: number, h: number) {
  indices.forEach((index, i) => {
    const p = landmarks[index];
    if (i === 0) ctx.moveTo(p.x * w, p.y * h);
    else ctx.lineTo(p.x * w, p.y * h);
  });
  ctx.closePath();
}

function maskLayer(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  contours: number[][],
  color: string,
  alpha: number,
  blend: GlobalCompositeOperation,
  feather: number,
  w: number,
  h: number,
) {
  const { mask, tint } = scratch(ctx, w, h);
  const m = mask.getContext("2d")!;
  const t = tint.getContext("2d")!;
  m.clearRect(0, 0, w, h);
  t.globalCompositeOperation = "source-over";
  t.clearRect(0, 0, w, h);
  m.fillStyle = "#fff";
  m.beginPath();
  for (const contour of contours) path(m, landmarks, contour, w, h);
  m.fill("evenodd");
  t.filter = `blur(${feather}px)`;
  t.drawImage(mask, 0, 0);
  t.filter = "none";
  t.globalCompositeOperation = "source-in";
  t.fillStyle = color;
  t.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.globalAlpha = alpha;
  ctx.drawImage(tint, 0, 0);
  ctx.restore();
}

function spot(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rotation: number, color: string, alpha: number, blend: GlobalCompositeOperation) {
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(Math.max(1, rx), Math.max(1, ry));
  const gradient = ctx.createRadialGradient(0, 0, 0.05, 0, 0, 1);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.42, color);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function eyeShadow(ctx: CanvasRenderingContext2D, get: (i: number) => Point, eye: [number, number], brow: number[], color: string, strength: number, width: number) {
  const a = get(eye[0]);
  const b = get(eye[1]);
  const midX = (a[0] + b[0]) / 2;
  const midY = (a[1] + b[1]) / 2;
  const browY = brow.reduce((sum, index) => sum + get(index)[1], 0) / brow.length;
  const gap = Math.max(width * .12, midY - browY);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  spot(ctx, midX, midY - gap * .38, width * .58, gap * .82, angle, color, strength * .65, "soft-light");
  spot(ctx, midX, midY - gap * .27, width * .48, gap * .62, angle, color, strength * .16, "color");
}

function lashLine(ctx: CanvasRenderingContext2D, get: (i: number) => Point, indices: number[], color: string, strength: number, eyeWidth: number) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const pts = indices.map(get);
  for (let i = 0; i < pts.length - 1; i++) {
    const thickness = Math.max(1, eyeWidth * (.012 + .018 * Math.sin((i + .5) / (pts.length - 1) * Math.PI)));
    ctx.globalAlpha = strength * .9;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(...pts[i]);
    ctx.quadraticCurveTo((pts[i][0] + pts[i + 1][0]) / 2, Math.min(pts[i][1], pts[i + 1][1]) - eyeWidth * .008, ...pts[i + 1]);
    ctx.stroke();
  }
  ctx.restore();
}

function lashes(ctx: CanvasRenderingContext2D, get: (i: number) => Point, indices: number[], color: string, strength: number, eyeWidth: number) {
  const pts = indices.map(get);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(.7, eyeWidth * .011);
  ctx.lineCap = "round";
  ctx.globalAlpha = strength * .72;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const outer = i < pts.length / 2 ? -1 : 1;
    const length = eyeWidth * (.045 + .018 * Math.sin(i * 2.2));
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    ctx.quadraticCurveTo(p[0] + outer * length * .3, p[1] - length * .75, p[0] + outer * length * .62, p[1] - length);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderTryOn(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  landmarks: NormalizedLandmark[] | null,
  colors: Colors,
  intensity: number,
  finish: Finish,
  showBefore: boolean,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  if (!landmarks || showBefore || intensity <= 0) return;
  const get = (i: number): Point => [landmarks[i].x * w, landmarks[i].y * h];
  const eyeWidth = Math.hypot(...sub(get(33), get(133)));
  const strength = intensity * (finish === "natural" ? .82 : 1);
  const blur = Math.max(1, eyeWidth * .018);

  if (colors.foundation) {
    maskLayer(ctx, landmarks, [FACE, RIGHT_EYE, LEFT_EYE, OUTER_LIPS, RIGHT_BROW, LEFT_BROW], colors.foundation, strength * .18, "color", blur * 3, w, h);
  }
  if (colors.contour) {
    for (const [outer, inner] of [[234, 205], [454, 425]]) {
      const a = get(outer), b = get(inner);
      spot(ctx, a[0] * .38 + b[0] * .62, a[1] * .38 + b[1] * .62 + eyeWidth * .28, eyeWidth * .78, eyeWidth * .34, Math.atan2(b[1] - a[1], b[0] - a[0]), colors.contour, strength * .48, "multiply");
    }
  }
  if (colors.blush) {
    for (const [outer, inner] of [[234, 205], [454, 425]]) {
      const a = get(outer), b = get(inner);
      spot(ctx, a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75 - eyeWidth * .2, eyeWidth * .72, eyeWidth * .4, Math.atan2(b[1] - a[1], b[0] - a[0]), colors.blush, strength * .68, "soft-light");
    }
  }
  if (colors.highlighter && finish !== "soft-matte") {
    for (const i of [116, 345]) { const [x, y] = get(i); spot(ctx, x, y - eyeWidth * .12, eyeWidth * .5, eyeWidth * .2, -.14, colors.highlighter, strength * (finish === "glow" ? .42 : .24), "screen"); }
    const bridge = get(6);
    spot(ctx, bridge[0], bridge[1] + eyeWidth * .38, eyeWidth * .14, eyeWidth * .48, 0, colors.highlighter, strength * (finish === "glow" ? .2 : .09), "screen");
  }
  if (colors.eyeshadow) {
    eyeShadow(ctx, get, [33, 133], RIGHT_BROW, colors.eyeshadow, strength, eyeWidth);
    eyeShadow(ctx, get, [263, 362], LEFT_BROW, colors.eyeshadow, strength, eyeWidth);
  }
  if (colors.brows) {
    maskLayer(ctx, landmarks, [RIGHT_BROW], colors.brows, strength * .32, "multiply", blur, w, h);
    maskLayer(ctx, landmarks, [LEFT_BROW], colors.brows, strength * .32, "multiply", blur, w, h);
  }
  if (colors.eyeliner) {
    lashLine(ctx, get, RIGHT_LASH, colors.eyeliner, strength, eyeWidth);
    lashLine(ctx, get, LEFT_LASH, colors.eyeliner, strength, eyeWidth);
  }
  if (colors.mascara) {
    lashes(ctx, get, RIGHT_LASH, colors.mascara, strength, eyeWidth);
    lashes(ctx, get, LEFT_LASH, colors.mascara, strength, eyeWidth);
  }
  if (colors.lips) {
    const lipContours = [OUTER_LIPS, INNER_LIPS];
    maskLayer(ctx, landmarks, lipContours, colors.lips, strength * .7, "color", blur * .65, w, h);
    maskLayer(ctx, landmarks, lipContours, colors.lips, strength * (finish === "soft-matte" ? .32 : .2), "soft-light", blur * .65, w, h);
    if (finish === "glow") {
      const a = get(87), b = get(317);
      spot(ctx, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, eyeWidth * .37, eyeWidth * .075, 0, "#ffffff", strength * .18, "screen");
    }
  }
}

function sub(a: Point, b: Point): [number, number] { return [a[0] - b[0], a[1] - b[1]]; }
