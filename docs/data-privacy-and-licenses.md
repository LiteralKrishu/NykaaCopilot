# Data, privacy, and licenses

This page describes the code's current data flow. It is a technical inventory, not a privacy policy or legal review.

## Images and model requests

| Data | Where it goes | Persistence in this app |
| --- | --- | --- |
| Inspiration upload or preset | Browser to local `POST /api/analyze`; decoded and processed by the Node.js route | Analysis results clear when the workflow resets. A source object URL can remain in browser memory until another image replaces it or the page reloads; upload bytes are not intentionally written to the app's data files |
| Selfie upload | Browser-side MediaPipe and Canvas | Object URL exists during try-on, then is revoked; a saved PNG snapshot remains in React state until reset/reload |
| Camera frames | Browser MediaPipe and Canvas | Frames are not sent to an app endpoint or saved; a user-created snapshot stays in React state |
| Face parser model files | Downloaded from the Hugging Face Hub on first analysis | Cached by Transformers.js on the server filesystem |
| Face landmark model and MediaPipe WASM | Served from this app's `public/` directory | Bundled with the project |

The code does not submit photos to the Hugging Face hosted inference API or to ModiFace. It does not include a Hugging Face key. Public model downloads and package installation still make external network requests. An internet-facing deployment would send inspiration photos to whatever server hosts `/api/analyze`; do not assume the server is on the user's own device outside the local demo.

## Bag and session

`GET /api/cart` sets an HTTP-only, SameSite=Lax session cookie named `nykaa_demo_session`. The cookie contains a random UUID, not the cart contents. `PUT /api/cart` writes product IDs, shade IDs, and quantities under that UUID in `.data/carts.json`. The file is ignored by Git. Its contents have no automatic expiry or cleanup even though the cookie expires after 30 days. The cart implementation is meant for one local app instance; it has no login, user ownership checks, database, encryption-at-rest configuration, or production concurrency guarantees across multiple server processes.

## Model and content terms

The [face-parsing model card](https://huggingface.co/jonathandinu/face-parsing) states use for **non-commercial research and educational purposes**. Access to a public model without a Hugging Face key does not change its license. Review the model card and every dependency's terms before public or commercial deployment.

The product names, swatches, prices, ratings, copy, and images are demo catalog content. They have not been independently verified or connected to Nykaa inventory or checkout. The app's Nykaa-styled visual prototype is for this local project; publishing it would require a separate review of branding and content rights.

## Production work still needed

Before hosting this for other users, decide on image retention and deletion, a privacy notice, HTTPS and deployment security, abuse/rate limits, a durable multi-instance cart store, real catalog data and rights, and a model license suitable for the intended use. See [Testing and troubleshooting](testing-and-troubleshooting.md) for current validation scope.
