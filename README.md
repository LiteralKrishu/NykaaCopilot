# Nykaa Look Copilot

A local full-stack Next.js demo for **complete makeup looks**. It turns an inspiration portrait into a color map, ranks shades in the sample catalog, and previews makeup on a live camera or uploaded selfie.

For a full walkthrough of the app, its data flow, endpoints, model behavior, try-on, and limitations, see the [project documentation](docs/README.md).

## Run

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The dev and production build commands prepare a pinned copy of the `jonathandinu/face-parsing` quantized ONNX model (about 85 MB) before starting Next.js. The first preparation needs internet access; later runs reuse the local copy. The MediaPipe face landmark model and WASM files are bundled in `public/` so the try-on does not need a third-party asset request. Camera mode requires browser camera permission; selfie mode does not.

## What works

- React storefront with search, category filters, shade selection, responsive layout, and a local demo bag.
- `POST /api/analyze`: accepts JPEG, PNG, or WebP up to 8 MB; segments facial parts using an open Hugging Face model; samples visible region colors; returns estimates for lips, eyeshadow, eyeliner, mascara, brows, blush, contour, highlighter, and foundation. It rejects images without a clear face.
- Shade ranking uses CIEDE2000 color distance and returns close catalog swatches by makeup category. Distant shades are withheld.
- `GET /api/products`, `GET /api/presets`, and `GET`/`PUT /api/cart` serve the storefront. The demo bag is saved in an HTTP-only cookie in the user's browser.

## Vercel deployment

Use `npm run build` as the Vercel Build Command. It downloads and verifies the pinned face model during the build, then packages it with the Linux ONNX runtime files in the analysis function. The function loads model files locally and does not download them when a visitor requests analysis. Build-time access to Hugging Face is required. Vercel limits function request bodies to 4.5 MB; the browser resizes images above 4 MB before uploading. The demo bag is stored in a browser cookie and does not require writable server storage.
- Try-on uses MediaPipe face landmarks for a live camera or selfie. It draws separate layers for lips, eyelids, liner, lashes, brows, blush, contour, highlight, and base; each layer can be toggled. Snapshots can be reviewed before adding the matched bundle to the bag.

## Important limits

This is a project demo, not a validated beauty advisor. Face parsing locates facial parts; it **does not identify cosmetics or prove that makeup is present**. Eyeliner, mascara, blush, contour, and highlighter estimates use simple color and face-position rules. Lighting, pose, filters, and skin tone affect colors. The original 12-item catalog uses approximate shade swatches, has no brow, contour, or highlighter products, and has no live price, availability, or checkout connection. Missing categories are shown as missing rather than inventing products. The original catalog copy and product photos have not been independently verified.

Model output can vary by image, and virtual overlays are visual approximations of placement and color. Try-on has not been validated across devices, face shapes, or skin tones. The model may be subject to research/noncommercial conditions; check its model card before public or commercial use.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

The original static prototype is preserved in `legacy/` for reference. Its hardcoded analysis results are not used by the new app.
