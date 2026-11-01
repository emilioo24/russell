/* La carta (demo) */
import { $, $$, initChrome, observeReveal } from "./chrome.js";
import { BEERS, FOOD, PRICES, TAGS, fmtPrice } from "./data.js";

initChrome();

const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tagHtml = tags => tags.length ? `<div class="tags">${tags.map(t => `<span class="tag tag--${t}">${TAGS[t]}</span>`).join("")}</div>` : "";

const CATS = [
  { id: "tiradas", name: "Tiradas", note: `Pinta ${fmtPrice(PRICES.pinta)} · Media ${fmtPrice(PRICES.media)}. Las canillas rotan: lo de hoy, en la pizarra.` },
  ...FOOD
];

const menu = $("#menu"), chips = $("#chips");

chips.innerHTML = CATS.map(c => `<a href="#cat-${c.id}" class="chip" data-cat="${c.id}">${c.name}</a>`).join("");

menu.innerHTML = CATS.map(c => {
  const head = `<header class="menu__head reveal"><h2>${c.name}</h2>${c.note ? `<p>${esc(c.note)}</p>` : ""}</header>`;
  let items;
  if (c.id === "tiradas") {
    items = BEERS.map((b, i) => `
      <li class="beer reveal" data-search="${esc(norm(`${b.name} ${b.style} cerveza tirada ${b.desc}`))}">
        <span class="beer__n">${i + 1}</span>
        <span class="beer__dot" style="--c:${b.color}"></span>
        <div class="beer__main">
          <h3>${b.name}</h3>
          <p class="beer__style">${b.style} · ${b.abv} · ${b.ibu} IBU</p>
          <p class="beer__desc">${esc(b.desc)}</p>
        </div>
      </li>`).join("");
    items = `<ul class="beers">${items}</ul>`;
  } else {
    items = `<ul class="dishes">${c.items.map(it => `
      <li class="dish reveal${it.tags.includes("estrella") ? " dish--star" : ""}" data-search="${esc(norm(`${it.name} ${it.desc} ${it.tags.map(t => TAGS[t]).join(" ")}`))}">
        <div class="dish__row"><h3>${esc(it.name)}</h3><i></i><b>${fmtPrice(it.price)}</b></div>
        <p>${esc(it.desc)}</p>
        ${tagHtml(it.tags)}
      </li>`).join("")}</ul>`;
  }
  return `<section class="menu__cat" id="cat-${c.id}" data-cat="${c.id}">${head}${items}</section>`;
}).join("");

observeReveal();

/* ---------- scrollspy de categorías ---------- */
const setActive = id => {
  $$(".chip", chips).forEach(ch => {
    const on = ch.dataset.cat === id;
    ch.classList.toggle("is-active", on);
    if (on) chips.scrollTo({ left: ch.offsetLeft - 16, behavior: "smooth" });
  });
};
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) setActive(en.target.dataset.cat); });
}, { rootMargin: "-40% 0px -55% 0px" });
$$(".menu__cat").forEach(s => spy.observe(s));
setActive(CATS[0].id);

/* ---------- buscador ---------- */
const search = $("#search"), empty = $("#empty");
search.addEventListener("input", () => {
  const q = norm(search.value.trim());
  let total = 0;
  $$(".menu__cat").forEach(sec => {
    let n = 0;
    $$("[data-search]", sec).forEach(li => {
      const ok = !q || li.dataset.search.includes(q);
      li.hidden = !ok;
      if (ok) { n++; li.classList.add("is-in"); }
    });
    sec.hidden = n === 0;
    total += n;
  });
  empty.hidden = total > 0;
});
