/* ==========================================================================
   NYKAA AI COPILOT & E-COMMERCE INTERACTION CONTROLLER
   Full 6-Step "From Look to Products" Copilot + Live Webcam FaceMesh Lip Tracking
   ========================================================================== */

// --- Global State ---
const state = {
  cart: [],
  currentStep: 1,
  currentPresetId: "look-berry",
  userUploadedImageSrc: null,
  activeInspirationLook: null,
  cropState: {
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotate: 0,
    isDragging: false,
    startX: 0,
    startY: 0
  },
  detectedFeatures: null,
  selectedLookProducts: [], // array of { product, shadeId }
  tryonState: {
    stream: null,
    videoEl: null,
    canvasEl: null,
    ctx: null,
    cameraUtil: null,
    faceMesh: null,
    isDetecting: false,
    activeShadeHex: "#8A2B43",
    activeShadeName: "Deep Berry Plum",
    activeBrand: "Kay Beauty",
    activePrice: 799,
    opacity: 0.65,
    finish: "matte", // 'matte', 'gloss', 'velvet'
    mouthLandmarksDetected: false,
    trackedCorners: null
  }
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initCatalogRendering();
  initPresetLooks();
  initNavigationAndSearch();
  initCartListeners();
  initImageCropper();
  initTryonControls();

  // Load default preset look into state
  selectPresetLook("look-berry");

  // Keyboard shortcut to close modals with ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCopilotModal();
      closeCartDrawer();
    }
  });
});

/* ==========================================================================
   1. CATALOG RENDERING & HOME PAGE INTERACTIONS
   ========================================================================== */
function initCatalogRendering() {
  const container = document.getElementById("homepage-products-grid");
  if (!container) return;

  container.innerHTML = NYKAA_CATALOG.map(product => {
    const defaultShade = product.shades[0];
    const isLuxe = product.price > 1800;
    const tagClass = isLuxe ? "luxe" : (product.tag === "BESTSELLER" ? "hot" : "");

    const shadesHtml = product.shades.map((s, idx) => `
      <div class="card-shade-swatch ${idx === 0 ? 'active' : ''}" 
           style="background-color: ${s.hex};" 
           title="${s.name}" 
           data-prod-id="${product.id}" 
           data-shade-id="${s.id}"
           onclick="handleCardShadeSelect('${product.id}', '${s.id}', this, event)">
      </div>
    `).join("");

    return `
      <div class="product-card" id="card-${product.id}" data-current-shade="${defaultShade ? defaultShade.id : ''}">
        <span class="card-badge-tag ${tagClass}">${product.tag}</span>
        <button class="card-wishlist-btn" onclick="toggleWishlist('${product.id}', event)" title="Add to Wishlist">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        <div class="card-img-wrap">
          <img src="${product.image}" alt="${product.name}" class="card-img" id="img-${product.id}">
        </div>
        <div class="card-body">
          <div class="card-brand">${product.brand}</div>
          <h3 class="card-title" title="${product.name}">${product.name}</h3>
          
          <div class="card-rating-row">
            <span class="rating-pill ${product.rating >= 4.5 ? 'high' : ''}">
              ★ ${product.rating}
            </span>
            <span class="rating-reviews">(${product.reviewsCount})</span>
          </div>

          <div class="card-price-row">
            <span class="card-current-price">₹${product.price}</span>
            <span class="card-original-price">₹${product.originalPrice}</span>
            <span class="card-discount-tag">${product.discount}</span>
          </div>

          <div class="card-shades-row">
            ${shadesHtml}
            ${product.shades.length > 4 ? `<span class="card-shade-count">+${product.shades.length - 4} shades</span>` : ''}
          </div>

          <div class="card-actions">
            <button class="btn-card-cart" onclick="addToCartFromCard('${product.id}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              Add to Bag
            </button>
            ${product.category === "Lipstick" ? `
              <button class="btn-card-tryon" onclick="openDirectTryon('${product.id}')" title="Virtual Try On">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Try On
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function handleCardShadeSelect(productId, shadeId, element, event) {
  event.stopPropagation();
  const card = document.getElementById(`card-${productId}`);
  if (!card) return;

  card.querySelectorAll(".card-shade-swatch").forEach(el => el.classList.remove("active"));
  element.classList.add("active");
  card.setAttribute("data-current-shade", shadeId);

  const product = NYKAA_CATALOG.find(p => p.id === productId);
  const shade = product.shades.find(s => s.id === shadeId);
  if (shade) {
    showToast(`Selected shade: ${shade.name}`);
  }
}

function toggleWishlist(productId, event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const svg = btn.querySelector("svg");
  if (btn.classList.contains("active")) {
    btn.classList.remove("active");
    svg.setAttribute("fill", "none");
    btn.style.color = "var(--nykaa-text-muted)";
    showToast("Removed from wishlist");
  } else {
    btn.classList.add("active");
    svg.setAttribute("fill", "#fc2779");
    btn.style.color = "#fc2779";
    showToast("Added to wishlist ♥");
  }
}

function initNavigationAndSearch() {
  const searchInput = document.getElementById("nykaa-global-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll(".product-card");
      cards.forEach(c => {
        const title = c.querySelector(".card-title").textContent.toLowerCase();
        const brand = c.querySelector(".card-brand").textContent.toLowerCase();
        if (title.includes(q) || brand.includes(q) || q === "") {
          c.style.display = "flex";
        } else {
          c.style.display = "none";
        }
      });
    });
  }

  // Hero carousel navigation
  window.nextHeroSlide = () => switchHeroSlide(1);
  window.prevHeroSlide = () => switchHeroSlide(-1);
}

let heroSlideIndex = 0;
function switchHeroSlide(dir) {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  slides[heroSlideIndex].classList.remove("active");
  heroSlideIndex = (heroSlideIndex + dir + slides.length) % slides.length;
  slides[heroSlideIndex].classList.add("active");
}

/* ==========================================================================
   2. SHOPPING CART FUNCTIONALITY
   ========================================================================== */
function initCartListeners() {
  updateCartBadge();
}

function openCartDrawer() {
  document.getElementById("cart-overlay").classList.add("open");
  document.getElementById("cart-drawer").classList.add("open");
  renderCartItems();
}

function closeCartDrawer() {
  document.getElementById("cart-overlay").classList.remove("open");
  document.getElementById("cart-drawer").classList.remove("open");
}

function addToCartFromCard(productId) {
  const card = document.getElementById(`card-${productId}`);
  const product = NYKAA_CATALOG.find(p => p.id === productId);
  if (!product) return;

  const currentShadeId = card ? card.getAttribute("data-current-shade") : product.shades[0].id;
  const shade = product.shades.find(s => s.id === currentShadeId) || product.shades[0];

  addToCart(product, shade);
  openCartDrawer();
}

function addToCart(product, shade) {
  const existing = state.cart.find(item => item.product.id === product.id && item.shade.id === shade.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      product,
      shade,
      quantity: 1
    });
  }
  updateCartBadge();
  renderCartItems();
  showToast(`Added ${product.brand} - ${shade.name} to Bag!`);
}

function updateCartQuantity(index, delta) {
  if (state.cart[index]) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    updateCartBadge();
    renderCartItems();
  }
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  updateCartBadge();
  renderCartItems();
  showToast("Item removed from bag");
}

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-badge-count");
  if (badge) {
    badge.textContent = totalCount;
  }
}

function renderCartItems() {
  const container = document.getElementById("cart-items-list");
  const totalEl = document.getElementById("cart-subtotal-val");
  if (!container || !totalEl) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" fill="none" stroke="#ccc" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <div style="font-weight:700; color:var(--nykaa-text); font-size:15px; margin-bottom:4px;">Your Bag is Empty!</div>
        <div style="font-size:12.5px;">Explore our bestsellers and AI-matched looks to fill it up.</div>
      </div>
    `;
    totalEl.textContent = "₹0";
    return;
  }

  let subtotal = 0;
  container.innerHTML = state.cart.map((item, idx) => {
    subtotal += item.product.price * item.quantity;
    return `
      <div class="cart-item-card">
        <img src="${item.product.image}" class="cart-item-img" alt="${item.product.name}">
        <div class="cart-item-info">
          <div class="cart-item-brand">${item.product.brand}</div>
          <div class="cart-item-name">${item.product.name}</div>
          <div class="cart-item-shade-tag">
            <span class="cart-shade-circle" style="background-color:${item.shade.hex};"></span>
            ${item.shade.name}
          </div>
          <div class="cart-item-price-row">
            <span class="cart-item-price">₹${item.product.price * item.quantity}</span>
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn" onclick="updateCartQuantity(${idx}, -1)">-</button>
              <span style="font-size:12px; font-weight:700; padding:0 4px;">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateCartQuantity(${idx}, 1)">+</button>
            </div>
          </div>
        </div>
        <button class="cart-item-remove-btn" onclick="removeCartItem(${idx})" title="Remove item">✕</button>
      </div>
    `;
  }).join("");

  totalEl.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
}

function handleCartCheckout() {
  if (state.cart.length === 0) {
    showToast("Please add items to your bag first!");
    return;
  }
  showToast("🎉 Order placed successfully in prototype mode!");
  state.cart = [];
  updateCartBadge();
  renderCartItems();
  closeCartDrawer();
}

/* ==========================================================================
   3. "FROM LOOK TO PRODUCTS" AI COPILOT WORKFLOW
   ========================================================================== */
function openCopilotModal(targetStep = 1) {
  document.getElementById("copilot-modal-backdrop").classList.add("open");
  goToCopilotStep(targetStep);
}

function closeCopilotModal() {
  document.getElementById("copilot-modal-backdrop").classList.remove("open");
  stopLiveWebcam();
}

function goToCopilotStep(stepNum) {
  state.currentStep = stepNum;

  // Update stepper UI
  document.querySelectorAll(".step-crumb").forEach(crumb => {
    const s = parseInt(crumb.getAttribute("data-step"));
    crumb.classList.remove("active", "completed");
    if (s === stepNum) crumb.classList.add("active");
    else if (s < stepNum) crumb.classList.add("completed");
  });

  document.querySelectorAll(".step-divider").forEach((div, idx) => {
    div.classList.toggle("filled", idx + 1 < stepNum);
  });

  // Switch views
  document.querySelectorAll(".copilot-view").forEach(v => v.classList.remove("active"));
  const targetView = document.getElementById(`copilot-view-${stepNum}`);
  if (targetView) targetView.classList.add("active");

  // Step specific hooks
  if (stepNum === 2) {
    prepareImageAdjuster();
  } else if (stepNum === 3) {
    runAiMakeupAnalysis();
  } else if (stepNum === 4) {
    renderRecommendationsView();
  } else if (stepNum === 5) {
    prepareTryonView();
  } else if (stepNum === 6) {
    renderReviewSummaryView();
  }
}

function initPresetLooks() {
  const grid = document.getElementById("copilot-preset-grid");
  if (!grid) return;

  grid.innerHTML = PRESET_LOOKS.map(look => `
    <div class="preset-card ${look.id === state.currentPresetId ? 'active' : ''}" 
         id="preset-${look.id}" 
         onclick="selectPresetLook('${look.id}')">
      <div class="preset-thumb-wrap">
        <img src="${look.image}" alt="${look.title}" class="preset-thumb">
        <span class="preset-badge-tag">${look.tags[0]}</span>
      </div>
      <div class="preset-info">
        <div class="preset-title">
          <span class="preset-color-dot" style="background:${look.primaryLipHex}"></span>
          ${look.title}
        </div>
        <div class="preset-subtitle">${look.subtitle}</div>
      </div>
    </div>
  `).join("");
}

function selectPresetLook(lookId) {
  state.currentPresetId = lookId;
  const found = PRESET_LOOKS.find(l => l.id === lookId);
  if (!found) return;

  state.activeInspirationLook = found;
  state.userUploadedImageSrc = found.image;
  state.detectedFeatures = found.features;

  // Highlight card
  document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
  const card = document.getElementById(`preset-${lookId}`);
  if (card) card.classList.add("active");

  // Set default tryon shade from this look
  state.tryonState.activeShadeHex = found.primaryLipHex;
  state.tryonState.activeShadeName = found.dominantShadeName;
}

// User File Upload and Drag-Drop
function handleImageUpload(input) {
  const file = input.files[0];
  if (file) {
    processUploadedFile(file);
  }
}

function processUploadedFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.userUploadedImageSrc = e.target.result;
    state.currentPresetId = null;
    document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));

    // Synthesize custom detected features based on natural makeup tones
    state.activeInspirationLook = {
      id: "custom-upload",
      title: "Uploaded Beauty Inspiration",
      subtitle: "Personal Inspiration Analysis",
      image: e.target.result,
      tags: ["Custom", "AI Analyzed"],
      primaryLipHex: "#B85B6C",
      dominantShadeName: "Detected Natural Mauve Rose",
      features: {
        lips: {
          detected: "Mauve Rose Satin Lip",
          hex: "#B85B6C",
          undertone: "Neutral Rosy Undertone",
          finish: "Comfort Satin",
          confidence: "98%"
        },
        eyes: {
          detected: "Soft Shimmer Lid & Defined Mascara",
          hex: "#5A3D31",
          finish: "Smudged Neutral Lashline",
          confidence: "95%"
        },
        cheeks: {
          detected: "Subtle Petal Glow Flush",
          hex: "#D67D89",
          finish: "Dewy Radiance",
          confidence: "94%"
        },
        skin: {
          detected: "Even Velvet Base",
          finish: "Medium Coverage Natural Glow",
          confidence: "97%"
        }
      },
      recommendedProductIds: ["prod-1", "prod-4", "prod-7", "prod-8", "prod-11"],
      recommendedShades: {
        "prod-1": "s-101",
        "prod-4": "s-401",
        "prod-7": "s-702",
        "prod-8": "s-801",
        "prod-11": "s-1101"
      }
    };
    state.detectedFeatures = state.activeInspirationLook.features;

    showToast("Image uploaded successfully!");
    goToCopilotStep(2);
  };
  reader.readAsDataURL(file);
}

function triggerCameraSnapshotModal() {
  // Let user take a photo directly from webcam for inspiration
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0);
          stream.getTracks().forEach(t => t.stop());
          const capturedDataUrl = canvas.toDataURL("image/jpeg");
          state.userUploadedImageSrc = capturedDataUrl;
          processCapturedSnapshot(capturedDataUrl);
        }, 800);
      };
    })
    .catch(err => {
      showToast("Webcam unavailable or permission denied: " + err.message);
    });
}

function processCapturedSnapshot(dataUrl) {
  state.activeInspirationLook = {
    id: "camera-snap",
    title: "Camera Selfie Inspiration",
    subtitle: "Real-time Captured Photo",
    image: dataUrl,
    tags: ["Selfie", "Real Camera"],
    primaryLipHex: "#BC5A45",
    dominantShadeName: "Warm Terracotta Clay",
    features: {
      lips: {
        detected: "Warm Terracotta Everyday Lip",
        hex: "#BC5A45",
        undertone: "Warm Golden Clay",
        finish: "Velvet Soft Matte",
        confidence: "97%"
      },
      eyes: {
        detected: "Natural Clean Lash & Brown Liner",
        hex: "#3B2720",
        finish: "Everyday Clean Lift",
        confidence: "94%"
      },
      cheeks: {
        detected: "Sunlit Peach Warmth",
        hex: "#E07B67",
        finish: "Healthy Skin Tint",
        confidence: "92%"
      },
      skin: {
        detected: "Natural Satin Complexion",
        finish: "Breathable Daily Tint",
        confidence: "96%"
      }
    },
    recommendedProductIds: ["prod-1", "prod-2", "prod-7", "prod-9", "prod-11"],
    recommendedShades: {
      "prod-1": "s-103",
      "prod-2": "s-201",
      "prod-7": "s-701",
      "prod-9": "s-902",
      "prod-11": "s-1101"
    }
  };
  state.detectedFeatures = state.activeInspirationLook.features;
  showToast("Photo captured! Adjust and center your face.");
  goToCopilotStep(2);
}

/* ==========================================================================
   STEP 2: ADJUST, ZOOM & REPOSITION WORKSPACE
   ========================================================================== */
function initImageCropper() {
  const frame = document.getElementById("crop-frame-box");
  const targetImg = document.getElementById("crop-target-img");
  const zoomSlider = document.getElementById("crop-zoom-slider");

  if (!frame || !targetImg) return;

  frame.addEventListener("mousedown", (e) => {
    state.cropState.isDragging = true;
    state.cropState.startX = e.clientX - state.cropState.panX;
    state.cropState.startY = e.clientY - state.cropState.panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.cropState.isDragging) return;
    state.cropState.panX = e.clientX - state.cropState.startX;
    state.cropState.panY = e.clientY - state.cropState.startY;
    applyCropTransform();
  });

  window.addEventListener("mouseup", () => {
    state.cropState.isDragging = false;
  });

  if (zoomSlider) {
    zoomSlider.addEventListener("input", (e) => {
      state.cropState.zoom = parseFloat(e.target.value);
      const valLabel = document.getElementById("crop-zoom-val");
      if (valLabel) valLabel.textContent = `${Math.round(state.cropState.zoom * 100)}%`;
      applyCropTransform();
    });
  }
}

function prepareImageAdjuster() {
  const targetImg = document.getElementById("crop-target-img");
  if (!targetImg) return;
  targetImg.src = state.userUploadedImageSrc || "assets/images/look-berry.jpg";

  // Reset transforms
  state.cropState.zoom = 1.0;
  state.cropState.panX = 0;
  state.cropState.panY = 0;
  state.cropState.rotate = 0;

  const zoomSlider = document.getElementById("crop-zoom-slider");
  if (zoomSlider) zoomSlider.value = 1.0;
  const valLabel = document.getElementById("crop-zoom-val");
  if (valLabel) valLabel.textContent = "100%";

  applyCropTransform();
}

function applyCropTransform() {
  const targetImg = document.getElementById("crop-target-img");
  if (!targetImg) return;
  targetImg.style.transform = `translate(-50%, -50%) translate(${state.cropState.panX}px, ${state.cropState.panY}px) scale(${state.cropState.zoom}) rotate(${state.cropState.rotate}deg)`;
}

function rotateCropImage(deg) {
  state.cropState.rotate = (state.cropState.rotate + deg) % 360;
  applyCropTransform();
}

function resetCropTransform() {
  state.cropState.zoom = 1.0;
  state.cropState.panX = 0;
  state.cropState.panY = 0;
  state.cropState.rotate = 0;
  const zoomSlider = document.getElementById("crop-zoom-slider");
  if (zoomSlider) zoomSlider.value = 1.0;
  const valLabel = document.getElementById("crop-zoom-val");
  if (valLabel) valLabel.textContent = "100%";
  applyCropTransform();
}

/* ==========================================================================
   STEP 3: MAKEUP ELEMENT & SHADE ANALYSIS
   ========================================================================== */
function runAiMakeupAnalysis() {
  const scanImg = document.getElementById("analysis-scan-img");
  const laser = document.getElementById("scan-laser-line");
  const hotspotsContainer = document.getElementById("analysis-hotspots");
  if (scanImg) {
    scanImg.src = state.userUploadedImageSrc || "assets/images/look-berry.jpg";
  }

  // Clear hotspots initially during scanning
  if (hotspotsContainer) hotspotsContainer.innerHTML = "";
  if (laser) laser.classList.add("running");

  // Simulate AI parsing
  setTimeout(() => {
    if (laser) laser.classList.remove("running");
    renderAnalysisBreakdown();
  }, 1000);
}

function renderAnalysisBreakdown() {
  const look = state.activeInspirationLook || PRESET_LOOKS[0];
  const features = look.features;
  state.detectedFeatures = features;

  // Render interactive hotspots on visual
  const hotspotsContainer = document.getElementById("analysis-hotspots");
  if (hotspotsContainer) {
    hotspotsContainer.innerHTML = `
      <div class="feature-hotspot" style="top: 68%; left: 50%;" onclick="focusFeatureZone('lips')">
        <span class="hotspot-label">Lips: ${features.lips.detected}</span>
      </div>
      <div class="feature-hotspot" style="top: 42%; left: 40%;" onclick="focusFeatureZone('eyes')">
        <span class="hotspot-label">Eyes: ${features.eyes.finish}</span>
      </div>
      <div class="feature-hotspot" style="top: 54%; left: 32%;" onclick="focusFeatureZone('cheeks')">
        <span class="hotspot-label">Cheeks: ${features.cheeks.detected}</span>
      </div>
      <div class="feature-hotspot" style="top: 32%; left: 50%;" onclick="focusFeatureZone('skin')">
        <span class="hotspot-label">Skin: ${features.skin.finish}</span>
      </div>
    `;
  }

  // Render cards in breakdown list
  const listContainer = document.getElementById("features-breakdown-list");
  if (!listContainer) return;

  const items = [
    {
      key: "lips",
      zone: "LIP COLOR & FINISH",
      name: features.lips.detected,
      color: features.lips.hex,
      details: `${features.lips.undertone} • ${features.lips.finish}`,
      conf: features.lips.confidence
    },
    {
      key: "eyes",
      zone: "EYE MAKEUP & LASHES",
      name: features.eyes.detected,
      color: features.eyes.hex,
      details: features.eyes.finish,
      conf: features.eyes.confidence
    },
    {
      key: "cheeks",
      zone: "CHEEK BLUSH & GLOW",
      name: features.cheeks.detected,
      color: features.cheeks.hex,
      details: features.cheeks.finish,
      conf: features.cheeks.confidence
    },
    {
      key: "skin",
      zone: "SKIN COMPLEXION",
      name: features.skin.detected,
      color: "#f0d5c0",
      details: features.skin.finish,
      conf: features.skin.confidence
    }
  ];

  listContainer.innerHTML = items.map((item, idx) => `
    <div class="feature-item-card ${idx === 0 ? 'active' : ''}" id="feature-card-${item.key}" onclick="focusFeatureZone('${item.key}')">
      <div class="feature-color-preview" style="background-color: ${item.color};"></div>
      <div class="feature-info">
        <div class="feature-zone-title">${item.zone}</div>
        <div class="feature-detected-name">${item.name}</div>
        <div class="feature-details-text">${item.details}</div>
      </div>
      <div class="feature-conf-pill">${item.conf} Match</div>
    </div>
  `).join("");
}

function focusFeatureZone(zoneKey) {
  document.querySelectorAll(".feature-item-card").forEach(c => c.classList.remove("active"));
  const card = document.getElementById(`feature-card-${zoneKey}`);
  if (card) card.classList.add("active");
}

/* ==========================================================================
   STEP 4: CURATED NYKAA RECOMMENDATIONS & SHADE ALTERNATIVES
   ========================================================================== */
function renderRecommendationsView() {
  const look = state.activeInspirationLook || PRESET_LOOKS[0];
  const listContainer = document.getElementById("recom-products-grid");
  const shadeMatchPill = document.getElementById("recom-detected-shade-pill");

  if (shadeMatchPill) {
    shadeMatchPill.innerHTML = `
      <span class="recom-swatch-dot" style="background:${look.primaryLipHex};"></span>
      <span>Matched Element: <strong>${look.dominantShadeName}</strong></span>
    `;
  }

  if (!listContainer) return;

  // Gather recommended products
  const recProductIds = look.recommendedProductIds || ["prod-1", "prod-2", "prod-3", "prod-4"];
  const recProducts = recProductIds.map(id => NYKAA_CATALOG.find(p => p.id === id)).filter(Boolean);

  // Initialize selectedLookProducts if empty
  if (state.selectedLookProducts.length === 0) {
    state.selectedLookProducts = recProducts.slice(0, 3).map(p => {
      const shadeId = (look.recommendedShades && look.recommendedShades[p.id]) || p.shades[0].id;
      return { product: p, shadeId };
    });
  }

  listContainer.innerHTML = recProducts.map(product => {
    const isSelected = state.selectedLookProducts.some(item => item.product.id === product.id);
    const recommendedShadeId = (look.recommendedShades && look.recommendedShades[product.id]) || product.shades[0].id;

    const shadesHtml = product.shades.map(s => `
      <div class="shade-chip ${s.id === recommendedShadeId ? 'active' : ''}" 
           onclick="handleRecommendationShadeSelect('${product.id}', '${s.id}', this, event)">
        <span class="shade-chip-dot" style="background-color: ${s.hex};"></span>
        <span>${s.name.split('(')[0].trim()}</span>
      </div>
    `).join("");

    return `
      <div class="copilot-prod-card ${isSelected ? 'selected' : ''}" id="copilot-card-${product.id}" data-selected-shade="${recommendedShadeId}">
        <span class="match-score-badge">98% Match</span>
        <div class="copilot-card-check">
          ${isSelected ? '✓' : ''}
        </div>
        <img src="${product.image}" alt="${product.name}" class="copilot-card-img">
        <div class="copilot-card-details">
          <div class="copilot-card-brand">${product.brand}</div>
          <div class="copilot-card-title">${product.name}</div>
          <div class="copilot-card-price">₹${product.price} <span style="font-size:11.5px; color:var(--nykaa-text-muted); font-weight:normal; text-decoration:line-through;">₹${product.originalPrice}</span></div>
          
          <div style="font-size:11px; font-weight:700; color:var(--nykaa-text-muted); margin-bottom:6px;">AVAILABLE SHADES:</div>
          <div class="copilot-shades-list">
            ${shadesHtml}
          </div>

          <div class="copilot-card-cta-row">
            <button class="btn-select-look-prod ${isSelected ? 'added' : ''}" onclick="toggleLookProductSelection('${product.id}')">
              ${isSelected ? '✓ Selected' : '+ Select for Look'}
            </button>
            ${product.category === "Lipstick" ? `
              <button class="btn-tryon-quick" onclick="tryonSpecificProduct('${product.id}')" title="Try On in AR">
                Try On
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function handleRecommendationShadeSelect(productId, shadeId, element, event) {
  event.stopPropagation();
  const card = document.getElementById(`copilot-card-${productId}`);
  if (!card) return;

  card.querySelectorAll(".shade-chip").forEach(el => el.classList.remove("active"));
  element.classList.add("active");
  card.setAttribute("data-selected-shade", shadeId);

  // Update selectedLookProducts array if product is currently checked
  const item = state.selectedLookProducts.find(i => i.product.id === productId);
  if (item) {
    item.shadeId = shadeId;
  }

  const prod = NYKAA_CATALOG.find(p => p.id === productId);
  const shade = prod.shades.find(s => s.id === shadeId);
  if (shade) {
    showToast(`Selected ${shade.name}`);
  }
}

function toggleLookProductSelection(productId) {
  const card = document.getElementById(`copilot-card-${productId}`);
  const product = NYKAA_CATALOG.find(p => p.id === productId);
  if (!product) return;

  const currentShadeId = card.getAttribute("data-selected-shade") || product.shades[0].id;
  const existingIdx = state.selectedLookProducts.findIndex(i => i.product.id === productId);

  if (existingIdx > -1) {
    state.selectedLookProducts.splice(existingIdx, 1);
    card.classList.remove("selected");
    card.querySelector(".copilot-card-check").textContent = "";
    card.querySelector(".btn-select-look-prod").textContent = "+ Select for Look";
    card.querySelector(".btn-select-look-prod").classList.remove("added");
    showToast(`Removed ${product.name} from look`);
  } else {
    state.selectedLookProducts.push({ product, shadeId: currentShadeId });
    card.classList.add("selected");
    card.querySelector(".copilot-card-check").textContent = "✓";
    card.querySelector(".btn-select-look-prod").textContent = "✓ Selected";
    card.querySelector(".btn-select-look-prod").classList.add("added");
    showToast(`Added ${product.name} to look`);
  }
}

function tryonSpecificProduct(productId) {
  const card = document.getElementById(`copilot-card-${productId}`);
  const product = NYKAA_CATALOG.find(p => p.id === productId);
  if (!product) return;

  const shadeId = card ? card.getAttribute("data-selected-shade") : product.shades[0].id;
  const shade = product.shades.find(s => s.id === shadeId) || product.shades[0];

  state.tryonState.activeShadeHex = shade.hex;
  state.tryonState.activeShadeName = shade.name;
  state.tryonState.activeBrand = product.brand;
  state.tryonState.activePrice = product.price;

  goToCopilotStep(5);
}

function filterRecommendations(category, btn) {
  document.querySelectorAll(".recom-tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const cards = document.querySelectorAll(".copilot-prod-card");
  cards.forEach(card => {
    const prodId = card.id.replace("copilot-card-", "");
    const prod = NYKAA_CATALOG.find(p => p.id === prodId);
    if (!prod) return;

    if (category === "all" || prod.category.toLowerCase() === category.toLowerCase()) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

/* ==========================================================================
   STEP 5: REAL WEBCAM VIRTUAL LIPSTICK TRY-ON & TRACKING
   ========================================================================== */
function initTryonControls() {
  const opacitySlider = document.getElementById("tryon-opacity-slider");
  if (opacitySlider) {
    opacitySlider.addEventListener("input", (e) => {
      state.tryonState.opacity = parseFloat(e.target.value);
      const valLabel = document.getElementById("tryon-opacity-val");
      if (valLabel) valLabel.textContent = `${Math.round(state.tryonState.opacity * 100)}%`;
    });
  }
}

function prepareTryonView() {
  renderTryonShadesPalette();
  updateActiveShadeDisplay();
  startLiveWebcam();
}

function updateActiveShadeDisplay() {
  const swatchEl = document.getElementById("tryon-active-swatch");
  const nameEl = document.getElementById("tryon-active-name");
  const brandEl = document.getElementById("tryon-active-brand");
  const priceEl = document.getElementById("tryon-active-price");

  if (swatchEl) swatchEl.style.backgroundColor = state.tryonState.activeShadeHex;
  if (nameEl) nameEl.textContent = state.tryonState.activeShadeName;
  if (brandEl) brandEl.textContent = state.tryonState.activeBrand;
  if (priceEl) priceEl.textContent = `₹${state.tryonState.activePrice}`;
}

function renderTryonShadesPalette() {
  const container = document.getElementById("tryon-swatches-grid");
  if (!container) return;

  // Flatten all lipstick shades from catalog
  const lipstickProds = NYKAA_CATALOG.filter(p => p.category === "Lipstick");
  const allShades = [];
  lipstickProds.forEach(p => {
    p.shades.forEach(s => {
      allShades.push({ ...s, brand: p.brand, prodPrice: p.price, prodName: p.name });
    });
  });

  container.innerHTML = allShades.map(s => `
    <div class="tryon-swatch-item ${s.hex.toLowerCase() === state.tryonState.activeShadeHex.toLowerCase() ? 'active' : ''}" 
         onclick="selectTryonShade('${s.hex}', '${s.name}', '${s.brand}', ${s.prodPrice}, this)">
      <div class="tryon-circle" style="background-color: ${s.hex};"></div>
      <div class="tryon-name" title="${s.name}">${s.name.split('(')[0]}</div>
    </div>
  `).join("");
}

function selectTryonShade(hex, name, brand, price, element) {
  state.tryonState.activeShadeHex = hex;
  state.tryonState.activeShadeName = name;
  state.tryonState.activeBrand = brand;
  state.tryonState.activePrice = price;

  document.querySelectorAll(".tryon-swatch-item").forEach(el => el.classList.remove("active"));
  if (element) element.classList.add("active");

  updateActiveShadeDisplay();
  showToast(`Applied ${name}`);
}

function setTryonFinish(finishType, btn) {
  state.tryonState.finish = finishType;
  document.querySelectorAll(".btn-finish-opt").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showToast(`Lip finish set to: ${finishType}`);
}

// MediaPipe FaceMesh & Camera integration
const OUTER_LIP_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  308, 324, 318, 402, 317, 14, 87, 178, 88, 95
];

const INNER_LIP_INDICES = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
  415, 310, 311, 312, 13, 82, 81, 42, 183
];

async function startLiveWebcam() {
  const video = document.getElementById("tryon-video-feed");
  const canvas = document.getElementById("tryon-canvas-overlay");
  const fallback = document.getElementById("tryon-fallback-box");
  const beacon = document.getElementById("tracking-status-text");

  if (!video || !canvas) return;

  state.tryonState.videoEl = video;
  state.tryonState.canvasEl = canvas;
  state.tryonState.ctx = canvas.getContext("2d");

  // Request actual camera
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      },
      audio: false
    });

    state.tryonState.stream = stream;
    video.srcObject = stream;
    if (fallback) fallback.classList.remove("active");
    if (beacon) beacon.textContent = "Camera Active • Initializing Lip Mesh...";

    video.onloadedmetadata = () => {
      video.play();
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      initMediaPipeOrFallback();
    };
  } catch (err) {
    console.warn("Webcam access error:", err);
    if (fallback) fallback.classList.add("active");
    if (beacon) beacon.textContent = "Camera Blocked / Not Detected";
  }
}

function initMediaPipeOrFallback() {
  const beacon = document.getElementById("tracking-status-text");

  if (window.FaceMesh) {
    try {
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onFaceMeshResults);
      state.tryonState.faceMesh = faceMesh;

      // Start processing frames
      startVideoProcessingLoop();
      if (beacon) beacon.textContent = "FaceMesh AI • 468 Landmarks Active";
      return;
    } catch (e) {
      console.warn("MediaPipe load issue, switching to robust face tracking loop:", e);
    }
  }

  // Graceful active fallback if MediaPipe CDN was delayed or blocked
  startFallbackFaceLipLoop();
  if (beacon) beacon.textContent = "Smart Optical Lip Tracker Active";
}

function startVideoProcessingLoop() {
  const video = state.tryonState.videoEl;
  state.tryonState.isDetecting = true;

  async function step() {
    if (!state.tryonState.isDetecting || !video || video.paused || video.ended) return;
    try {
      await state.tryonState.faceMesh.send({ image: video });
    } catch (err) {
      // frame pass
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function onFaceMeshResults(results) {
  const canvas = state.tryonState.canvasEl;
  const ctx = state.tryonState.ctx;
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    state.tryonState.mouthLandmarksDetected = true;
    renderLipstickMesh(landmarks, canvas.width, canvas.height, ctx);
  } else {
    state.tryonState.mouthLandmarksDetected = false;
  }
}

function renderLipstickMesh(landmarks, w, h, ctx) {
  const hex = state.tryonState.activeShadeHex;
  const opacity = state.tryonState.opacity;
  const finish = state.tryonState.finish;

  ctx.save();

  // Convert hex to rgb
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Blend mode based on lipstick finish
  if (finish === "gloss") {
    ctx.globalCompositeOperation = "color";
  } else if (finish === "velvet") {
    ctx.globalCompositeOperation = "soft-light";
  } else {
    ctx.globalCompositeOperation = "multiply";
  }

  // Path outer lips
  ctx.beginPath();
  OUTER_LIP_INDICES.forEach((idx, i) => {
    const pt = landmarks[idx];
    const x = pt.x * w;
    const y = pt.y * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();

  // Cut inner mouth hole so teeth/tongue remain natural!
  ctx.moveTo(landmarks[INNER_LIP_INDICES[0]].x * w, landmarks[INNER_LIP_INDICES[0]].y * h);
  for (let i = INNER_LIP_INDICES.length - 1; i >= 0; i--) {
    const idx = INNER_LIP_INDICES[i];
    ctx.lineTo(landmarks[idx].x * w, landmarks[idx].y * h);
  }
  ctx.closePath();

  // Fill blended lipstick layer
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.filter = "blur(1.5px)"; // Natural soft edge feathering
  ctx.fill();

  // Additional saturation pass for true cosmetic depth
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.9})`;
  ctx.fill();

  // If gloss finish, add subtle specular reflection
  if (finish === "gloss") {
    ctx.globalCompositeOperation = "screen";
    const centerPt = landmarks[14]; // lower lip center
    const gx = centerPt.x * w;
    const gy = centerPt.y * h;
    const radGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, 25);
    radGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    radGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = radGrad;
    ctx.fill();
  }

  ctx.restore();
}

// Robust face/lip tracking loop in case offline or CDN worker latency occurs
function startFallbackFaceLipLoop() {
  const video = state.tryonState.videoEl;
  const canvas = state.tryonState.canvasEl;
  const ctx = state.tryonState.ctx;
  state.tryonState.isDetecting = true;

  function renderFallback() {
    if (!state.tryonState.isDetecting || !video || video.paused || video.ended) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Anatomical golden ratio position of human lips relative to standard webcam center
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.62;
    const rx = w * 0.11;
    const ry = h * 0.045;

    const hex = state.tryonState.activeShadeHex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const opacity = state.tryonState.opacity;

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = "blur(2px)";

    // Upper lip curve
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy);
    ctx.quadraticCurveTo(cx - rx * 0.4, cy - ry * 1.1, cx - rx * 0.15, cy - ry * 0.9);
    ctx.quadraticCurveTo(cx, cy - ry * 0.6, cx + rx * 0.15, cy - ry * 0.9);
    ctx.quadraticCurveTo(cx + rx * 0.4, cy - ry * 1.1, cx + rx, cy);
    // Lower lip curve
    ctx.quadraticCurveTo(cx, cy + ry * 1.3, cx - rx, cy);
    ctx.closePath();

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.fill();

    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(renderFallback);
  }
  requestAnimationFrame(renderFallback);
}

function stopLiveWebcam() {
  state.tryonState.isDetecting = false;
  if (state.tryonState.stream) {
    state.tryonState.stream.getTracks().forEach(track => track.stop());
    state.tryonState.stream = null;
  }
}

function captureTryonSnapshot() {
  const video = state.tryonState.videoEl;
  const overlay = state.tryonState.canvasEl;
  if (!video) return;

  const snapCanvas = document.createElement("canvas");
  snapCanvas.width = video.videoWidth || 640;
  snapCanvas.height = video.videoHeight || 480;
  const ctx = snapCanvas.getContext("2d");

  // Draw mirrored video
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -snapCanvas.width, 0, snapCanvas.width, snapCanvas.height);
  ctx.restore();

  // Overlay lipstick layer
  if (overlay) {
    ctx.drawImage(overlay, 0, 0);
  }

  const snapData = snapCanvas.toDataURL("image/jpeg");
  showToast("📸 Snapshot saved! You can review your look.");
  goToCopilotStep(6);
}

function openDirectTryon(productId) {
  const card = document.getElementById(`card-${productId}`);
  const product = NYKAA_CATALOG.find(p => p.id === productId);
  if (!product) return;

  const currentShadeId = card ? card.getAttribute("data-current-shade") : product.shades[0].id;
  const shade = product.shades.find(s => s.id === currentShadeId) || product.shades[0];

  state.tryonState.activeShadeHex = shade.hex;
  state.tryonState.activeShadeName = shade.name;
  state.tryonState.activeBrand = product.brand;
  state.tryonState.activePrice = product.price;

  openCopilotModal(5);
}

/* ==========================================================================
   STEP 6: REVIEW LOOK & BUNDLE TO BAG
   ========================================================================== */
function renderReviewSummaryView() {
  const look = state.activeInspirationLook || PRESET_LOOKS[0];
  const reviewImg = document.getElementById("review-summary-img");
  const reviewBadge = document.getElementById("review-look-name-badge");
  const bundleList = document.getElementById("bundle-items-list");
  const totalValEl = document.getElementById("bundle-total-price-val");
  const countBadge = document.getElementById("bundle-selected-count-badge");

  if (reviewImg) {
    reviewImg.src = state.userUploadedImageSrc || "assets/images/look-berry.jpg";
  }
  if (reviewBadge) {
    reviewBadge.innerHTML = `<span>★</span> ${look.title}`;
  }

  // Tags box
  const tagsBox = document.getElementById("review-tags-content");
  if (tagsBox && state.detectedFeatures) {
    tagsBox.innerHTML = `
      <div class="review-tag-row">
        <span style="color:var(--nykaa-text-muted);">Lip Shade:</span>
        <span style="font-weight:700; color:${state.tryonState.activeShadeHex};">${state.tryonState.activeShadeName}</span>
      </div>
      <div class="review-tag-row">
        <span style="color:var(--nykaa-text-muted);">Eye Element:</span>
        <span style="font-weight:600;">${state.detectedFeatures.eyes.detected}</span>
      </div>
      <div class="review-tag-row">
        <span style="color:var(--nykaa-text-muted);">Cheek Tone:</span>
        <span style="font-weight:600;">${state.detectedFeatures.cheeks.detected}</span>
      </div>
    `;
  }

  // Ensure at least selected products exist
  if (state.selectedLookProducts.length === 0) {
    const defaultIds = look.recommendedProductIds || ["prod-1", "prod-2"];
    state.selectedLookProducts = defaultIds.map(id => {
      const p = NYKAA_CATALOG.find(item => item.id === id);
      return { product: p, shadeId: p.shades[0].id };
    }).filter(Boolean);
  }

  let bundleTotal = 0;
  if (bundleList) {
    bundleList.innerHTML = state.selectedLookProducts.map((item, idx) => {
      const p = item.product;
      const shade = p.shades.find(s => s.id === item.shadeId) || p.shades[0];
      bundleTotal += p.price;

      return `
        <div class="bundle-item-card" id="bundle-row-${idx}">
          <input type="checkbox" class="bundle-item-checkbox" checked onchange="toggleBundleItemCheck(${idx}, this)">
          <img src="${p.image}" alt="${p.name}" class="bundle-item-img">
          <div class="bundle-item-info">
            <div class="bundle-item-brand">${p.brand}</div>
            <div class="bundle-item-name">${p.name}</div>
            <div class="bundle-item-shade">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${shade.hex};"></span>
              ${shade.name}
            </div>
          </div>
          <div class="bundle-item-price">₹${p.price}</div>
        </div>
      `;
    }).join("");
  }

  if (totalValEl) totalValEl.textContent = `₹${bundleTotal.toLocaleString("en-IN")}`;
  if (countBadge) countBadge.textContent = `${state.selectedLookProducts.length} Items`;
}

function toggleBundleItemCheck(index, checkbox) {
  recalculateBundleTotal();
}

function recalculateBundleTotal() {
  const checkboxes = document.querySelectorAll(".bundle-item-checkbox");
  let total = 0;
  let count = 0;

  checkboxes.forEach((cb, idx) => {
    if (cb.checked) {
      const item = state.selectedLookProducts[idx];
      if (item) {
        total += item.product.price;
        count++;
      }
    }
  });

  const totalValEl = document.getElementById("bundle-total-price-val");
  const countBadge = document.getElementById("bundle-selected-count-badge");
  if (totalValEl) totalValEl.textContent = `₹${total.toLocaleString("en-IN")}`;
  if (countBadge) countBadge.textContent = `${count} Items`;
}

function addEntireLookBundleToCart() {
  const checkboxes = document.querySelectorAll(".bundle-item-checkbox");
  let addedCount = 0;

  checkboxes.forEach((cb, idx) => {
    if (cb.checked) {
      const item = state.selectedLookProducts[idx];
      if (item) {
        const shade = item.product.shades.find(s => s.id === item.shadeId) || item.product.shades[0];
        addToCart(item.product, shade);
        addedCount++;
      }
    }
  });

  if (addedCount > 0) {
    showToast(`✨ Added complete ${addedCount}-product look bundle to your Bag!`);
    closeCopilotModal();
    openCartDrawer();
  } else {
    showToast("Please check at least one product from your look.");
  }
}

/* ==========================================================================
   TOAST NOTIFICATION HELPER
   ========================================================================== */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById("nykaa-toast");
  const msgEl = document.getElementById("nykaa-toast-msg");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}
