"use client";

import { useEffect, useMemo, useState } from "react";
import type { Preset } from "@/lib/catalog";
import { MAKEUP_ZONES, type CartLine, type LookAnalysis, type MakeupZone, type Product, type ProductMatch } from "@/lib/types";
import TryOn from "./TryOn";
import { HomeIntro, StorefrontHeader } from "./OriginalStorefrontTop";

type Props = { products: Product[]; presets: Preset[] };
type Step = "source" | "analysis" | "tryon" | "review";
const zoneTitles: Record<MakeupZone, string> = { lips: "Lips", eyeshadow: "Eyeshadow", eyeliner: "Eyeliner", mascara: "Mascara", brows: "Brows", blush: "Blush", contour: "Contour", highlighter: "Highlighter", foundation: "Base" };
const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const MAX_FUNCTION_UPLOAD_BYTES = 4 * 1024 * 1024;

async function prepareImageUpload(file: File): Promise<File> {
  if (file.size <= MAX_FUNCTION_UPLOAD_BYTES) return file;
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2048 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not resize the image.");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_FUNCTION_UPLOAD_BYTES) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      }
    }
    throw new Error("This image is too large to analyze. Try a smaller photo.");
  } finally {
    image.close();
  }
}

async function readApiJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`${fallback} (server returned HTTP ${response.status}).`);
  }
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `${fallback} (HTTP ${response.status}).`);
  return data;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product, shadeId: string) => void }) {
  const [shadeId, setShadeId] = useState(product.shades[0]?.id ?? "");
  const shade = product.shades.find((item) => item.id === shadeId) ?? product.shades[0];
  return <article className="product-card">
    <div className="product-image"><img src={product.image} alt={product.name} /><span className="tag">{product.tag}</span></div>
    <div className="product-info"><div className="brand">{product.brand}</div><h3>{product.name}</h3><p className="product-finish">{product.finish}</p>
      <p className="rating">★ {product.rating} <span>({product.reviewsCount})</span></p>
      <div className="price-row"><strong>{rupees(product.price)}</strong><s>{rupees(product.originalPrice)}</s><span>{product.discount}</span></div>
      <label className="shade-select">Shade<select value={shadeId} onChange={(event) => setShadeId(event.target.value)}>{product.shades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="product-actions"><span className="swatch" style={{ backgroundColor: shade?.hex }} aria-hidden /><button type="button" onClick={() => onAdd(product, shadeId)}>Add to bag</button></div>
    </div>
  </article>;
}

export default function Storefront({ products, presets }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MakeupZone | "all">("all");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("source");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [analysis, setAnalysis] = useState<LookAnalysis | null>(null);
  const [selected, setSelected] = useState<Partial<Record<MakeupZone, ProductMatch>>>({});
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartBusy, setCartBusy] = useState(false);

  useEffect(() => { fetch("/api/cart").then((r) => r.json()).then((data) => setCart(data.lines ?? [])).catch(() => undefined); }, []);
  const filtered = products.filter((product) => (filter === "all" || product.kind === filter) && `${product.brand} ${product.name} ${product.category} ${product.shades.map((s) => s.name).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + (products.find((product) => product.id === line.productId)?.price ?? 0) * line.quantity, 0);
  const selectedMatches = Object.values(selected).filter((match): match is ProductMatch => Boolean(match));
  const bundleTotal = selectedMatches.reduce((sum, match) => sum + match.product.price, 0);
  const tryonColors = useMemo(() => Object.fromEntries(analysis?.regions.map((region) => [region.zone, selected[region.zone]?.shade.hex ?? region.color]).filter((entry) => entry[1]) ?? []) as Partial<Record<MakeupZone, string>>, [analysis, selected]);

  async function saveCart(lines: CartLine[]) {
    setCartBusy(true);
    try {
      const response = await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines }) });
      const data = await readApiJson<{ lines: CartLine[] }>(response, "Could not update bag");
      setCart(data.lines);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not update bag."); }
    finally { setCartBusy(false); }
  }
  function addToCart(product: Product, shadeId: string) {
    const existing = cart.find((line) => line.productId === product.id && line.shadeId === shadeId);
    void saveCart(existing ? cart.map((line) => line === existing ? { ...line, quantity: line.quantity + 1 } : line) : [...cart, { productId: product.id, shadeId, quantity: 1 }]);
    setCartOpen(true);
  }
  function addBundle() {
    const next = cart.map((line) => ({ ...line }));
    for (const match of selectedMatches) {
      const line = next.find((item) => item.productId === match.product.id && item.shadeId === match.shade.id);
      if (line) line.quantity += 1; else next.push({ productId: match.product.id, shadeId: match.shade.id, quantity: 1 });
    }
    void saveCart(next); setCartOpen(true);
  }
  async function analyze(file: File, name: string) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Choose a JPEG, PNG, or WebP image."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("Choose an image smaller than 8 MB."); return; }
    setError(""); setBusy(true); setAnalysis(null); setSelected({}); setSnapshotUrl(null);
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(file)); setSourceName(name);
    try {
      const upload = await prepareImageUpload(file);
      const form = new FormData(); form.set("image", upload);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const result = await readApiJson<LookAnalysis>(response, "Analysis failed");
      setAnalysis(result as LookAnalysis);
      setSelected(Object.fromEntries(MAKEUP_ZONES.flatMap((zone) => result.recommendations[zone]?.[0] ? [[zone, result.recommendations[zone][0]]] : [])));
      setStep("analysis");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Analysis failed."); }
    finally { setBusy(false); }
  }
  async function choosePreset(preset: Preset) {
    try {
      setBusy(true); const response = await fetch(preset.image);
      if (!response.ok) throw new Error("Could not load the sample image.");
      const blob = await response.blob();
      await analyze(new File([blob], `${preset.id}.jpg`, { type: blob.type || "image/jpeg" }), preset.title);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not load sample image."); }
    finally { setBusy(false); }
  }
  function resetCopilot() { setOpen(true); setStep("source"); setError(""); setAnalysis(null); setSelected({}); setSnapshotUrl(null); }

  return <>
    <StorefrontHeader search={search} onSearch={setSearch} cartCount={cartCount} onOpenCopilot={resetCopilot} onOpenCart={() => setCartOpen(true)} />
    <main id="top">
      <HomeIntro onOpenCopilot={resetCopilot} onExploreLooks={() => document.getElementById("looks")?.scrollIntoView({ behavior: "smooth" })} />
      <section id="shop" className="shop-section container"><div className="section-head"><div><h2>Bestsellers in Makeup &amp; Beauty</h2><p>Top-rated lipsticks, blush, eye makeup and luxury essentials</p></div><span className="product-count">{filtered.length} products</span></div><div className="filter-row"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>{MAKEUP_ZONES.map((zone) => <button key={zone} className={filter === zone ? "active" : ""} onClick={() => setFilter(zone)}>{zoneTitles[zone]}</button>)}</div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div>{!filtered.length && <p className="empty-state">No products in this demo catalog for that search or category.</p>}</section>
      <section id="looks" className="looks-section"><div className="container"><div className="section-head"><div><span className="eyebrow pink">START HERE</span><h2>Explore an inspiration look</h2></div><button className="text-button" onClick={resetCopilot}>Upload your own →</button></div><div className="looks-grid">{presets.map((preset) => <button className="look-card" type="button" key={preset.id} onClick={() => { setOpen(true); void choosePreset(preset); }}><img src={preset.image} alt={preset.title} /><span><strong>{preset.title}</strong><small>{preset.subtitle}</small></span></button>)}</div></div></section>
      <section id="how-it-works" className="how-section container"><div><span className="eyebrow pink">THE LOOK COPILOT</span><h2>One photo. A complete makeup plan.</h2></div><div className="how-grid"><div><span>01</span><h3>Share a look</h3><p>Upload a clear inspiration photo or choose a sample look.</p></div><div><span>02</span><h3>Explore the colors</h3><p>Face parsing finds lips, eyes, cheeks, brows, and complexion areas. You can review every estimate.</p></div><div><span>03</span><h3>Match and try</h3><p>Compare catalog shades and preview the full look with live face tracking or a selfie.</p></div></div></section>
    </main>
    <footer className="footer"><div className="container"><strong>Nykaa Look Copilot</strong><p>Student project demo. No checkout or product inventory connection. Image analysis and try-on are visual estimates.</p></div></footer>
    {open && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="copilot-panel" role="dialog" aria-modal="true" aria-label="Look Copilot"><header className="panel-header"><div><span className="eyebrow pink">NYKAA LOOK COPILOT</span><h2>{step === "source" ? "Find your complete look" : step === "analysis" ? "Your color analysis" : step === "tryon" ? "Try it on" : "Review your look"}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>×</button></header><div className="stepper"><span className={step === "source" ? "active" : ""}>1 Inspiration</span><span className={step === "analysis" ? "active" : ""}>2 Analysis & products</span><span className={step === "tryon" ? "active" : ""}>3 Try-on</span><span className={step === "review" ? "active" : ""}>4 Review</span></div><div className="panel-body">
      {error && <div className="error-banner" role="alert">{error}</div>}
      {step === "source" && <div className="source-view"><div className="upload-card"><span className="upload-icon">✦</span><h3>Upload your inspiration photo</h3><p>Use a clear, front-facing photo with visible eyes and lips. JPEG, PNG, or WebP up to 8 MB.</p><label className="primary-button">Choose photo<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void analyze(file, file.name); }} /></label></div><div><h3>Or choose a sample look</h3><div className="preset-list">{presets.map((preset) => <button key={preset.id} onClick={() => void choosePreset(preset)}><img src={preset.image} alt="" /><span><strong>{preset.title}</strong><small>{preset.subtitle}</small></span><span>→</span></button>)}</div></div></div>}
      {busy && <div className="busy-banner" role="status"><span className="spinner" /> {step === "source" ? "Analyzing the face and colors. The model may download on first use…" : "Loading…"}</div>}
      {step === "analysis" && analysis && <><div className="analysis-intro"><img src={sourceUrl ?? ""} alt={sourceName} /><div><span className="eyebrow pink">{sourceName}</span><h3>Color map and closest shades</h3><p>{analysis.note}</p><p className="model-label">Model: {analysis.model}</p></div></div><div className="region-grid">{analysis.regions.map((region) => <article className="region-card" key={region.zone}><div className="region-title"><span className="swatch large" style={{ backgroundColor: region.color ?? "#eee" }} /><div><h4>{zoneTitles[region.zone]}</h4><small>{region.color ?? "Not measured"} · {region.confidence} confidence</small></div></div><p>{region.note}</p>{analysis.recommendations[region.zone].length ? <div className="match-list">{analysis.recommendations[region.zone].map((match) => <button type="button" className={selected[region.zone]?.shade.id === match.shade.id ? "selected" : ""} key={`${match.product.id}-${match.shade.id}`} onClick={() => setSelected((current) => ({ ...current, [region.zone]: match }))}><span className="swatch" style={{ background: match.shade.hex }} /><span><strong>{match.product.brand} {match.product.name}</strong><small>{match.shade.name} · {rupees(match.product.price)} · ΔE00 {match.score}</small></span></button>)}</div> : <p className="no-match">No close {zoneTitles[region.zone].toLowerCase()} shade in this sample catalog.</p>}</article>)}</div><div className="panel-actions"><button onClick={() => setStep("source")}>← Change photo</button><button className="primary-button" onClick={() => setStep("tryon")}>Try the full look →</button></div></>}
      {step === "tryon" && analysis && <><TryOn colors={tryonColors} onSnapshot={setSnapshotUrl} /><div className="panel-actions"><button onClick={() => setStep("analysis")}>← Analysis</button><button className="primary-button" onClick={() => setStep("review")}>Review look →</button></div></>}
      {step === "review" && analysis && <><div className="review-grid"><div><h3>Look preview</h3>{snapshotUrl ? <img className="review-image" src={snapshotUrl} alt="Your virtual makeup snapshot" /> : <div className="empty-state">Take a snapshot in try-on to see your result here.</div>}<p className="muted">The virtual result is an overlay and may differ from real product application.</p></div><div><h3>Chosen products</h3>{selectedMatches.length ? selectedMatches.map((match) => <div className="review-line" key={`${match.product.id}-${match.shade.id}`}><span className="swatch" style={{ background: match.shade.hex }} /><div><strong>{match.product.name}</strong><small>{match.shade.name}</small></div><b>{rupees(match.product.price)}</b></div>) : <p>No products selected. The sample catalog has limited categories.</p>}<div className="review-total"><span>Subtotal</span><strong>{rupees(bundleTotal)}</strong></div><button className="primary-button wide" disabled={!selectedMatches.length || cartBusy} onClick={addBundle}>Add look to bag</button></div></div><div className="panel-actions"><button onClick={() => setStep("tryon")}>← Try-on</button></div></>}
    </div></section></div>}
    {cartOpen && <div className="overlay drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag"><header className="panel-header"><div><span className="eyebrow pink">YOUR BAG</span><h2>{cartCount} items</h2></div><button className="icon-button" aria-label="Close bag" onClick={() => setCartOpen(false)}>×</button></header><div className="cart-lines">{error && <div className="error-banner" role="alert">{error}</div>}{cart.length ? cart.map((line) => { const product = products.find((item) => item.id === line.productId)!; const shade = product.shades.find((item) => item.id === line.shadeId)!; return <div className="cart-line" key={`${line.productId}-${line.shadeId}`}><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>{shade.name}</small><div className="qty"><button disabled={cartBusy} onClick={() => void saveCart(line.quantity === 1 ? cart.filter((item) => item !== line) : cart.map((item) => item === line ? { ...item, quantity: item.quantity - 1 } : item))}>−</button><span>{line.quantity}</span><button disabled={cartBusy} onClick={() => void saveCart(cart.map((item) => item === line ? { ...item, quantity: item.quantity + 1 } : item))}>+</button></div></div><b>{rupees(product.price * line.quantity)}</b></div>; }) : <p className="empty-state">Your bag is empty.</p>}</div><div className="cart-footer"><div className="review-total"><span>Subtotal</span><strong>{rupees(cartTotal)}</strong></div><p>Demo bag only. Checkout is not connected.</p></div></aside></div>}
  </>;
}
