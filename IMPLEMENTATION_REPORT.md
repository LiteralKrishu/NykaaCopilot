# Implementation report

## Delivered

- Replaced the static HTML/CSS/JavaScript page with a React and Next.js 16 App Router application. The original prototype is preserved in `legacy/`.
- Built a responsive storefront with product search, category filters, shade selection, inspiration looks, a guided analysis flow, bundle review, and a persistent local demo bag.
- Added server routes for catalog search (`GET /api/products`), inspiration presets (`GET /api/presets`), image analysis (`POST /api/analyze`), and session cart reads/writes (`GET`/`PUT /api/cart`).
- Integrated the open Hugging Face `jonathandinu/face-parsing` model in quantized ONNX form. It segments facial parts and drives actual pixel sampling for nine makeup areas. The first analysis downloads about 90 MB of model weights; subsequent calls reuse the local cache.
- Ranked catalog swatches within their product categories using CIEDE2000 color distance, with a cutoff for distant colors.
- Added MediaPipe face landmark try-on for camera and selfie images, with nine adjustable layers, snapshot review, and bundle-to-bag flow. Landmark model and WASM assets are served locally from `public/`.
- Reworked try-on to composite makeup into the source image using texture-preserving color, soft-light, multiply, and screen blends. Lips, brows, foundation, and eye regions follow the tracked contours; blush, contour, shadow, and highlight have feathered placement. Eyeliner tapers across the lid and mascara adds individual lash strokes.
- Added Natural, Glow, and Soft matte finishes, a hold-to-compare Before control, a stronger mobile try-on layout, and matching saved snapshots. Live tracking falls back to CPU if GPU initialization fails.
- Removed the original hardcoded analysis percentages and preset color claims. Bundled sample looks now use portraits the parser can process.

## Verification

- `npm run typecheck` passed.
- `npm test` passed (CIEDE2000 reference and color conversion tests).
- `npm run build` passed and generated the home page and four API routes.
- The analysis API returned HTTP 200 with nine measured regions and catalog recommendations for a bundled front-facing portrait; an unsuitable profile portrait returned HTTP 422.
- The cart API returned HTTP 200 for valid writes, preserved session contents, and returned HTTP 400 for an invalid shade.
- Browser walkthrough: sample look → analysis → selfie face tracking → snapshot → bundle review → four-item bag. The test bag was cleared afterward.
- Rechecked the updated mobile flow with a bundled selfie: face tracking, strength control, finish selection, snapshot, and review preview all worked.

## Current limits

- The face model locates anatomy; it does not identify which cosmetics are applied. Several makeup areas are estimated with position and color rules. Confidence labels are qualitative.
- Camera lighting, image filters, skin tone, and pose can shift measured shades. Foundation matching needs stricter validation against real shade data.
- The inherited 12-product catalog has approximate swatches, unverified product copy/photos, no brow/contour/highlighter products, and no live store feed or checkout. Missing and distant matches are withheld.
- Live camera behavior was not exercised in the browser walkthrough because it requires camera access. Selfie try-on was exercised.
- The upgraded renderer is a landmark-based color preview, not a learned photorealistic makeup transfer model. Fine hair occlusion, eyelash detail, and exact product finish will vary with pose and lighting.
- The cart uses a local JSON file and is intended for a single local app instance. This is a project demo rather than a deployed commerce system.
