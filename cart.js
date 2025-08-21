/* Business Lounge Cafe – Cart (robust auto-detect)
   - Adds “Add to cart” then +/- stepper under each visible product card
   - Works by finding any element that looks like a price (e.g., “4500 IQD”)
   - Currency: IQD (no decimals)
*/
(() => {
  const CART_KEY = "blc_cart";
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

  // Price nodes we’ll look for on each card
  const PRICE_SELECTOR = ".price, .price-badge, .badge, .item-price, [data-price]";
  // Where to stop when climbing up from the price to the card container
  const CARD_BOUNDARY = "article, .card, .menu-card, .product-card, .menu-item, .grid-item, li";

  const TITLE_SELECTOR = "h3, h4, .title, .card-title, .item-title";

  const iqd = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " IQD";
  const save = () => (localStorage.setItem(CART_KEY, JSON.stringify(cart)), badge());

  function qty(id) { return cart[id] || 0; }
  function setQty(id, q) { q <= 0 ? delete cart[id] : cart[id] = q; save(); paint(); drawCart(); }

  function priceFrom(node) {
    if (!node) return null;
    const raw = (node.getAttribute("data-price") || node.textContent || "").replace(/,/g, "");
    const m = raw.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  }

  function findCards() {
    const seen = new Set();
    const cards = [];
    document.querySelectorAll(PRICE_SELECTOR).forEach(priceNode => {
      // Ignore if it doesn't contain digits
      const raw = (priceNode.getAttribute("data-price") || priceNode.textContent || "");
      if (!/\d/.test(raw)) return;

      const card = priceNode.closest(CARD_BOUNDARY) || priceNode.parentElement;
      if (!card) return;

      const key = card.dataset.cartKey || (card.dataset.cartKey = Math.random().toString(36).slice(2));
      if (seen.has(key)) return;
      seen.add(key);
      cards.push({ card, priceNode });
    });
    return cards;
  }

  function idFor(card) {
    if (card.getAttribute("data-id")) return card.getAttribute("data-id");
    const title = card.querySelector(TITLE_SELECTOR)?.textContent?.trim().toLowerCase() || "item";
    return title.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function controlsHTML(id) {
    const q = qty(id);
    if (!q) return `<button class="btn-wide" data-add="${id}">Add to cart</button>`;
    return `
      <div class="stepper">
        <button class="pill" data-sub="${id}">−</button>
        <div class="qty">${q}</div>
        <button class="pill" data-add="${id}">+</button>
      </div>
    `;
  }

  function enhance({ card }) {
    const id = idFor(card);
    // Pick a good place to inject controls
    const host =
      card.querySelector(".pad, .card-body, .content, .details, .text, .card-content") || card;

    let slot = host.querySelector(".options");
    if (!slot) {
      slot = document.createElement("div");
      slot.className = "options";
      host.appendChild(slot);
    }
    slot.innerHTML = controlsHTML(id);

    slot.querySelectorAll("[data-add]").forEach(b => b.onclick = () => setQty(id, qty(id) + 1));
    slot.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => setQty(id, qty(id) - 1));
  }

  function paint() { findCards().forEach(enhance); }

  function badge() {
    const total = Object.values(cart).reduce((a, b) => a + b, 0);
    const btn = document.getElementById("cartBtn");
    if (btn) btn.textContent = `Cart (${total})`;
  }

  function drawCart() {
    const itemsEl = document.getElementById("cartItems");
    const subtotalEl = document.getElementById("subtotal");
    if (!itemsEl) return;

    const cards = findCards();
    const lines = Object.entries(cart);
    if (!lines.length) {
      itemsEl.innerHTML = `<div class="muted">Your cart is empty.</div>`;
      if (subtotalEl) subtotalEl.textContent = iqd(0);
      return;
    }

    let subtotal = 0;
    itemsEl.innerHTML = lines.map(([id, q]) => {
      const entry = cards.find(({ card }) => idFor(card) === id);
      const card = entry?.card;
      const title = card?.querySelector(TITLE_SELECTOR)?.textContent?.trim() || id;
      const price = priceFrom(entry?.priceNode) ?? 0;
      const line = price * q;
      subtotal += line;
      return `
        <div class="row">
          <div style="flex:1">
            <strong>${title}</strong>
            ${price ? `<div class="muted">${iqd(price)} each</div>` : ""}
          </div>
          <div class="stepper">
            <button class="pill" data-sub="${id}">−</button>
            <div class="qty">${q}</div>
            <button class="pill" data-add="${id}">+</button>
          </div>
          <div style="width:120px; text-align:right">${iqd(line)}</div>
        </div>
      `;
    }).join("");

    if (subtotalEl) subtotalEl.textContent = iqd(subtotal);

    itemsEl.querySelectorAll("[data-add]").forEach(b => b.onclick = () => setQty(b.dataset.add, qty(b.dataset.add) + 1));
    itemsEl.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => setQty(b.dataset.sub, qty(b.dataset.sub) - 1));
  }

  function wirePanel() {
    const cartBtn = document.getElementById("cartBtn");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (cartBtn && cartPanel) cartBtn.onclick = () => { drawCart(); cartPanel.classList.toggle("hidden"); };
    if (closeCart && cartPanel) closeCart.onclick = () => cartPanel.classList.add("hidden");
    if (checkoutBtn) checkoutBtn.onclick = () => {
      const cards = findCards();
      const order = {
        items: Object.entries(cart).map(([id, q]) => {
          const entry = cards.find(({ card }) => idFor(card) === id);
          const title = entry?.card?.querySelector(TITLE_SELECTOR)?.textContent?.trim() || id;
          const price = priceFrom(entry?.priceNode) ?? 0;
          return { id, name: title, qty: q, price_iqd: price, line_total_iqd: price * q };
        }),
        subtotal_iqd: Object.entries(cart).reduce((sum, [id, q]) => {
          const entry = cards.find(({ card }) => idFor(card) === id);
          const p = priceFrom(entry?.priceNode) ?? 0;
          return sum + p * q;
        }, 0),
        placed_at: new Date().toISOString(),
      };
      alert("✅ Demo only — next step will send to n8n:\n\n" + JSON.stringify(order, null, 2));
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    paint();
    wirePanel();
    badge();
    drawCart();
  });
})();
