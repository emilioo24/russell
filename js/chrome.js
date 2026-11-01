/* Partes comunes de las páginas internas: nav, barra de progreso, reveal, WhatsApp */
export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initChrome() {
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const setMenu = open => {
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("no-scroll", open);
  };
  burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("a", links).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  const bar = $("#pintBar"), wa = $(".wa");
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("is-scrolled", y > 30);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (wa) wa.classList.toggle("is-visible", y > 200);
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
}, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

export function observeReveal(root = document) {
  $$(".reveal:not(.is-in)", root).forEach((el, i) => {
    el.style.setProperty("--rd", `${Math.min(i % 6, 5) * 0.05}s`);
    io.observe(el);
  });
}

export function store(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { return null; }
}
