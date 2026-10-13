# Getting started

## Requirements

- Node.js 20.9 or newer and npm.
- An internet connection for `npm install` and the first face-analysis model download.
- A modern browser with Canvas support. Live camera mode also needs a camera and browser permission.

From the repository root:

```bash
npm install
npm run dev
```

Open the local address printed by Next.js, normally `http://localhost:3000`. If port 3000 is occupied, Next.js may choose another port; use the address in the terminal.

To run the built app:

```bash
npm run build
npm run start
```

## First analysis and model downloads

The first request to `POST /api/analyze` loads the public `jonathandinu/face-parsing` model through `@huggingface/transformers` with `dtype: "q8"`. Transformers.js downloads model artifacts from the Hugging Face Hub and caches them on the server's filesystem. This first run can take longer and requires network access; later analyses reuse the cache. The app does **not** call the hosted Hugging Face Inference API for photos and does not require a Hugging Face key for this public model.

MediaPipe's `face_landmarker.task` and vision WASM assets are already included under `public/models/` and `public/mediapipe/wasm/`. The browser loads them from this app when try-on starts. Their runtime is independent of the server-side Hugging Face model.

The app has no required `.env` file. If you later choose a private or gated Hugging Face model, its authentication and usage terms must be handled separately on the server.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Compile the production build and run Next.js TypeScript checks |
| `npm run start` | Serve a completed production build |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm test` | Run the color conversion and CIEDE2000 tests |
| `npm run docs:check` | Check local Markdown links in the documentation |

See [Testing and troubleshooting](testing-and-troubleshooting.md) for a manual walkthrough.
