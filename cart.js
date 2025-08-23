/* cart.js — drop-in cart that auto-saves to localStorage, no HTML changes needed */
(() => {
  const CART_KEY = "blc_cart";
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

  // ---- Floating Cart Button (auto-added) ----
  const cartBtn = document.createElement("button");
  cartBtn.id = "cartBtn";
  cartBtn.type = "button";
  cartBtn.style.cssText = `
    position:fixed; right:16px; bottom:16px; z-index:2147483647;
    padding:12px 16px; border-radius:999px; border:none; box-shadow:0 6px 20px rgba(0,0,0,.15);
    background:#111; color:#fff; font:600 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial;
    cursor:pointer;
  `;
  cartBtn.innerHTML = `Cart <span class="cart-count" style="margin-left:6px;background:#fff;color:#111;
    padding:.15rem .45rem;border-radius:999px;min-width:1.5em;display:inline-block;text-align:center">0</span>`;
  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(cartBtn));

  // ---- Utils ----
  const save = () => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); badge(); };
  const qty  = id => cart[id] || 0;
  const setQty = (id, q) => {
    q = Number(q) || 0;
    if (q <= 0) delete cart[id]; else cart[id] = q;
    save(); paint();
  };

  const CARD_BOUNDARY  = "article, .product-card, .menu-card, .menu-item, .card, .grid-item, li, .item, .col, [class*='card']";
  const TITLE_SELECTOR = "h3, h4, .title, .card-title, .item-title, [class*='title']";

  // ---- 1) Auto-tag leaf nodes that look like “<number> IQD” ----
  function autotagPrices() {
    const nodes = document.getElementsByTagName("*");
    for (let i=0; i<nodes.length; i++) {
      const el = nodes[i];
      if (!el || el.nodeType !== 1 || el.childElementCount !== 0) continue; // leaf only
      const txt = (el.textContent || "").trim();
      if (!/IQD/i.test(txt)) continue;
      const m = txt.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*IQD/i);
      if (!m) continue;
      if (!el.dataset.price) {
        el.dataset.price = m[1];
        el.classList.add("item-price-autodetected");
      }
    }
  }

  // ---- 2) Build a list of unique cards that have a price node ----
  function findCards() {
    autotagPrices();
    const priceNodes = Array.from(document.querySelectorAll(
      "[data-price], .price, .price-badge, .item-price, .item-price-autodetected"
    )).filter(n => /\d/.test(n.getAttribute("data-price") || n.textContent || ""));

    const seen = new Set();
    const list = [];

    priceNodes.forEach(priceNode => {
      const card = priceNode.closest(CARD_BOUNDARY) || priceNode.parentElement;
      if (!card) return;

      const keyFromData = card.getAttribute("data-id");
      const title = (card.querySelector(TITLE_SELECTOR)?.textContent || "item")
        .trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g,"");
      const seed = card.dataset._cardKey || (card.dataset._cardKey = Math.random().toString(36).slice(2));
      const key  = keyFromData || `${title}-${seed}`;

      if (seen.has(key)) return;
      seen.add(key);
      list.push({ key, card, priceNode });
    });

    return list;
  }

  // ---- 3) Controls UI for a card ----
  function controlsHTML(id) {
    const q = qty(id);
    if (!q) return `<button class="btn-wide" data-add="${id}">Add to cart</button>`;
    return `
      <div class="stepper" style="display:flex;gap:.5rem;align-items:center">
        <button class="pill" data-sub="${id}" aria-label="decrease">–</button>
        <div class="qty" style="min-width:2ch;text-align:center">${q}</div>
        <button class="pill" data-add="${id}" aria-label="increase">+</button>
      </div>
    `;
  }

  // ---- 4) Enhance a card (idempotent) ----
  function enhance(entry) {
    const { key:id, card } = entry;
    const host = card.querySelector(".content, .card-body, .details, .text, .card-content, .info, .pad") || card;

    let slot = host.querySelector(":scope > .cart-options-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.className = "cart-options-slot";
      slot.style.marginTop = ".5rem";
      slot.style.display = "flex";
      slot.style.gap = ".5rem";
      slot.style.alignItems = "center";
      host.appendChild(slot);
    }

    slot.innerHTML = controlsHTML(id);
    slot.querySelectorAll("[data-add]").forEach(b => b.onclick = () => setQty(id, qty(id) + 1));
    slot.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => setQty(id, qty(id) - 1));
  }

  // ---- 5) Paint & Badge ----
  function paint(){ findCards().forEach(enhance); }

  function badge(){
    const totalItems = Object.values(cart).reduce((a,b)=>a+b,0);
    const countEl = cartBtn.querySelector(".cart-count");
    if (countEl) countEl.textContent = totalItems;
  }

  // Optional simple summary on button click
  cartBtn.addEventListener("click", () => {
    const lines = Object.entries(cart).map(([id,q]) => `• ${id} × ${q}`);
    alert(lines.length ? `Your cart:\n\n${lines.join("\n")}` : "Cart is empty.");
  });

  // ---- Start & observe for dynamically-loaded content ----
  window.addEventListener("DOMContentLoaded", () => { paint(); badge(); });
  const mo = new MutationObserver(() => { paint(); });
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();

