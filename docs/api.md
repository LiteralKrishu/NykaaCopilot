# API reference

All four endpoints are Next.js App Router routes under `src/app/api/`. The app uses them on the same origin. No account authentication or rate limiting is implemented. Error bodies use `{ "error": "message" }`.

## `GET /api/products`

Returns `{ "products": Product[], "total": number }`. Optional query parameters:

| Parameter | Behavior |
| --- | --- |
| `q` | Case-insensitive text search over brand, name, category, finish, and shade names |
| `zone` | Exact makeup zone from `src/lib/types.ts` |

An unknown `zone` returns HTTP 400. The storefront's own search and category filters currently filter its initial product props in the browser; they do not call this endpoint.

```bash
curl 'http://localhost:3000/api/products?q=lipstick&zone=lips'
```

## `GET /api/presets`

Returns `{ "presets": Preset[] }`. Each preset has `id`, `title`, `subtitle`, a public `image` path, and `tags`. The storefront initially receives the same presets from the server-rendered page.

## `POST /api/analyze`

Send `multipart/form-data` with one file field named `image`:

```bash
curl -F 'image=@/absolute/path/to/portrait.jpg' http://localhost:3000/api/analyze
```

Accepted MIME types are `image/jpeg`, `image/png`, and `image/webp`; file size must be 1 byte through 8 MB. Decoded dimensions must be 128–4096 pixels in each direction. Successful responses have this shape:

Vercel accepts function request bodies up to 4.5 MB. The storefront resizes larger selected images before posting them. Direct callers of the deployed endpoint must keep the multipart request below that limit.

```ts
type LookAnalysis = {
  model: string;
  imageWidth: number;
  imageHeight: number;
  regions: Array<{
    zone: MakeupZone;
    color: string | null;       // e.g. "#B85B6C"
    present: boolean;           // usable sample found, not makeup detected
    finish: string | null;      // currently null
    confidence: "high" | "medium" | "low";
    note: string;
  }>;
  recommendations: Record<MakeupZone, Array<{
    product: Product;
    shade: Shade;
    score: number;              // rounded CIEDE2000 distance
    reason: string;
  }>>;
  note: string;
};
```

The nine `MakeupZone` values are `lips`, `eyeshadow`, `eyeliner`, `mascara`, `brows`, `blush`, `contour`, `highlighter`, and `foundation`. `Product` and `Shade` fields are defined in [`src/lib/types.ts`](../src/lib/types.ts).

| Status | Meaning |
| --- | --- |
| 200 | Analysis completed |
| 400 | Missing image or invalid multipart body |
| 413 | Empty file or over 8 MB |
| 415 | Unsupported MIME type |
| 422 | Invalid image dimensions or no suitable face |
| 503 | Model loading or processing error |

## `GET /api/cart` and `PUT /api/cart`

Both use an HTTP-only `nykaa_demo_cart` cookie. `GET` returns `{ "lines": CartLine[] }` and creates a bag cookie when needed. `PUT` **replaces** the entire bag with the supplied lines and returns the validated result:

```json
{
  "lines": [
    { "productId": "prod-1", "shadeId": "s-101", "quantity": 1 }
  ]
}
```

Every product and shade pair must exist; quantity must be an integer from 1 to 99; there can be at most 50 lines. Invalid JSON, shape, product, shade, quantity, or an oversized cookie returns HTTP 400. The bag is stored in the cookie, so it is specific to one browser. There is no checkout endpoint.

The cookie is `SameSite=Lax`, `HttpOnly`, valid for 30 days, and `Secure` when `NODE_ENV=production`. The bag is local demo storage, not a production session or account system. See [Data, privacy, and licenses](data-privacy-and-licenses.md).
