(() => {
  const CART_KEY = "blc_cart";
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

  // selectors we prefer when climbing to a card container
  const CARD_BOUNDARY = "article, .product-card, .menu-card, .menu-item, .card, .grid-item, li, .item, .col, .column";
  const TITLE_SELECTOR = "h3, h4, .title, .card-title, .item-title, [class*='title']";

  const iqd = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " IQD";
  const save = () => (localStorage.setItem(CART_KEY, JSON.stringify(cart)), badge());
  const qty  = (id) => cart[id] || 0;
  const setQty = (id, q) => { q <= 0 ? delete cart[id] : cart[id] = q; save(); paint(); drawCart(); };

  /* ---------- 1) Auto-tag any element that contains “<number> IQD” ---------- */
  function autotagPrices() {
    const isLeaf = (el) => el && el.nodeType === 1 && el.childElementCount === 0;
    const nodes = document.getElementsByTagName("*");
    let tagged = 0;
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (!isLeaf(el)) continue;                 // only leaf elements to avoid big containers
      const txt = (el.textContent || "").trim();
      if (!/IQD/i.test(txt)) continue;           // must contain IQD
      const m = txt.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*IQD/i);
      if (!m) continue;
      if (!el.dataset.price) {                   // don’t overwrite if already set
        el.dataset.price = m[1];
        el.classList.add("item-price-autodetected");
        tagged++;
      }
    }
    // Also include any element explicitly marked with data-price or obvious classes
    return tagged;
  }

  /* ---------- 2) Find all product "cards" by locating price elements ---------- */
  function findCards() {
    // First, auto-tag text prices to data-price
    autotagPrices();

    const priceNodes = Array.from(
      document.querySelectorAll("[data-price], .price, .price-badge, .badge, .item-price, .item-price-autodetected")
    ).filter((n) => /\d/.test((n.getAttribute("data-price") || n.textContent || "")));

    const seen = new Set();
    const list = [];
    priceNodes.forEach((priceNode) => {
      const card = priceNode.closest(CARD_BOUNDARY) || priceNode.parentElement;
      if (!card) return;
      const key = card.dataset._cardKey || (card.dataset._cardKey = Math.random().toString(36).slice(2));
      if (seen.has(key)) return;
      seen.add(key);
      list.push({ card, priceNode });
    });
    return list;
  }

  function priceFrom(node) {
    if (!node) return null;
    const raw = (node.getAttribute("data-price") || node.textContent || "").replace(/,/g, "");
    const m = raw.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
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

  function enhance(entry) {
    const { card } = entry;
    const id = idFor(card);
    const host =
      card.querySelector(".pad, .card-body, .content, .details, .text, .card-content, .info") || card;

    let slot = host.querySelector(".options");
    if (!slot) {
      slot = document.createElement("div");
      slot.className = "options";
      host.appendChild(slot);
    }
    slot.innerHTML = controlsHTML(id);
    slot.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => setQty(id, qty(id) + 1)));
    slot.querySelectorAll("[data-sub]").forEach((b) => (b.onclick = () => setQty(id, qty(id) - 1)));
  }

  function paint() { findCards().forEach(enhance); }

 function badge(){
  const total = Object.values(cart).reduce((a,b)=>a+b,0);
  const btn = document.getElementById("cartBtn");
  if (!btn) return;
  const countEl = btn.querySelector(".cart-count");
  if (countEl){
    countEl.textContent = total;
  } else {
    // fallback for old text button
    btn.textContent = `Cart (${total})`;
  }
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
    itemsEl.innerHTML = lines
      .map(([id, q]) => {
        const entry = cards.find(({ card }) => idFor(card) === id);
        const title = entry?.card?.querySelector(TITLE_SELECTOR)?.textContent?.trim() || id;
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
      })
      .join("");

    if (subtotalEl) subtotalEl.textContent = iqd(subtotal);
    itemsEl.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => setQty(b.dataset.add, qty(b.dataset.add) + 1)));
    itemsEl.querySelectorAll("[data-sub]").forEach((b) => (b.onclick = () => setQty(b.dataset.sub, qty(b.dataset.sub) - 1)));
  }
// === n8n webhook ===
const WEBHOOK_URL = "https://lineagency.app.n8n.cloud/webhook/cafe-order";

 if (checkoutBtn) checkoutBtn.onclick = async () => {
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
    order_id: "BLC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    source: "github_pages"
  };

  // simple CORS: no preflight (x-www-form-urlencoded)
  const body = new URLSearchParams({ order: JSON.stringify(order) }).toString();

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await res.json().catch(() => ({}));
    alert("Order sent: " + (data.order_id || order.order_id));

    // clear cart
    Object.keys(cart).forEach(k => delete cart[k]);
    saveCart();
    drawCart();
  } catch (e) {
    console.error(e);
    alert("Could not send order. Please try again.");
  }
};
