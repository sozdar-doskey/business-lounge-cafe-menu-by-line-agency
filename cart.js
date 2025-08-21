/* Business Lounge Cafe – Cart (isolated)
   - Adds "Add to cart" then +/- stepper under each product card
   - Uses IQD currency
   - Namespaced & wrapped to avoid conflicts with your existing JS
*/
(() => {
  const SELECTOR_CARD_CANDIDATES = [
    ".product-card",
    ".menu-card",
    ".menu-item",
    ".card"
  ].join(", ");
  const SELECTOR_TITLE = "h3, h4, .title, .card-title, .item-title";
  const SELECTOR_PRICE = ".price, .price-badge, .badge, .item-price, [data-price]";

  const CART_KEY = "blc_cart";
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

  const iqd = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " IQD";
  const save = () => (localStorage.setItem(CART_KEY, JSON.stringify(cart)), badge());

  const idFor = (card) => {
    const explicit = card.getAttribute("data-id");
    if (explicit) return explicit;
    const name = (card.querySelector(SELECTOR_TITLE)?.textContent || "item").trim().toLowerCase();
    return name.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };
  const priceFor = (card) => {
    const node = card.querySelector(SELECTOR_PRICE);
    if (!node) return null;
    const raw = node.getAttribute("data-price") || node.textContent || "";
    const m = raw.replace(/,/g, "").match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : null;
  };
  const findCards = () =>
    Array.from(document.querySelectorAll(SELECTOR_CARD_CANDIDATES)).filter((el) => {
      const node = el.querySelector(SELECTOR_PRICE);
      if (!node) return false;
      const txt = (node.getAttribute("data-price") || node.textContent || "").replace(/,/g, "");
      return /\d/.test(txt);
    });

  const qty = (id) => cart[id] || 0;
  const setQty = (id, q) => { q <= 0 ? delete cart[id] : cart[id] = q; save(); paintCards(); drawCart(); };

  const controlsHTML = (id) =>
    qty(id)
      ? `<div class="stepper">
           <button class="pill" data-sub="${id}">−</button>
           <div class="qty">${qty(id)}</div>
           <button class="pill" data-add="${id}">+</button>
         </div>`
      : `<button class="btn-wide" data-add="${id}">Add to cart</button>`;

  const enhance = (card) => {
    const id = idFor(card);
    let slot = card.querySelector(".options");
    if (!slot) {
      slot = document.createElement("div");
      slot.className = "options";
      (card.querySelector(".pad") || card.querySelector(".card-body") || card).appendChild(slot);
    }
    slot.innerHTML = controlsHTML(id);
    slot.querySelectorAll("[data-add]").forEach(b => b.onclick = () => setQty(id, qty(id)+1));
    slot.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => setQty(id, qty(id)-1));
  };

  const paintCards = () => findCards().forEach(enhance);

  const badge = () => {
    const total = Object.values(cart).reduce((a,b)=>a+b,0);
    const btn = document.getElementById("cartBtn");
    if (btn) btn.textContent = `Cart (${total})`;
  };

  const drawCart = () => {
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
      const card  = cards.find(el => idFor(el) === id);
      const name  = card?.querySelector(SELECTOR_TITLE)?.textContent?.trim() || id;
      const price = priceFor(card) ?? 0;
      const line  = price * q; subtotal += line;
      return `
        <div class="row">
          <div style="flex:1">
            <strong>${name}</strong>
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
    itemsEl.querySelectorAll("[data-add]").forEach(b => b.onclick = () => setQty(b.dataset.add,  qty(b.dataset.add)+1));
    itemsEl.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => setQty(b.dataset.sub,  qty(b.dataset.sub)-1));
  };

  const wirePanel = () => {
    const cartBtn     = document.getElementById("cartBtn");
    const cartPanel   = document.getElementById("cartPanel");
    const closeCart   = document.getElementById("closeCart");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (cartBtn && cartPanel) cartBtn.onclick = () => { drawCart(); cartPanel.classList.toggle("hidden"); };
    if (closeCart && cartPanel) closeCart.onclick = () => cartPanel.classList.add("hidden");
    if (checkoutBtn) checkoutBtn.onclick = () => {
      const cards = findCards();
      const order = {
        items: Object.entries(cart).map(([id, q]) => {
          const card  = cards.find(el => idFor(el) === id);
          const name  = card?.querySelector(SELECTOR_TITLE)?.textContent?.trim() || id;
          const price = priceFor(card) ?? 0;
          return { id, name, qty:q, price_iqd: price, line_total_iqd: price*q };
        }),
        subtotal_iqd: Object.entries(cart).reduce((sum,[id,q]) => {
          const card = cards.find(el => idFor(el) === id);
          const p = priceFor(card) ?? 0;
          return sum + p*q;
        },0),
        placed_at: new Date().toISOString(),
      };
      alert("✅ Demo only — next step will send to n8n:\n\n" + JSON.stringify(order,null,2));
    };
  };

  document.addEventListener("DOMContentLoaded", () => {
    paintCards();
    wirePanel();
    badge();
    drawCart();
  });
})();
