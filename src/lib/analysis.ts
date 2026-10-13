import { env, RawImage, pipeline, type ImageSegmentationPipeline } from "@huggingface/transformers";
import path from "node:path";
import { rgbToHex } from "./color";
import { recommendationsFor } from "./matching";
import { type LookAnalysis, type MakeupZone, type RegionAnalysis } from "./types";

const MODEL_ID = "jonathandinu/face-parsing";
env.localModelPath = path.join(process.cwd(), ".models");
env.allowRemoteModels = false;
env.useFSCache = false;
type Segmentation = { label: string; mask: RawImage; score?: number };
let segmenterPromise: Promise<ImageSegmentationPipeline> | null = null;

async function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = pipeline("image-segmentation", MODEL_ID, { dtype: "q8" }).catch((error) => {
      segmenterPromise = null;
      throw error;
    });
  }
  return segmenterPromise;
}

type Box = { minX: number; minY: number; maxX: number; maxY: number };
type Sample = { color: string; rgb: [number, number, number]; box: Box; count: number };

function samplePixels(image: RawImage, predicate: (x: number, y: number) => boolean): Sample | null {
  const values: number[][] = [[], [], []];
  const box: Box = { minX: image.width, minY: image.height, maxX: 0, maxY: 0 };
  const stride = Math.max(1, Math.floor(Math.min(image.width, image.height) / 256));
  for (let y = 0; y < image.height; y += stride) {
    for (let x = 0; x < image.width; x += stride) {
      if (!predicate(x, y)) continue;
      const i = (y * image.width + x) * image.channels;
      for (let channel = 0; channel < 3; channel++) values[channel].push(image.data[i + channel]);
      box.minX = Math.min(box.minX, x); box.maxX = Math.max(box.maxX, x);
      box.minY = Math.min(box.minY, y); box.maxY = Math.max(box.maxY, y);
    }
  }
  if (values[0].length < 12) return null;
  // Trim shadows and specular highlights before estimating a visible shade.
  const rgb = values.map((channel) => {
    channel.sort((a, b) => a - b);
    return channel[Math.floor(channel.length / 2)];
  }) as [number, number, number];
  return { color: rgbToHex(...rgb), rgb, box, count: values[0].length };
}

function region(zone: MakeupZone, sample: Sample | null, note: string, confidence: RegionAnalysis["confidence"]): RegionAnalysis {
  return { zone, color: sample?.color ?? null, present: Boolean(sample), finish: null, confidence: sample ? confidence : "low", note: sample ? note : "The facial area could not be measured in this image." };
}

function brightness(rgb: [number, number, number]) { return (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722); }

export async function analyzeImage(bytes: Uint8Array, mime: string): Promise<LookAnalysis> {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const image = await RawImage.fromBlob(blob);
  if (image.width < 128 || image.height < 128) throw new Error("Image must be at least 128 × 128 pixels.");
  if (image.width > 4096 || image.height > 4096) throw new Error("Image must be at most 4096 × 4096 pixels.");
  const scale = Math.min(1, 768 / Math.max(image.width, image.height));
  if (scale < 1) await image.resize(Math.round(image.width * scale), Math.round(image.height * scale));
  image.rgb();
  const segmenter = await getSegmenter();
  // Transformers.js selects and binds the model processor's semantic postprocessor here.
  const output = await segmenter(image) as Segmentation[];
  const masks = new Map(output.map((item) => [item.label.toLowerCase().replace(/[- ]/g, "_"), item.mask]));
  const selected = (labels: string[]) => (x: number, y: number) => labels.some((label) => {
    const mask = masks.get(label);
    if (!mask) return false;
    const mx = Math.min(mask.width - 1, Math.floor(x * mask.width / image.width));
    const my = Math.min(mask.height - 1, Math.floor(y * mask.height / image.height));
    return mask.data[(my * mask.width + mx) * mask.channels] > 127;
  });
  const lip = samplePixels(image, selected(["u_lip", "l_lip", "upper_lip", "lower_lip", "mouth"]));
  const skin = samplePixels(image, selected(["skin"]));
  const eyes = samplePixels(image, selected(["l_eye", "r_eye", "left_eye", "right_eye"]));
  const brows = samplePixels(image, selected(["l_brow", "r_brow", "left_eyebrow", "right_eyebrow"]));
  if (!skin || !eyes || !lip) throw new Error("A clear, front-facing face with visible eyes and lips was not found.");
  const face = skin.box;
  const fw = face.maxX - face.minX, fh = face.maxY - face.minY;
  const upper = samplePixels(image, (x, y) => selected(["skin"])(x, y) && y >= eyes.box.minY - fh * .14 && y <= eyes.box.minY + fh * .02 && x >= eyes.box.minX && x <= eyes.box.maxX);
  const centerX = (face.minX + face.maxX) / 2;
  const cheek = samplePixels(image, (x, y) => selected(["skin"])(x, y) && y > eyes.box.maxY + fh * .07 && y < lip.box.minY - fh * .04 && Math.abs(x - centerX) > fw * .13 && Math.abs(x - centerX) < fw * .43);
  const lower = samplePixels(image, (x, y) => selected(["skin"])(x, y) && y > eyes.box.maxY + fh * .18 && y < lip.box.minY && Math.abs(x - centerX) > fw * .28);
  const upperCheek = samplePixels(image, (x, y) => selected(["skin"])(x, y) && y > eyes.box.maxY + fh * .01 && y < eyes.box.maxY + fh * .12 && Math.abs(x - centerX) > fw * .17);
  const liner = samplePixels(image, (x, y) => selected(["skin", "l_eye", "r_eye"])(x, y) && y >= eyes.box.minY && y <= eyes.box.maxY + fh * .03 && brightness([image.data[(y * image.width + x) * 3], image.data[(y * image.width + x) * 3 + 1], image.data[(y * image.width + x) * 3 + 2]]) < brightness(skin.rgb) * .48);
  const regions: RegionAnalysis[] = [
    region("lips", lip, "Measured visible lip color; the model does not distinguish lipstick from natural lips.", "high"),
    region("eyeshadow", upper, "Sampled the upper eyelid area; this may include natural skin.", "low"),
    region("eyeliner", liner, "Sampled dark pixels near the eyes; lashes and shadows can affect this estimate.", "low"),
    region("mascara", liner, "Dark eye pixels are a rough proxy for lash color, not a mascara detector.", "low"),
    region("brows", brows, "Measured visible brow color.", "medium"),
    region("blush", cheek, "Sampled the cheek area; presence of blush is not verified.", "low"),
    region("contour", lower, "Sampled the outer lower cheek; presence of contour is not verified.", "low"),
    region("highlighter", upperCheek, "Sampled the upper cheek; shimmer and finish are not verified.", "low"),
    region("foundation", skin, "Measured visible skin tone; foundation use and shade fit are not verified.", "medium"),
  ];
  return {
    model: MODEL_ID, imageWidth: image.width, imageHeight: image.height,
    regions,
    recommendations: recommendationsFor(regions),
    note: "Face parsing locates facial parts. Color estimates come from the uploaded pixels and change with lighting. Cosmetic presence, finish, undertone, and product identity are not classified.",
  };
}
