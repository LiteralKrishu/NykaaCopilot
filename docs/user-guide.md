# User guide

## Browse the storefront

The home page shows a product grid, category buttons, a search field, and three sample inspiration looks. Search and category filtering happen in the browser over the catalog passed to `Storefront`. Product cards allow a shade choice and **Add to bag**. Prices and reviews are demo catalog values; there is no live store connection.

The header's **From Look to Products** button opens the four-step look workflow. A preset card also opens the workflow and starts analyzing that preset.

## 1. Choose an inspiration look

Upload a front-facing JPEG, PNG, or WebP photo of up to 8 MB, or choose one of the three bundled sample looks. The face should have visible eyes and lips. The app rejects very small, very large, or unsuitable images. The first analysis can be slower while the server downloads model files.

This photo supplies **visible colors**, not a verified list of products used on that person.

## 2. Review the analysis and products

The analysis screen shows nine makeup areas: lips, eyeshadow, eyeliner, mascara, brows, blush, contour, highlighter, and base. Each card has a measured color when available, a qualitative confidence label, an explanation, and up to three nearby catalog shades. Select a different offered shade to change the look. A missing or distant product category displays no match.

The first match in each category is selected automatically when a match exists. The results can be affected by lighting, filters, skin tone, and existing makeup. See [Image analysis](image-analysis.md) and [Recommendations and catalog](recommendations.md) before interpreting a match as a product recommendation.

## 3. Try the look

Choose **Start camera** or **Upload selfie**. This input is a different image from the inspiration photo. The try-on begins when a face is tracked.

- **Natural**, **Glow**, and **Soft matte** change rendering strength and highlights.
- **Makeup strength** adjusts all enabled layers.
- **Makeup areas** toggles each of the nine layers.
- Hold **Before** to show the original face temporarily.
- **Save snapshot** stores the currently displayed canvas result for the review step.
- **Stop** releases the camera stream or selfie and closes the face tracker.

The camera preview and its snapshot are mirrored like a selfie. A browser permission prompt appears only for live camera mode. See [Virtual try-on](virtual-try-on.md).

## 4. Review and use the demo bag

The review step displays a saved snapshot, selected products, and their subtotal. If no snapshot was saved, the preview area asks for one; a product bundle can still be reviewed. **Add look to bag** adds the selected product and shade pairs to the demo bag. Bag controls change quantity or remove a line by reducing its quantity from one.

The bag is saved locally by session. It is not a checkout, order, inventory reservation, or payment flow.

## Current interaction limits

- Returning from Review to Try-on remounts the try-on component. The camera must be restarted or the selfie uploaded again.
- Closing the workflow does not create a persistent saved look. A page reload clears analysis choices and the snapshot; the demo bag is loaded again from the server.
- Some storefront labels reflect the visual prototype and do not open real accounts, other store categories, or checkout.
