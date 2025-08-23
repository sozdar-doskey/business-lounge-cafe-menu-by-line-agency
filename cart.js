/* ============================================================
   Business Lounge Cafe — Cart (IQD) + n8n Checkout
   v16
   ============================================================ */

console.log("cart.js loaded", new Date().toISOString());

(() => {
/* =================== CONFIG =================== */
const WEBHOOK_URL = "https://lineagency.app.n8n.cloud/webhook/cafe-order";
const STORAGE_KEY  = "cafe_cart_v1";

// Flexible selectors for your theme
const CARD_SELECTOR  = ".menu-card, .card, .item-card";
const TITLE_SELECTOR = "h3, h4, .title, .card-title";
const PRICE_SELECTOR = ".price-badge, [class*=price]"; // prefer nodes with price text

/* =================== STATE ==================== */
const cart = load();

/* =================== HELPERS ================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const iqd = (n) => `${(Number(n) || 0).toLocaleString("en-IQ")} IQD`;

const slug = (s = "") =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^(-|_)+|(-|_)+$/g, "") || `i-${Math.random().toString(36).slice(2,8)}`;

function save()  { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
function load()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function cartCount() { return Object.values(cart).reduce((s, q) => s + Number(q || 0), 0); }

/* Price parsing: prefer data-price, else extract digits from text */
function parsePrice(node) {
  if (!node) return 0;
  const byAttr = node.getAttribute("data-price");
  if (byAttr != null && byAttr !== "") return Number(byAttr);
  const m = (node.textContent || "").replace(/,/g, "").match(/[\d.]+/);
  return m ? Number(m[0]) : 0;
}

/* Find all cards by locating nearby price nodes */
function findCards() {
  const priceNodes = Array.from(document.querySelectorAll(PRICE_SELECTOR))
    .filter(n => {
      const raw = n.getAttribute("data-price") || n.textContent || "";
      return /\d/.test(raw) && raw.replace(/\D+/g,"").length > 0;
    });

  const seen = new Set();
  const entries = [];

  priceNodes.forEach(pn => {
    const container =
      pn.closest(`${CARD_SELECTOR}, .menu__card, ._menu__item, article, .grid-item, .product, .box, .item, .menu-item, .col`) ||
      pn.parentElement?.parentElement ||
      pn.parentElement;

    if (!container || seen.has(container)) return;

    const titleNode =
      container.querySelector(TITLE_SELECTOR) ||
      container.querySelector("h2");

    const name = (titleNode?.textContent || "").trim() || "Item";
    const id   = container.getAttribute("data-id") || slug(name);
    if (!container.getAttribute("data-id")) container.setAttribute("data-id", id);

    const price = parsePrice(pn);
    if (!pn.getAttribute("data-price") && price) pn.setAttribute("data-price", price);

    entries.push({ card: container, id, name, price, priceNode: pn, titleNode });
    seen.add(container);
  });

  console.log("cart.js: found cards =", entries.length);
  return entries;
}

/* ============= VISIBILITY CSS (reliable) ============= */
(function injectCartCss(){
  if (document.getElementById('cart-visibility-css')) return;
  const s = document.createElement('style');
  s.id = 'cart-visibility-css';
  s.textContent = `
    .options .stepper { display: none; }
    .options[data-in="1"] .stepper { display: flex; }
    .options[data-in="1"] .add-first { display: none; }
  `;
  document.head.appendChild(s);
})();

/* ======== UI: inject "Add to cart / stepper" on cards ======== */
function paintCards () {
  const entries = findCards();

  for (const { card, id } of entries) {
    if (card.dataset.enhanced === "1") continue; // idempotent

    const body =
      $(".card-body, .content, .card-content, .description", card) || card;

    const inCart = (cart[id] || 0) > 0;
    const qty = inCart ? cart[id] : 1;

    const wrap = document.createElement("div");
    wrap.className = "options";
    wrap.dataset.in = inCart ? "1" : "0";
    wrap.style.marginTop = "12px";
    wrap.innerHTML = `
      <button class="btn-wide add-first" data-add-first="${id}">Add to cart</button>

      <div class="stepper" data-stepper="${id}" style="margin-top:8px; align-items:center; gap:12px;">
        <button class="pill" data-sub="${id}">−</button>
        <span class="qty" data-qty="${id}">${qty}</span>
        <button class="pill" data-add="${id}">+</button>
      </div>
    `;

    body.appendChild(wrap);
    card.dataset.enhanced = "1";
  }
}

/* ======= Show/hide “Add” vs stepper for a given id ======= */
function toggleCardControls(id) {
  const has = (cart[id] || 0) > 0;

  // flip wrapper state
  $$(`[data-stepper="${id}"]`).forEach(step => {
    const wrap = step.closest(".options");
    if (wrap) wrap.dataset.in = has ? "1" : "0";
  });

  // keep all qty texts in sync
  $$(`[data-qty="${id}"]`).forEach(el => (el.textContent = has ? cart[id] : 1));
}

/* ========== Update qty + persist + redraw everywhere ========== */
function setQty(id, q) {
  q = Number(q);
  if (q <= 0) delete cart[id];
  else        cart[id] = q;

  save();
  drawCart();            // update the cart panel and bubble
  toggleCardControls(id);// swap Add/Stepper on the card
}

/* ================= WIRING (events) ================== */
function wireUI() {
  const cartBtn     = $("#cartBtn");
  const cartPanel   = $("#cartPanel");
  const closeCart   = $("#closeCart");
  const checkoutBtn = $("#checkoutBtn");

  if (cartBtn && cartPanel) {
    cartBtn.onclick = () => {
      drawCart();
      cartPanel.classList.toggle("hidden");
    };
  }
  if (closeCart && cartPanel) {
    closeCart.onclick = () => cartPanel.classList.add("hidden");
  }
  if (checkoutBtn) {
    checkoutBtn.onclick = checkout;
  }

  // One delegated listener handles: first add, plus and minus
  document.addEventListener("click", (e) => {
    // 1) First Add click
    const first = e.target.closest("[data-add-first]");
    if (first) {
      const id = first.getAttribute("data-add-first");
      setQty(id, (cart[id] || 0) + 1);
      return;
    }

    // 2) Subsequent + / −
    const add = e.target.closest("[data-add]");
    const sub = e.target.closest("[data-sub]");
    if (!add && !sub) return;

    const id =
      (add && add.getAttribute("data-add")) ||
      (sub && sub.getAttribute("data-sub"));

    const current = Number(cart[id] || 0);
    if (add) setQty(id, current + 1);
    if (sub) setQty(id, Math.max(0, current - 1));
  });
}

/* ================= Cart panel render ================= */
function drawCart() {
  // bubble on cart button
  const n = cartCount();
  const cartBtn = $("#cartBtn");
  if (cartBtn) {
    if (cartBtn.dataset.mode !== "icon") {
      cartBtn.textContent = `Cart (${n})`;
    }
    cartBtn.setAttribute("aria-label", `Cart (${n})`);
  }

  const itemsEl    = $("#cartItems");
  const subtotalEl = $("#subtotal");
  if (!itemsEl || !subtotalEl) return;

  const entries = findCards();

  const rows = Object.entries(cart).map(([id, q]) => {
    const entry = entries.find(e => e.id === id);
    const name  = entry?.name || id;
    const price = entry?.price || 0;
    const line  = price * q;

    return `
      <div class="row cart-line" data-id="${id}">
        <div class="left">
          <strong>${name}</strong><br>
          <small>${iqd(price)} × ${q}</small>
        </div>
        <div class="right">
          <button class="pill" data-sub="${id}">−</button>
          <span class="qty" data-qty="${id}">${q}</span>
          <button class="pill" data-add="${id}">+</button>
          <span class="line">${iqd(line)}</span>
        </div>
      </div>
    `;
  });

  itemsEl.innerHTML = rows.length ? rows.join("") : `<p>Your cart is empty.</p>`;

  // subtotal
  const subtotal = Object.entries(cart).reduce((sum, [id, q]) => {
    const entry = entries.find(e => e.id === id);
    const p = entry?.price || 0;
    return sum + p * q;
  }, 0);
  subtotalEl.textContent = iqd(subtotal);
}

/* ===================== CHECKOUT ===================== */
async function checkout() {
  const entries = findCards();

  const items = Object.entries(cart).map(([id, qty]) => {
    const entry = entries.find(e => e.id === id);
    const name  = entry?.name || id;
    const price = entry?.price || 0;
    const line  = price * qty;

    return {
      id,
      name,
      qty,
      price_iqd: price,
      line_total_iqd: line,
    };
  });

  if (!items.length) {
    alert("Your cart is empty.");
    return;
  }

  const payload = {
    order_id:  "BLC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    placed_at: new Date().toISOString(),
    subtotal_iqd: items.reduce((s, i) => s + i.line_total_iqd, 0),
    source: "github_pages",
    items,
  };

  // No-preflight body for GitHub Pages -> n8n Cloud
  const body = new URLSearchParams({ order: JSON.stringify(payload) }).toString();

  try {
    const res  = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json().catch(() => ({}));
    alert("Order sent: " + (data.order_id || payload.order_id));

    // clear cart
    Object.keys(cart).forEach(k => delete cart[k]);
    save();
    drawCart();
    // Also reset card controls
    Object.keys(cart).forEach(id => toggleCardControls(id));
    // If empty, flip all to "Add to cart"
    findCards().forEach(({id}) => toggleCardControls(id));
  } catch (e) {
    console.error(e);
    alert("Could not send order. Please try again.");
  }
}

/* ====================== BOOT ======================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    try {
      paintCards();  // inject “Add to cart / stepper”
      wireUI();      // wire event handlers once
      drawCart();    // reflect saved cart in panel/bubble
    } catch (e) {
      console.error("Cart boot error:", e);
    }
  },
  { once: true }
);
})();


