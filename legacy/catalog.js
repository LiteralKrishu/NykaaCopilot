const NYKAA_CATALOG = [
  {
    id: "prod-1",
    brand: "Kay Beauty",
    name: "Matteinee Matte Lip Crayon",
    rating: 4.5,
    reviewsCount: "14.2k",
    price: 799,
    originalPrice: 999,
    discount: "20% Off",
    category: "Lipstick",
    finish: "Comfort Matte",
    image: "assets/images/kay-lipstick.jpg",
    tag: "BESTSELLER",
    colorFamily: "Mauve / Berry",
    shades: [
      { id: "s-101", name: "Romance (Mauve Nude)", hex: "#B85B6C", preview: "#B85B6C" },
      { id: "s-102", name: "Wildchild (Deep Berry)", hex: "#8A2B43", preview: "#8A2B43" },
      { id: "s-103", name: "Chartbuster (Warm Terracotta)", hex: "#BC5A45", preview: "#BC5A45" },
      { id: "s-104", name: "Red Carpet (Ruby Crimson)", hex: "#B11E3B", preview: "#B11E3B" }
    ],
    details: "Enriched with Chamomile and Marula Oil, providing an ultra-creamy matte finish that lasts 18 hours without cracking."
  },
  {
    id: "prod-2",
    brand: "Maybelline New York",
    name: "Superstay Vinyl Ink Liquid Lipstick",
    rating: 4.4,
    reviewsCount: "28.9k",
    price: 721,
    originalPrice: 849,
    discount: "15% Off",
    category: "Lipstick",
    finish: "Vinyl Gloss / Transfer-proof",
    image: "assets/images/maybelline-lipstick.jpg",
    tag: "TRENDING",
    colorFamily: "Nude / Peach",
    shades: [
      { id: "s-201", name: "15 Peachy (Warm Peach Nude)", hex: "#C7685D", preview: "#C7685D" },
      { id: "s-202", name: "35 Cheeky (Soft Rose Mauve)", hex: "#BB6174", preview: "#BB6174" },
      { id: "s-203", name: "50 Wicked (Intense Crimson)", hex: "#A6192E", preview: "#A6192E" },
      { id: "s-204", name: "10 Lippy (Deep Berry Plum)", hex: "#872746", preview: "#872746" }
    ],
    details: "Shake before use! Delivers no-budge vinyl shine and 16HR wear with Color Lock formula."
  },
  {
    id: "prod-3",
    brand: "M.A.C",
    name: "Retro Matte Lipstick - Ruby Woo",
    rating: 4.7,
    reviewsCount: "35.1k",
    price: 1950,
    originalPrice: 2150,
    discount: "Special Price",
    category: "Lipstick",
    finish: "Intense Ultra-Matte",
    image: "assets/images/mac-rubywoo.jpg",
    tag: "NYKAA LUXE",
    colorFamily: "Red / Crimson",
    shades: [
      { id: "s-301", name: "Ruby Woo (Vivid Blue-Red)", hex: "#BC1D35", preview: "#BC1D35" },
      { id: "s-302", name: "Velvet Teddy (Deep Tone Beige)", hex: "#9E6457", preview: "#9E6457" },
      { id: "s-303", name: "Mehr (Dirty Blue Pink)", hex: "#AD6277", preview: "#AD6277" },
      { id: "s-304", name: "Chili (Warm Brick Red)", hex: "#9E382A", preview: "#9E382A" }
    ],
    details: "The cult-classic red lipstick worn globally. Intense colour payoff with a completely shine-free matte texture."
  },
  {
    id: "prod-4",
    brand: "Charlotte Tilbury",
    name: "Matte Revolution - Pillow Talk",
    rating: 4.8,
    reviewsCount: "9.8k",
    price: 3150,
    originalPrice: 3400,
    discount: "Luxe Bestseller",
    category: "Lipstick",
    finish: "Luminous Modern Matte",
    image: "assets/images/charlotte-lipstick.jpg",
    tag: "LUXE ICON",
    colorFamily: "Nude / Rose",
    shades: [
      { id: "s-401", name: "Pillow Talk Original (Nude Pink)", hex: "#B76B70", preview: "#B76B70" },
      { id: "s-402", name: "Pillow Talk Medium (Warm Berry Pink)", hex: "#994D58", preview: "#994D58" },
      { id: "s-403", name: "Walk of No Shame (Berry Rose)", hex: "#9C424E", preview: "#9C424E" },
      { id: "s-404", name: "Super Fabulous (Deep Rosewood)", hex: "#8C4E4B", preview: "#8C4E4B" }
    ],
    details: "Infused with 3D glowing pigments and Orchid Extract for wider, fuller-looking cashmere-soft lips."
  },
  {
    id: "prod-5",
    brand: "Nykaa Cosmetics",
    name: "Matte to Last Liquid Lipstick",
    rating: 4.3,
    reviewsCount: "52.4k",
    price: 499,
    originalPrice: 649,
    discount: "23% Off",
    category: "Lipstick",
    finish: "Transferproof Featherlight Matte",
    image: "assets/images/nykaa-lipstick.jpg",
    tag: "ALL-TIME FAV",
    colorFamily: "Terracotta / Nude",
    shades: [
      { id: "s-501", name: "Madras Kaapi (Warm Caramel Brown)", hex: "#8F4839", preview: "#8F4839" },
      { id: "s-502", name: "Chai (Nude Terracotta)", hex: "#A85848", preview: "#A85848" },
      { id: "s-503", name: "Gul (Soft Dusty Rose)", hex: "#B96574", preview: "#B96574" },
      { id: "s-504", name: "Rukmini (Regal Crimson)", hex: "#A31C32", preview: "#A31C32" }
    ],
    details: "Inspired by India's diverse cities, enriched with Vitamin E and antioxidants for all-day comfort wear."
  },
  {
    id: "prod-6",
    brand: "Huda Beauty",
    name: "Liquid Matte Ultra-Comfort Lipstick",
    rating: 4.6,
    reviewsCount: "11.7k",
    price: 2150,
    originalPrice: 2400,
    discount: "10% Off",
    category: "Lipstick",
    finish: "Weightless Velvet Matte",
    image: "assets/images/huda-lipstick.jpg",
    tag: "FEATURED",
    colorFamily: "Berry / Brown Nude",
    shades: [
      { id: "s-601", name: "Bombshell (Subtle Pinkish Nude)", hex: "#BC6F74", preview: "#BC6F74" },
      { id: "s-602", name: "Icon (Rich Peachy Pink)", hex: "#B5565B", preview: "#B5565B" },
      { id: "s-603", name: "Trophy Wife (Rose Wood)", hex: "#9D4B5D", preview: "#9D4B5D" },
      { id: "s-604", name: "Perfectionist (Light Warm Honey)", hex: "#AF6B5D", preview: "#AF6B5D" }
    ],
    details: "Formulated with an exclusive L.Y.G. Complex (Lycopene, Olive Oil, Vitamins A & E) for plush, suede-soft lips."
  },
  {
    id: "prod-7",
    brand: "Rare Beauty by Selena Gomez",
    name: "Soft Pinch Liquid Blush",
    rating: 4.8,
    reviewsCount: "19.3k",
    price: 2400,
    originalPrice: 2400,
    discount: "Exclusive",
    category: "Blush",
    finish: "Radiant Dewy",
    image: "assets/images/rare-blush.jpg",
    tag: "TIKTOK VIRAL",
    colorFamily: "Blush",
    shades: [
      { id: "s-701", name: "Joy (Muted Peach Dewy)", hex: "#E07B67", preview: "#E07B67" },
      { id: "s-702", name: "Hope (Nude Mauve Dewy)", hex: "#CD7F84", preview: "#CD7F84" },
      { id: "s-703", name: "Happy (Cool Dewy Pink)", hex: "#E57790", preview: "#E57790" }
    ],
    details: "Weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush."
  },
  {
    id: "prod-8",
    brand: "Maybelline New York",
    name: "Lash Sensational Sky High Mascara",
    rating: 4.6,
    reviewsCount: "44.1k",
    price: 639,
    originalPrice: 799,
    discount: "20% Off",
    category: "Eyes",
    finish: "Full Volume & Length",
    image: "assets/images/maybelline-mascara.jpg",
    tag: "BESTSELLER",
    colorFamily: "Eyes",
    shades: [
      { id: "s-801", name: "Very Black (Waterproof)", hex: "#111111", preview: "#111111" }
    ],
    details: "Exclusive Flex Tower brush bends to volumize and extend every lash from root to tip. Bamboo extract infused."
  },
  {
    id: "prod-9",
    brand: "Kay Beauty",
    name: "24 HR Coloured Matte Kajal",
    rating: 4.5,
    reviewsCount: "16.8k",
    price: 349,
    originalPrice: 449,
    discount: "22% Off",
    category: "Eyes",
    finish: "Intense Smudge-proof Matte",
    image: "assets/images/kay-kajal.jpg",
    tag: "KAY MUST-HAVE",
    colorFamily: "Eyes",
    shades: [
      { id: "s-901", name: "Spade (True Pitch Black)", hex: "#151515", preview: "#151515" },
      { id: "s-902", name: "Earth (Deep Walnut Brown)", hex: "#42281D", preview: "#42281D" }
    ],
    details: "100% waterproof and smudge-proof formula enriched with Chamomile and Ceramide to soothe delicate waterlines."
  },
  {
    id: "prod-10",
    brand: "Lakme",
    name: "Absolute Explore Eyeshadow Palette",
    rating: 4.3,
    reviewsCount: "8.5k",
    price: 896,
    originalPrice: 1195,
    discount: "25% Off",
    category: "Eyes",
    finish: "Velvet Shimmer & Matte",
    image: "assets/images/eyeshadow-palette.jpg",
    tag: "TRENDING",
    colorFamily: "Eyeshadow",
    shades: [
      { id: "s-1001", name: "Sunset Sunrise (12 Warm Tones)", hex: "#C46244", preview: "#C46244" }
    ],
    details: "Highly blendable buttery pigments that offer intense one-swipe color payoff in versatile warm nudes and shimmers."
  },
  {
    id: "prod-11",
    brand: "Estée Lauder",
    name: "Double Wear Stay-in-Place Makeup SPF 10",
    rating: 4.7,
    reviewsCount: "18.2k",
    price: 3900,
    originalPrice: 4200,
    discount: "Nykaa Luxe",
    category: "Face",
    finish: "Flawless Natural Matte",
    image: "assets/images/foundation.jpg",
    tag: "CULT FAVORITE",
    colorFamily: "Foundation",
    shades: [
      { id: "s-1101", name: "2W2 Rattan (Medium Warm)", hex: "#D6A374", preview: "#D6A374" },
      { id: "s-1102", name: "3W1 Tawny (Medium Deep Warm)", hex: "#C78E5E", preview: "#C78E5E" },
      { id: "s-1103", name: "1W2 Sand (Light Warm)", hex: "#E2B488", preview: "#E2B488" }
    ],
    details: "24-hour liquid foundation with medium-to-full buildable coverage. Heat, humidity, and water resistant."
  },
  {
    id: "prod-12",
    brand: "Lakme",
    name: "9 to 5 Primer + Matte Lipstick",
    rating: 4.4,
    reviewsCount: "26.3k",
    price: 450,
    originalPrice: 550,
    discount: "18% Off",
    category: "Lipstick",
    finish: "Smooth Primer Matte",
    image: "assets/images/lakme-lipstick.jpg",
    tag: "DAILY ESSENTIAL",
    colorFamily: "Peach / Nude",
    shades: [
      { id: "s-1201", name: "Rosy Sunday (Warm Petal Pink)", hex: "#C06471", preview: "#C06471" },
      { id: "s-1202", name: "Coffee Command (Soft Nude Brown)", hex: "#945648", preview: "#945648" },
      { id: "s-1203", name: "Maple Map (Spiced Cinnamon)", hex: "#A85341", preview: "#A85341" }
    ],
    details: "Built-in primer smooths fine lip lines and holds saturated colour for 12 comfortable, non-drying hours."
  }
];

// Curated preset inspiration looks for instant one-click testing
const PRESET_LOOKS = [
  {
    id: "look-berry",
    title: "Editorial Berry Glam",
    subtitle: "Bold Plum Lips & Soft Satin Skin",
    image: "assets/images/look-berry.jpg",
    tags: ["Bold", "Evening", "Winter Radiance"],
    primaryLipHex: "#8A2B43",
    dominantShadeName: "Deep Berry Plum",
    features: {
      lips: {
        detected: "Deep Berry Satin Matte",
        hex: "#8A2B43",
        undertone: "Cool Blue-Red Undertone",
        finish: "Velvet Matte Finish",
        confidence: "98%"
      },
      eyes: {
        detected: "Subtle Cocoa Contour & Defined Lashes",
        hex: "#3B2720",
        finish: "Smudged Lashline & Volumized Lift",
        confidence: "94%"
      },
      cheeks: {
        detected: "Soft Neutral Rose Flush",
        hex: "#CD7F84",
        finish: "Natural Satin Glow",
        confidence: "91%"
      },
      skin: {
        detected: "Hydrated Semi-Matte Complexion",
        finish: "Medium Coverage Porcelain Base",
        confidence: "96%"
      }
    },
    recommendedProductIds: ["prod-1", "prod-2", "prod-8", "prod-7", "prod-11"],
    recommendedShades: {
      "prod-1": "s-102", // Kay Beauty Wildchild
      "prod-2": "s-204", // Maybelline Lippy
      "prod-7": "s-702", // Rare Beauty Hope
      "prod-8": "s-801",
      "prod-11": "s-1101"
    }
  },
  {
    id: "look-peachy",
    title: "Clean Girl Peachy Nude",
    subtitle: "Everyday Soft Glow & Nude Peach Lips",
    image: "assets/images/look-peachy.jpg",
    tags: ["Fresh", "Workwear", "Minimalist"],
    primaryLipHex: "#C7685D",
    dominantShadeName: "Warm Peachy Nude",
    features: {
      lips: {
        detected: "Warm Peach Nude with Soft Gloss",
        hex: "#C7685D",
        undertone: "Warm Peach Undertone",
        finish: "Vinyl Moisture Glow",
        confidence: "99%"
      },
      eyes: {
        detected: "Natural Curled Lashes & Neutral Beige Lid",
        hex: "#B08A72",
        finish: "No-Makeup Makeup",
        confidence: "93%"
      },
      cheeks: {
        detected: "Sunlit Peach Dew",
        hex: "#E07B67",
        finish: "Dewy Glass Skin Flush",
        confidence: "95%"
      },
      skin: {
        detected: "Fresh Luminous Skin",
        finish: "Light Radiant Tint",
        confidence: "97%"
      }
    },
    recommendedProductIds: ["prod-2", "prod-4", "prod-7", "prod-8", "prod-12"],
    recommendedShades: {
      "prod-2": "s-201", // Maybelline Peachy
      "prod-4": "s-401", // Charlotte Pillow Talk
      "prod-7": "s-701", // Rare Beauty Joy
      "prod-8": "s-801",
      "prod-12": "s-1201"
    }
  },
  {
    id: "look-crimson",
    title: "Iconic Red Carpet Crimson",
    subtitle: "Statement Matte Red & Winged Definition",
    image: "assets/images/look-crimson.jpg",
    tags: ["High Glam", "Festive", "Cocktail"],
    primaryLipHex: "#BC1D35",
    dominantShadeName: "Vivid Ruby Crimson",
    features: {
      lips: {
        detected: "Iconic Cool-Toned Red Matte",
        hex: "#BC1D35",
        undertone: "Blue-Red Classic Contrast",
        finish: "Zero-Sheen Ultra Matte",
        confidence: "99%"
      },
      eyes: {
        detected: "Crisp Black Eyeliner & Wing Flick",
        hex: "#111111",
        finish: "Sharp Graphic Line",
        confidence: "96%"
      },
      cheeks: {
        detected: "Delicate Chiseled Bronze Rose",
        hex: "#C27E74",
        finish: "Sculpted Warmth",
        confidence: "92%"
      },
      skin: {
        detected: "Full Flawless Matte Base",
        finish: "High Definition Camera Ready",
        confidence: "98%"
      }
    },
    recommendedProductIds: ["prod-3", "prod-5", "prod-9", "prod-8", "prod-11"],
    recommendedShades: {
      "prod-3": "s-301", // MAC Ruby Woo
      "prod-5": "s-504", // Nykaa Rukmini
      "prod-9": "s-901", // Kay Black Kajal
      "prod-8": "s-801",
      "prod-11": "s-1102"
    }
  },
  {
    id: "look-terracotta",
    title: "Warm Spiced Terracotta",
    subtitle: "Earthy Warm Lips & Bronzed Eyes",
    image: "assets/images/look-terracotta.jpg",
    tags: ["Boho Warmth", "Autumn", "Golden Hour"],
    primaryLipHex: "#BC5A45",
    dominantShadeName: "Spiced Cinnamon Terracotta",
    features: {
      lips: {
        detected: "Warm Spiced Clay Terracotta",
        hex: "#BC5A45",
        undertone: "Warm Rust & Brick",
        finish: "Comfort Velvet Matte",
        confidence: "97%"
      },
      eyes: {
        detected: "Warm Sunset Shimmer & Deep Lashline",
        hex: "#874D38",
        finish: "Amber Shimmer Wash",
        confidence: "94%"
      },
      cheeks: {
        detected: "Terracotta Apricot Contour",
        hex: "#C76E55",
        finish: "Sun-Drenched Warm Flush",
        confidence: "93%"
      },
      skin: {
        detected: "Golden Olive Dewy Base",
        finish: "Luminous Healthy Complexion",
        confidence: "95%"
      }
    },
    recommendedProductIds: ["prod-1", "prod-5", "prod-10", "prod-7", "prod-12"],
    recommendedShades: {
      "prod-1": "s-103", // Kay Chartbuster
      "prod-5": "s-502", // Nykaa Chai
      "prod-10": "s-1001", // Sunset Sunrise
      "prod-7": "s-701",
      "prod-12": "s-1203"
    }
  }
];
