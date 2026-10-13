import assert from "node:assert/strict";
import test from "node:test";
import { deltaE2000, rgbToHex, rgbToLab } from "../src/lib/color.ts";

test("CIEDE2000 agrees with a published reference pair", () => {
  const left = { l: 50, a: 2.6772, b: -79.7751 };
  const right = { l: 50, a: 0, b: -82.7485 };
  assert.ok(Math.abs(deltaE2000(left, right) - 2.0425) < 0.0001);
});

test("identical colors have zero distance and RGB conversion is stable", () => {
  const rose = rgbToLab(184, 91, 108);
  assert.equal(deltaE2000(rose, rose), 0);
  assert.equal(rgbToHex(184, 91, 108), "#B85B6C");
});
