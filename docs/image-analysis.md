# Image analysis

The analysis endpoint identifies facial **parts** and measures their visible pixel colors. It does not classify cosmetic presence, exact product, finish, undertone, or real-world shade fit.

## Processing path

1. `POST /api/analyze` reads a multipart field named `image`. It accepts JPEG, PNG, and WebP files from 1 byte through 8 MB.
2. `src/lib/analysis.ts` decodes the image. Dimensions must be at least 128 × 128 and no more than 4096 × 4096 pixels. The longest side is reduced to at most 768 pixels for analysis.
3. `@huggingface/transformers` loads `jonathandinu/face-parsing` as an image-segmentation pipeline with quantized `q8` weights. The model returns named masks such as skin, eyes, brows, and lips.
4. A mask pixel is treated as included when its value is greater than 127. The code samples RGB pixels from masks and position-based face regions. It uses the median of each RGB channel as the representative color, which reduces the influence of some extreme pixels.
5. A clear face check requires sampled skin, eyes, and lips. If one is missing, the endpoint returns a 422 image error.
6. The measured areas become `RegionAnalysis` records and feed category-specific catalog matching.

## What each area means

| Area | Measurement |
| --- | --- |
| Lips | Model lip and mouth masks |
| Eyeshadow | Skin pixels in a band above the detected eyes |
| Eyeliner | Dark pixels close to the eye area, relative to sampled skin brightness |
| Mascara | The same dark-eye sample used for eyeliner |
| Brows | Model brow masks |
| Blush | Skin pixels in an approximate cheek region |
| Contour | Skin pixels on the outer lower cheek |
| Highlighter | Skin pixels on the upper cheek |
| Foundation | Overall visible skin mask |

These rules do not verify that blush, contour, highlighter, liner, mascara, or foundation was applied. A region's `present` field means **a usable sample was found**, not that makeup was detected. `finish` is currently `null` for every region.

## Confidence labels

Confidence is assigned by code, not calculated from a calibrated probability. Lips are labeled high when measured; brows and foundation medium; the remaining regions low. Missing samples are low. A label is an explanation of the method's relative reliability, not a clinical or product-fit score.

## Network and runtime

The image is sent from the browser to this app's local Node.js analysis route. The server downloads public model artifacts from Hugging Face on first use and then caches them. The uploaded image is processed locally; the app does not send it to a Hugging Face hosted inference endpoint. No Hugging Face key is required for the current public model. See [Data, privacy, and licenses](data-privacy-and-licenses.md).

The exact implementation is in [`src/lib/analysis.ts`](../src/lib/analysis.ts). See the [API reference](api.md) for request and response shapes.
