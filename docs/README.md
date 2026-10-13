# Project documentation

Nykaa Look Copilot is a local Next.js demonstration of a complete makeup workflow: choose an inspiration portrait, measure visible face colors, rank shades in a small catalog, preview the look on another face, and add selected products to a demo bag.

The documentation describes the **current implementation in this repository**. The app is a student project, with no Nykaa account, live inventory, checkout, or production beauty validation.

## Read by task

| If you want to… | Read |
| --- | --- |
| Install and run the app | [Getting started](getting-started.md) |
| Understand the screens and controls | [User guide](user-guide.md) |
| See how React, Next.js, the models, and data fit together | [Architecture](architecture.md) |
| Understand face and color analysis, including confidence labels | [Image analysis](image-analysis.md) |
| Understand catalog matching and product suggestions | [Recommendations and catalog](recommendations.md) |
| Understand live camera, selfie makeup, and snapshots | [Virtual try-on](virtual-try-on.md) |
| Call the HTTP endpoints | [API reference](api.md) |
| Understand network requests, photos, cookies, storage, and licenses | [Data, privacy, and licenses](data-privacy-and-licenses.md) |
| Verify or troubleshoot the project | [Testing and troubleshooting](testing-and-troubleshooting.md) |

## One-minute explanation

1. The server passes the local product catalog and three preset looks to the React storefront.
2. An inspiration photo is sent to `POST /api/analyze`. A public face-parsing model runs **on the local Node.js server** and marks facial parts. Code samples visible colors from those parts; it does not identify specific cosmetics.
3. Each measured color is compared with catalog swatches in the same makeup category using CIEDE2000. The UI shows up to three sufficiently close shades per category.
4. A separate selfie or live camera stream stays in the browser for MediaPipe face tracking. Canvas code draws the chosen colors on the tracked face. A snapshot can be reviewed.
5. The bag stores product IDs, shade IDs, and quantities in an HTTP-only browser cookie.

Start with [Getting started](getting-started.md), then follow the [User guide](user-guide.md).
