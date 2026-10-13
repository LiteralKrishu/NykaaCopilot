# Virtual try-on

Try-on is a browser-side face-tracking and Canvas renderer. It is separate from the server-side inspiration image analysis. The user supplies a **selfie or camera stream** to receive colors selected from the inspiration look.

## Face tracking lifecycle

`src/components/TryOn.tsx` loads `@mediapipe/tasks-vision` when a user chooses a mode. It reads `/models/face_landmarker.task` and `/mediapipe/wasm/` from the app's `public/` folder, tracks one face, and attempts GPU execution before falling back to CPU.

| Mode | Source | Detection | Canvas size |
| --- | --- | --- | --- |
| Camera | Browser `getUserMedia` with user-facing camera preference | Video detection about every 65 ms while frames are ready | Width capped at 960 px, preserving aspect ratio |
| Selfie | Browser object URL for a selected image | One image detection; controls redraw without repeating detection | Longest side capped at 1280 px |

When no face is tracked, the original frame is drawn without makeup. A selfie with no detectable face shows an error status and cannot be snapshotted. Stopping or unmounting try-on cancels animation, stops camera tracks, closes the tracker, and revokes its selfie object URL.

## How makeup is drawn

`src/lib/tryon-renderer.ts` first draws the source image into a single canvas, then blends makeup into those pixels. This preserves some of the source lighting and texture. MediaPipe landmarks define face, eye, brow, lip, and lash geometry.

| Area | Rendering method |
| --- | --- |
| Foundation | Feathered face mask with holes for eyes, lips, and brows; low-opacity color blend |
| Contour and blush | Soft, scaled cheek gradients with multiply or soft-light blending |
| Highlighter | Soft cheek and nose gradients using screen blending; disabled in Soft matte |
| Eyeshadow | Soft spots positioned between eye and brow landmarks |
| Brows | Feathered polygon masks with multiply blending |
| Eyeliner | Tapered upper lash-line strokes |
| Mascara | Small strokes extending from upper lash landmarks |
| Lips | Feathered outer-lip mask with an inner-mouth hole and layered color/soft-light blends |

The Natural finish reduces overall strength; Glow adds brighter highlights and a lower-lip sheen; Soft matte increases lip soft-light strength and removes highlighter. The overall slider and individual zone checkboxes control what is drawn. Holding **Before** draws just the source image.

For performance, the renderer reuses scratch canvases for blurred masks. The camera preview is mirrored by CSS. A camera snapshot mirrors the final canvas into the exported PNG, so the saved orientation matches the preview. A selfie snapshot uses its source orientation.

## Snapshot and state

**Save snapshot** converts the current composite canvas to a PNG data URL and passes it to `Storefront`, which shows it in the review step. This snapshot is kept in browser React state; the app does not upload or persist it. Switching from Review back to Try-on remounts the component, so the user must restart the camera or choose a selfie again. The previously saved review snapshot remains until a new inspiration analysis or page reload resets it.

## Fidelity limits

This is a 2D landmark-based color simulation. It is not a learned photorealistic makeup-transfer model and does not model a specific cosmetic's material properties. Occlusion by hair or hands, depth, pose, lash detail, exact shade, and finish can be inaccurate. Browser camera access still requires permission; the selfie path has been exercised in the browser walkthrough, while live camera behavior has not been verified with permission granted.
