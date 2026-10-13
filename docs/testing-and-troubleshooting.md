# Testing and troubleshooting

## Automated checks

Run these commands from the repository root after installing dependencies:

```bash
npm run docs:check
npm run typecheck
npm test
npm run build
```

The documentation check verifies local Markdown links in the root README and `docs/`. The existing tests cover color conversion and CIEDE2000 distance; they do not measure face parsing or try-on realism. Type checking and the Next.js build check that the application compiles, but they do not exercise a real camera.

## Manual walkthrough

1. Start the app with `npm run dev` and open the address printed by Next.js.
2. Search for a product, choose a shade, add it to the bag, and reload. The bag should retain the line in the same browser session.
3. Open **From Look to Products**. Choose a bundled preset or upload a clear portrait. On a fresh machine, allow extra time for the face parser download.
4. Confirm the analysis shows nine makeup areas and only catalog shades within the configured color-distance thresholds. Areas with no close product should say so.
5. Move to try-on and upload a front-facing selfie. Check that the face is tracked, the strength and area controls change the image, and holding **Before** shows the original.
6. Save a snapshot, review it, and add the chosen product bundle to the bag. Reload to confirm that the bag persists while the snapshot does not.
7. If a camera is available, grant permission and separately check live tracking, Stop, and camera release. Camera mode needs a secure browser context such as `localhost` or HTTPS.

## Common problems

| Symptom | Likely cause and action |
| --- | --- |
| First analysis takes a long time or returns a model-loading error | The server is downloading the public face parser. Check its terminal output and internet access, then retry. Later requests reuse the Transformers.js cache. |
| Upload rejected before analysis | Use JPEG, PNG, or WebP below 8 MB. Decoded width and height must each be between 128 and 4096 pixels. |
| Analysis says no clear face | Try a single, front-facing, well-lit portrait with visible eyes and lips. The parser requires usable skin, eye, and lip samples. |
| Product area shows no match | The demo catalog may not contain that product kind, or all swatches exceed its color-distance cutoff. Brows, contour, and highlighter have no catalog products. |
| Selfie has no makeup | Wait for face tracking; use a clear front-facing selfie. No overlays are drawn without detected landmarks. |
| Camera fails to start | Grant browser camera access, check the camera is available, and use `localhost` or HTTPS. Browser or operating-system permission failures appear in the try-on status line. |
| Try-on feels slow | The browser runs MediaPipe and Canvas locally. Try a smaller selfie, close other heavy tabs, or use a device with a faster browser/GPU. The tracker falls back to CPU if GPU setup fails. |
| Bag is empty after changing browser or deleting site data | The bag is associated with an HTTP-only session cookie; its JSON data is stored only in this local app instance. |

## Current validation limits

The color-distance tests check math, not whether a sampled face color represents makeup or whether a suggested shade will look right in person. The try-on renderer has not been evaluated across skin tones, face shapes, lighting, devices, or occlusion. Catalog names and prices are demo data. See [Image analysis](image-analysis.md), [Recommendations](recommendations.md), and [Virtual try-on](virtual-try-on.md) for the underlying methods and limits.

## Maintaining the docs

When changing the API, catalog mapping, model, or try-on controls, update the relevant page and run `npm run docs:check`. Keep claims about measured accuracy and privacy tied to code or actual validation results. The [documentation index](README.md) lists every guide.
