/* Pedí para retirar (demo: nada se envía ni se cobra) */
import { $, $$, initChrome, observeReveal, store } from "./chrome.js";
import { FOOD, GROWLERS, TAGS, fmtPrice } from "./data.js";
import { pickupSlots, fmt } from "./hours.js";

initChrome();

const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const byId = id => FOOD.find(c => c.id === id);
const CATS = [byId("picar"), byId("burgers"), byId("pizzas"), GROWLERS, byId("postres"), byId("sin-alcohol")];
const ITEMS = Object.fromEntries(CATS.flatMap(c => c.items).map(it => [it.id, it]));

/* ---------- estado ---------- */
let cart = store("russell-cart") || {};
for (const id in cart) if (!ITEMS[id] || cart[id] < 1) delete cart[id];
const save = () => store("russell-cart", cart);
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const total = () => Object.entries(cart).reduce((a, [id, q]) => a + ITEMS[id].price * q, 0);

/* ---------- horario de retiro ---------- */
const pick = pickupSlots();
const info = $("#pickupInfo");
if (pick.isTuesday) {
  info.innerHTML = `<b class="rye">Martes cerrado. No insista.</b> Igual podés dejarlo armado para <b>${pick.label.toLowerCase()}</b>.`;
  info.classList.add("is-tue");
} else if (pick.label === "Hoy") {
  info.innerHTML = `Retirás <b>hoy</b> desde las <b>${fmt(pick.slots[0])}</b>.`;
} else {
  info.innerHTML = `Hoy ya no llegamos. Lo dejamos listo para <b>${pick.label.toLowerCase()}</b> desde las <b>${fmt(pick.slots[0])}</b>.`;
}
$("#slotDay").textContent = pick.label === "Hoy" || pick.label === "Mañana" ? pick.label : pick.dayName;
$("#slot").innerHTML = pick.slots.map((t, i) => `<option value="${fmt(t)}">${fmt(t)}${i === 0 ? " · lo antes posible" : ""}</option>`).join("");

/* ---------- productos ---------- */
const chips = $("#chips"), products = $("#products");
chips.innerHTML = CATS.map(c => `<a href="#cat-${c.id}" class="chip" data-cat="${c.id}">${c.name.replace(" para llevar", "")}</a>`).join("");

const control = id => {
  const q = cart[id] || 0;
  return q
    ? `<div class="stepper" data-id="${id}"><button type="button" data-op="-1" aria-label="Quitar uno">−</button><output>${q}</output><button type="button" data-op="1" aria-label="Agregar uno">+</button></div>`
    : `<button type="button" class="add" data-id="${id}" data-op="1">Agregar <span>+</span></button>`;
};

products.innerHTML = CATS.map(c => `
  <section class="menu__cat" id="cat-${c.id}" data-cat="${c.id}">
    <header class="menu__head reveal"><h2>${c.name}</h2>${c.note ? `<p>${esc(c.note)}</p>` : ""}</header>
    <ul class="prods">
      ${c.items.map(it => `
        <li class="prod reveal${it.tags.includes("estrella") ? " dish--star" : ""}" data-id="${it.id}">
          ${it.color ? `<span class="beer__dot" style="--c:${it.color}"></span>` : ""}
          <div class="prod__main">
            <h3>${esc(it.name)}</h3>
            <p>${esc(it.desc)}</p>
            ${it.tags.length ? `<div class="tags">${it.tags.map(t => `<span class="tag tag--${t}">${TAGS[t]}</span>`).join("")}</div>` : ""}
          </div>
          <div class="prod__side">
            <b>${fmtPrice(it.price)}</b>
            <div class="prod__ctl">${control(it.id)}</div>
          </div>
        </li>`).join("")}
    </ul>
  </section>`).join("");
observeReveal();

// scrollspy
const setActive = id => $$(".chip", chips).forEach(ch => {
  const on = ch.dataset.cat === id;
  ch.classList.toggle("is-active", on);
  if (on) chips.scrollTo({ left: ch.offsetLeft - 16, behavior: "smooth" });
});
const spy = new IntersectionObserver(en => en.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.cat); }), { rootMargin: "-40% 0px -55% 0px" });
$$(".menu__cat", products).forEach(s => spy.observe(s));
setActive(CATS[0].id);

/* ---------- carrito ---------- */
const cartEl = $("#cart"), cartItems = $("#cartItems"), cartbar = $("#cartbar"), scrim = $("#scrim");
const toast = $("#toast");
let toastT;
const say = msg => {
  toast.textContent = msg;
  toast.classList.add("is-on");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("is-on"), 1800);
};

function change(id, op) {
  const before = cart[id] || 0;
  const q = Math.max(0, Math.min(20, before + op));
  if (q) cart[id] = q; else delete cart[id];
  save();
  if (op > 0 && q > before) {
    say(`${ITEMS[id].name} al pedido ✓`);
    cartbar.classList.remove("bump"); void cartbar.offsetWidth; cartbar.classList.add("bump");
  }
  render();
}

function render() {
  // controles en la lista
  $$(".prod", products).forEach(li => {
    const id = li.dataset.id;
    li.classList.toggle("is-in-cart", !!cart[id]);
    $(".prod__ctl", li).innerHTML = control(id);
  });
  // panel
  const ids = Object.keys(cart);
  $("#cartEmpty").hidden = ids.length > 0;
  $("#cartFoot").hidden = ids.length === 0;
  cartItems.innerHTML = ids.map(id => {
    const it = ITEMS[id];
    return `<li><div><b>${esc(it.name)}</b><span>${fmtPrice(it.price * cart[id])}</span></div>${control(id)}</li>`;
  }).join("");
  const t = fmtPrice(total());
  $("#cartTotal").textContent = t;
  $("#cartTotal2").textContent = t;
  $("#cartCount").textContent = count();
  $("#cartbarTotal").textContent = t;
  cartbar.hidden = ids.length === 0;
  if (!ids.length) showStep("items");
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-op]");
  if (!b) return;
  const id = b.dataset.id || b.closest("[data-id]").dataset.id;
  change(id, +b.dataset.op);
});

const openSheet = () => { cartEl.classList.add("is-open"); scrim.hidden = false; document.body.classList.add("no-scroll"); };
const closeSheet = () => { cartEl.classList.remove("is-open"); scrim.hidden = true; document.body.classList.remove("no-scroll"); };
cartbar.addEventListener("click", openSheet);
scrim.addEventListener("click", closeSheet);
$("#cartClose").addEventListener("click", closeSheet);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });

/* ---------- checkout ---------- */
const stepItems = $("#stepItems"), form = $("#stepCheckout");
function showStep(which) {
  stepItems.hidden = which !== "items";
  form.hidden = which !== "checkout";
  cartEl.classList.toggle("is-checkout", which === "checkout");
}
$("#toCheckout").addEventListener("click", () => { showStep("checkout"); form.nombre.focus({ preventScroll: true }); });
$("#backToItems").addEventListener("click", () => showStep("items"));

form.addEventListener("input", e => e.target.closest(".field")?.classList.remove("is-invalid"));
form.addEventListener("submit", e => {
  e.preventDefault();
  const bad = [...form.elements].filter(el => el.willValidate && !el.checkValidity());
  bad.forEach(el => {
    const f = el.closest(".field");
    f.classList.remove("is-invalid"); void f.offsetWidth; f.classList.add("is-invalid");
  });
  if (bad.length) { bad[0].focus(); return; }
  confirmOrder(Object.fromEntries(new FormData(form)));
});

/* ---------- confirmación ---------- */
const done = $("#done");
function confirmOrder(data) {
  const num = "#R-" + String(Math.floor(1000 + Math.random() * 9000));
  $("#orderNum").textContent = num;
  $("#doneName").textContent = data.nombre.trim().split(" ")[0] || "vos";
  const day = pick.label === "Hoy" ? "hoy" : pick.label === "Mañana" ? "mañana" : `el ${pick.dayName.toLowerCase()}`;
  $("#doneWhen").textContent = `${day} a las ${data.hora}`;
  $("#donePay").textContent = data.pago;
  $("#doneItems").innerHTML = Object.entries(cart).map(([id, q]) => `<li><span>${q}× ${esc(ITEMS[id].name)}</span><b>${fmtPrice(ITEMS[id].price * q)}</b></li>`).join("");
  $("#doneTotal").textContent = fmtPrice(total());
  closeSheet();
  done.hidden = false;
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => requestAnimationFrame(() => done.classList.add("is-on")));
  $("#newOrder").focus({ preventScroll: true });
  cart = {};
  save();
  form.reset();
  render();
}
$("#newOrder").addEventListener("click", () => {
  done.classList.remove("is-on");
  done.hidden = true;
  document.body.classList.remove("no-scroll");
  scrollTo({ top: 0, behavior: "smooth" });
});

render();
