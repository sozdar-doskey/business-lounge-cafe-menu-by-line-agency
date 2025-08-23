/* ---------------- Business Lounge Cafe – cart.js (stable) ---------------- */

(() => {
  console.log("cart.js OK @", new Date().toISOString());

  /* ====== CONFIG ====== */
  // Set to your live n8n PRODUCTION webhook URL
  const WEBHOOK_URL = "https://lineagency.app.n8n.cloud/webhook/cafe-order";
  const STORAGE_KEY = "cafe_cart_v1";

  // Try to be flexible with your existing markup
  const CARD_SELECTOR  = ".menu-card, .card, .item-card";
  const TITLE_SELECTOR = "h3, h4, .title, .card-title";
  const PRICE_SELECTOR = ".price-badge, [class*='price']"; // prefer data-price

  /* ====== STATE ====== */
  const cart = load();

  /* ====== HELPERS ====== */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const iqd = (n) => `${Number(n || 0).toLocaleString("en-IQ")} IQD`;

  const text = (el) => (el?.textContent || "").trim();

  const slug = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || Math.random().toString(36).slice(2, 8);

  function parsePrice(node) {
    if (!node) return 0;
    const byAttr = node.getAttribute("data-price");
    if (byAttr != null && byAttr !== "") return Number(byAttr);
    const m = text(node).replace(/,/g, "").match(/[\d.]+/);
    return m ? Number(m[0]) : 0;
  }

 function findCards() {
  // Find any element that looks like a price badge
  const priceNodes = Array.from(
    document.querySelectorAll('.price-badge, [class*="price"]')
  ).filter(n => {
    const raw = (n.getAttribute('data-price') || n.textContent || '').replace(/,/g,'');
    return /\d/.test(raw) && raw.length < 20; // must contain a number
  });

  const seen = new Set();
  const entries = [];

  priceNodes.forEach(pn => {
    // Try to locate the visual "card" container near this price
    const container =
      pn.closest('.menu-card, .card, .item-card, .menu__item, article, .grid-item, .product, .box, .item, .menu-item, .col') ||
      pn.parentElement?.parentElement ||
      pn.parentElement;

    if (!container || seen.has(container)) return;

    // Title inside the same container
    const titleNode =
      container.querySelector('h3, h4, .title, .card-title') ||
      container.querySelector('h2');

    const name = (titleNode?.textContent || '').trim();
    const id = container.getAttribute('data-id') || slug(name);
    if (!container.getAttribute('data-id')) container.setAttribute('data-id', id);

    // Use data-price if present; otherwise parse the number from text
    const price = parsePrice(pn);
    if (!pn.getAttribute('data-price') && price) pn.setAttribute('data-price', price);

    entries.push({ card: container, id, name, price, priceNode: pn, titleNode });
    seen.add(container);
  });

  // Debug – see how many cards were found
  console.log('cart.js: found cards =', entries.length);

  return entries;
}


  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function cartCount() {
    return Object.values(cart).reduce((s, q) => s + Number(q || 0), 0);
  }

  function setQty(id, q) {
    q = Number(q);
    if (q <= 0) delete cart[id];
    else cart[id] = q;
    save();
    drawCart();
  }

  /* ====== UI INJECTION ON CARDS ====== */
  function paintCards() {
    const entries = findCards();

    for (const { card, id } of entries) {
      if (card.dataset.enhanced === "1") continue; // idempotent

      const body =
        $(".card-body, .content, .card-content, .description", card) || card;

      const wrap = document.createElement("div");
      wrap.className = "options";
      wrap.style.marginTop = "12px";
      wrap.innerHTML = `
        <button class="btn-wide" data-add="${id}">Add to cart</button>
        <div class="stepper" style="margin-top:8px; display:flex; align-items:center; gap:12px;">
          <button class="pill" data-sub="${id}">−</button>
          <span class="qty" data-qty="${id}">${cart[id] || 1}</span>
          <button class="pill" data-add="${id}">+</button>
        </div>
      `;
      body.appendChild(wrap);
      card.dataset.enhanced = "1";
    }
  }

  /* ====== CART PANEL RENDER ====== */
  function drawCart() {
    // bubble / button text
    const n = cartCount();
    const cartBtn = $("#cartBtn");
    if (cartBtn) {
      // if your button is icon-only, this will still be fine
      if (cartBtn.dataset.mode !== "icon") {
        cartBtn.textContent = `Cart (${n})`;
      }
      cartBtn.setAttribute("aria-label", `Cart (${n})`);
    }

    const itemsEl = $("#cartItems");
    const subtotalEl = $("#subtotal");
    if (!itemsEl || !subtotalEl) return;

    const entries = findCards();
    const rows = Object.entries(cart).map(([id, q]) => {
      const entry = entries.find((e) => e.id === id);
      const name = entry?.name || id;
      const price = entry?.price || 0;
      const line = price * q;

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

    itemsEl.innerHTML =
      rows.length ? rows.join("") : `<p>Your cart is empty.</p>`;

    // subtotal
    const subtotal = Object.entries(cart).reduce((sum, [id, q]) => {
      const entry = entries.find((e) => e.id === id);
      const p = entry?.price || 0;
      return sum + p * q;
    }, 0);
    subtotalEl.textContent = iqd(subtotal);
  }

  /* ====== CHECKOUT ====== */
  async function checkout() {
    const entries = findCards();
    const items = Object.entries(cart).map(([id, qty]) => {
      const entry = entries.find((e) => e.id === id);
      const name = entry?.name || id;
      const price = entry?.price || 0;
      return {
        id,
        name,
        qty,
        price_iqd: price,
        line_total_iqd: price * qty,
      };
    });

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    const payload = {
      order_id:
        "BLC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      placed_at: new Date().toISOString(),
      subtotal_iqd: items.reduce((s, i) => s + i.line_total_iqd, 0),
      source: "github_pages",
      items,
    };

    // simple CORS (no preflight)
    const body = new URLSearchParams({
      order: JSON.stringify(payload),
    }).toString();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      alert("Order sent: " + (data.order_id || payload.order_id));

      // clear cart & update UI
      Object.keys(cart).forEach((k) => delete cart[k]);
      save();
      drawCart();

      // hide panel if present
      $("#cartPanel")?.classList.add("hidden");
    } catch (e) {
      console.error(e);
      alert("Could not send order. Please try again.");
    }
  }

  /* ====== WIRING ====== */
  function wireUI() {
    const cartBtn = $("#cartBtn");
    const cartPanel = $("#cartPanel");
    const closeCart = $("#closeCart");
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

    // delegate plus/minus on the whole document
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      const sub = e.target.closest("[data-sub]");
      if (!add && !sub) return;

      const id = (add || sub).getAttribute("data-add") || (add || sub).getAttribute("data-sub");
      if (!id) return;

      const current = Number(cart[id] || 0) || 0;
      if (add) setQty(id, current + 1);
      if (sub) setQty(id, current - 1);

      // also update inline qty text if present
      $$(`[data-qty="${id}"]`).forEach((el) => (el.textContent = cart[id] || 0));
    });
  }

  /* ====== BOOT ====== */
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      try {
        paintCards(); // inject "Add to cart / ±" once
        wireUI();     // wire buttons once
        drawCart();   // reflect saved cart
      } catch (e) {
        console.error("Cart boot error:", e);
      }
    },
    { once: true }
  );
})();

