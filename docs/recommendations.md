# Recommendations and catalog

Recommendations are **nearest color matches in a small demo catalog**. They are not product identification, makeup detection, a clinical skin-tone assessment, or a guarantee that a physical shade will match.

## Catalog

`data/catalog.json` currently contains 12 products and 37 shades. `data/presets.json` contains three inspiration looks. The catalog records display fields such as brand, product name, category, finish, price, rating, image path, and shades. Each shade has an ID, name, and hex swatch. `src/lib/catalog.ts` adds a `kind` used for matching and prefixes image paths for the public web root.

Product kinds are derived from category and name: Lipstick → lips, Blush → blush, Face → foundation, names containing mascara → mascara, names containing kajal or liner → eyeliner, and remaining products → eyeshadow. This is a fixed heuristic for the current JSON data. There are no brows, contour, or highlighter products in the catalog.

## Matching algorithm

For each measured region:

1. Convert the sampled RGB hex color and every shade hex color to CIELAB.
2. Compare only products whose `kind` matches the region's makeup zone.
3. Compute CIEDE2000 (`ΔE00`) color distance with reference viewing factors `kL = kC = kH = 1`.
4. Keep matches with rounded distance at most **8** for foundation and **15** for other zones.
5. Sort by increasing distance and return at most three matches. The displayed `score` is the distance rounded to one decimal place.

If a region has no usable color, or no shade falls within the cutoff, its recommendation list is empty. On the analysis screen, the first available match in each zone is initially selected. A user can pick another listed match.

The try-on uses the selected shade's hex color for a zone. If a measured zone has no selected catalog match, it falls back to the measured image color when available. The review bundle and bag include only selected catalog matches.

## Why a low score is limited evidence

The comparison uses approximate catalog hex swatches and colors sampled from a photograph. Camera white balance, exposure, skin tone, finish, translucency, and lighting can change the result. CIEDE2000 measures color difference; it cannot determine formula, texture, coverage, undertone compatibility, or whether the inspiration subject used that product.

Catalog copy, photos, prices, ratings, and swatches are inherited demo data without a live retailer feed or independent verification. To extend the catalog, update `data/catalog.json`, provide the corresponding image under `public/`, and ensure `src/lib/catalog.ts` maps its category or name to the intended makeup zone. See [Architecture](architecture.md).
