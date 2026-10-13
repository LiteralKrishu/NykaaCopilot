# Getting started

## Requirements

- Node.js 20.9 or newer and npm.
- An internet connection for `npm install` and the first model preparation during `npm run dev` or `npm run build`.
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

## Model preparation and first analysis

`npm run dev` and `npm run build` first run `scripts/prepare-model.mjs`. It downloads a pinned version of `jonathandinu/face-parsing`, verifies the files by SHA-256, and stores them in the ignored `.models/` directory. The production build packages these files with `POST /api/analyze`. At request time, `@huggingface/transformers` loads the local files with `dtype: "q8"`; remote model loading is disabled. The first request can take longer while the bundled model initializes. The app does **not** call the hosted Hugging Face Inference API for photos and does not require a Hugging Face key for this public model.

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
