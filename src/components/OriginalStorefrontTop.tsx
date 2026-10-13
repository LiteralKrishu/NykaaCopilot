"use client";

import { useState } from "react";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  cartCount: number;
  onOpenCopilot: () => void;
  onOpenCart: () => void;
};

const heroSlides = [
  {
    image: "/assets/images/hero-banner-1.jpg",
    badge: "Curated Collection",
    title: "The Grand Lipstick Festival",
    description: "Experience iconic shades from M.A.C, Kay Beauty, Charlotte Tilbury & more with full-face virtual try-on.",
    action: 'Try "From Look to Products"',
  },
  {
    image: "/assets/images/hero-banner-2.jpg",
    badge: "Look Copilot",
    title: "Turn inspiration into your makeup look",
    description: "Upload a portrait to explore visible makeup colors, find close catalog shades, and preview the complete look.",
    action: "Analyze Your Look Now",
  },
];

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

export function StorefrontHeader({ search, onSearch, cartCount, onOpenCopilot, onOpenCart }: Props) {
  return <>
    <div className="top-announcement"><span>✨ GRAND BEAUTY FESTIVAL: Up to 50% Off on Top Global Brands + Free Gift with Every Order! <a href="#shop">Shop Now</a></span></div>
    <div className="top-utility-strip"><div className="utility-container"><div className="utility-left"><span className="utility-link"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>Get App</span><span className="utility-link"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>Store &amp; Events</span><span className="utility-link">Gift Cards</span><span className="utility-link">Help</span></div><div className="utility-right"><span className="utility-link">Nykaa Man</span><span className="utility-link">Nykaa Fashion</span><span className="utility-link">Beauty Advice</span></div></div></div>
    <header className="main-header"><div className="header-inner">
      <a href="#top" className="brand-logo-wrap" aria-label="Nykaa home"><img src="/nykaa-logo.svg" alt="Nykaa" className="brand-logo-svg" /></a>
      <nav className="nav-categories-strip" aria-label="Main navigation"><a className="nav-cat-item active" href="#shop">Categories</a><a className="nav-cat-item" href="#shop">Brands</a><a className="nav-cat-item" href="#shop">Luxe</a><span className="nav-cat-item">Nykaa Fashion</span><a className="nav-cat-item" href="#looks">Beauty Advice</a></nav>
      <div className="header-search-wrap"><label className="header-search-box"><SearchIcon /><input className="header-search-input" type="search" aria-label="Search products" placeholder="Search on Nykaa (e.g. Lipstick, Kay Beauty, Nude...)" value={search} onChange={(event) => onSearch(event.target.value)} /></label></div>
      <button className="copilot-header-btn" type="button" onClick={onOpenCopilot}><span className="copilot-badge-sparkle">✦</span> From Look to Products</button>
      <div className="header-actions"><span className="header-action-btn" title="Sign-in is not part of this project demo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></svg><span>Sign In</span></span><button className="header-action-btn" type="button" onClick={onOpenCart} aria-label={`Shopping bag with ${cartCount} items`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 9h14l1 12H4L5 9Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg><span>Bag</span><span className="cart-count-badge">{cartCount}</span></button></div>
    </div></header>
    <nav className="secondary-nav" aria-label="Shop categories"><div className="sec-nav-inner"><a className="sec-nav-link highlight" href="#shop">Makeup</a>{["Skin", "Hair", "Appliances", "Bath & Body", "Natural", "Mom & Baby", "Health & Wellness", "Men", "Fragrance"].map((label) => <span className="sec-nav-link" key={label}>{label}</span>)}<a className="sec-nav-link highlight" href="#looks">Pop Ups</a></div></nav>
  </>;
}

export function HomeIntro({ onOpenCopilot, onExploreLooks }: { onOpenCopilot: () => void; onExploreLooks: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = heroSlides[slide];
  return <div className="original-home-top">
    <section className="hero-banner-section" aria-label="Featured beauty collection">
      <div className="hero-slide-recreated" style={{ backgroundImage: `url(${current.image})` }}><div className="hero-overlay"><div className="hero-content"><span className="hero-badge">{current.badge}</span><h1 className="hero-title">{current.title}</h1><p className="hero-desc">{current.description}</p><button className="hero-cta-btn" type="button" onClick={onOpenCopilot}>{current.action}<span aria-hidden="true">→</span></button></div></div></div>
      <button type="button" className="hero-nav-arrow prev" aria-label="Previous banner" onClick={() => setSlide((slide + heroSlides.length - 1) % heroSlides.length)}>‹</button><button type="button" className="hero-nav-arrow next" aria-label="Next banner" onClick={() => setSlide((slide + 1) % heroSlides.length)}>›</button>
    </section>
    <section className="copilot-feature-banner"><div className="copilot-banner-text"><span className="copilot-pill">✦ Nykaa Copilot AI Feature</span><h2 className="copilot-banner-title">From Look to Products</h2><p className="copilot-banner-desc">Love a makeup look on Instagram, Pinterest or in a magazine? Upload it or select a curated preset. Explore visible colors, find close products, and preview the complete look on your face.</p></div><div className="copilot-banner-actions"><button className="btn-copilot-launch" type="button" onClick={onOpenCopilot}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg>Upload Makeup Photo</button><button className="btn-copilot-preset" type="button" onClick={onExploreLooks}>Explore 3 Preset Looks</button></div></section>
  </div>;
}
