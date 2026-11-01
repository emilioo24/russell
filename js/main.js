/* Russell Beer Pub — demo · interacciones */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- LOADER ---------- */
  const loader = $("#loader");
  let seen = false;
  try { seen = sessionStorage.getItem("russell-seen") === "1"; } catch (e) {}
  const finishLoad = () => {
    loader.classList.add("is-done");
    document.body.classList.add("is-loaded");
    try { sessionStorage.setItem("russell-seen", "1"); } catch (e) {}
  };
  if (seen || reduced) {
    finishLoad();
  } else {
    const minTime = new Promise(r => setTimeout(r, 1300));
    const loaded = new Promise(r => (document.readyState === "complete" ? r() : window.addEventListener("load", r, { once: true })));
    Promise.race([Promise.all([minTime, loaded]), new Promise(r => setTimeout(r, 2600))]).then(finishLoad);
  }

  /* ---------- HORA DE PARANÁ ---------- */
  const TZ = "America/Argentina/Buenos_Aires";
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function arNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit",
      year: "numeric", month: "2-digit", day: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).reduce((a, p) => (a[p.type] = p.value, a), {});
    return {
      dow: DOW[parts.weekday],
      h: +parts.hour, m: +parts.minute, s: +parts.second,
      day: +parts.day, month: +parts.month, year: +parts.year
    };
  }

  // horas en formato decimal; > 24 = después de medianoche
  const HOURS = { 0: [18.5, 25.5], 1: [18.5, 25.5], 2: null, 3: [18.5, 25.5], 4: [18.5, 25.5], 5: [18.5, 26.5], 6: [18.5, 26.5] };
  const fmt = t => { const h = Math.floor(t) % 24, m = Math.round((t % 1) * 60); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; };

  function getStatus() {
    const n = arNow();
    const t = n.h + n.m / 60 + n.s / 3600;
    const prev = (n.dow + 6) % 7;
    if (HOURS[prev] && t + 24 < HOURS[prev][1]) return { state: "open", until: HOURS[prev][1], serviceDay: prev, n };
    const today = HOURS[n.dow];
    if (today && t >= today[0]) return { state: "open", until: today[1], serviceDay: n.dow, n };
    if (today) return { state: "later", opensIn: (today[0] - t) * 3600, serviceDay: n.dow, n };
    return { state: "tuesday", serviceDay: n.dow, n };
  }

  const statusEl = $("#status"), statusText = $("#statusText"), countdown = $("#countdown"), clock = $("#clock");
  function renderStatus() {
    const st = getStatus();
    statusEl.classList.toggle("is-open", st.state === "open");
    statusEl.classList.toggle("is-tue", st.state === "tuesday");
    if (st.state === "open") {
      statusText.textContent = `Abierto ahora · hasta las ${fmt(st.until)}`;
      countdown.hidden = true;
    } else if (st.state === "later") {
      statusText.textContent = "Abrimos hoy 18:30";
      const s = Math.max(0, Math.floor(st.opensIn));
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      countdown.hidden = false;
      countdown.textContent = `Faltan ${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s para la primera pinta`;
    } else {
      statusText.textContent = "Martes cerrado. No insista.";
      countdown.hidden = false;
      countdown.textContent = "Mañana 18:30 volvemos. Hoy, agua y reflexión.";
    }
    clock.textContent = `${String(st.n.h).padStart(2, "0")}:${String(st.n.m).padStart(2, "0")}`;
    $$("#hours li").forEach(li => li.classList.toggle("is-today", +li.dataset.d === st.serviceDay));
  }
  renderStatus();
  setInterval(renderStatus, 1000);

  /* ---------- FECHAS DE LA AGENDA ---------- */
  (function agendaDates() {
    const n = arNow();
    const base = new Date(Date.UTC(n.year, n.month - 1, n.day));
    const names = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    $$(".flyer[data-dow]").forEach(card => {
      const target = +card.dataset.dow;
      const diff = (target - n.dow + 7) % 7;
      const d = new Date(base.getTime() + diff * 864e5);
      const label = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      $$(".js-date", card).forEach(el => (el.textContent = label));
      $$(".js-day", card).forEach(el => (el.textContent = diff === 0 ? "HOY" : names[target]));
      card.style.order = diff;
      if (diff === 0) $(".flyer__date", card)?.classList.add("is-today");
    });
  })();

  /* ---------- NAV ---------- */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const setMenu = open => {
    links.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("no-scroll", open);
  };
  burger.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("a", links).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); closeLightbox(); } });

  /* ---------- SCROLL: nav, progreso, parallax, WhatsApp ---------- */
  const pintBar = $("#pintBar"), heroBg = $("#heroBg"), wa = $(".wa");
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("is-scrolled", y > 30);
    pintBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    wa.classList.toggle("is-visible", y > innerHeight * .6);
    if (!reduced && y < innerHeight * 1.2) heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- REVEAL ---------- */
  // pequeño escalonado entre hermanos
  $$(".reveal").forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--rd", `${Math.min(i, 6) * 0.08}s`);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$("[data-count]", en.target).forEach(countUp);
      if (en.target.matches("[data-count]")) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- CONTADORES ---------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const end = +el.dataset.count, suffix = el.dataset.suffix || "";
    const start = end > 1000 ? end - 60 : 0;
    const dur = 1600, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(start + (end - start) * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduced) el.textContent = end + suffix; else requestAnimationFrame(step);
  }

  /* ---------- BOKEH EN EL HERO ---------- */
  if (!reduced) {
    const bokeh = $("#bokeh");
    for (let i = 0; i < 22; i++) {
      const b = document.createElement("i");
      const size = 4 + Math.random() * 16;
      b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${30 + Math.random() * 70}%;--d:${8 + Math.random() * 10}s;--delay:${-Math.random() * 12}s;--x:${(Math.random() - .5) * 120}px;--o:${.25 + Math.random() * .5}`;
      bokeh.appendChild(b);
    }
    // burbujas de fondo en la carta
    const bubbles = $("#bubbles");
    for (let i = 0; i < 26; i++) {
      const b = document.createElement("i");
      const size = 4 + Math.random() * 14;
      b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;--d:${10 + Math.random() * 14}s;--delay:${-Math.random() * 20}s;--x:${(Math.random() - .5) * 80}px`;
      bubbles.appendChild(b);
    }
  }

  /* ---------- PIZARRA DE CANILLAS + PINTA ---------- */
  // Estilos de referencia para la demo: el cliente reemplaza por sus canillas reales.
  const BEERS = [
    { name: "Golden", style: "Golden Ale", abv: "5,0%", ibu: 18, color: "#E9B949", fill: 70, desc: "La puerta de entrada. Liviana, rubia, sin vueltas. Para arrancar la noche sin filosofar demasiado." },
    { name: "Honey", style: "Honey Beer", abv: "6,5%", ibu: 15, color: "#DE9A2E", fill: 70, desc: "Miel entrerriana y un final dulce que te hace pedir otra antes de terminar esta." },
    { name: "APA", style: "American Pale Ale", abv: "5,4%", ibu: 35, color: "#D48A2A", fill: 70, desc: "Lúpulo cítrico, amargor amable. La que pedís cuando no sabés qué pedir." },
    { name: "IPA", style: "India Pale Ale", abv: "6,4%", ibu: 60, color: "#C97A20", fill: 70, desc: "Amarga, aromática y orgullosa de serlo. Va de la mano con las Papas Bertrand." },
    { name: "Hazy", style: "New England IPA", abv: "6,8%", ibu: 30, color: "#EBB654", fill: 70, desc: "Turbia a propósito. Jugosa, frutal, peligrosamente tomable." },
    { name: "Pilsen", style: "Bohemian Pilsner", abv: "4,8%", ibu: 28, color: "#F2CF55", fill: 70, desc: "Clásica, cristalina y bien fría. Para los que dudan de todo, menos de esto." },
    { name: "Red", style: "Irish Red Ale", abv: "5,6%", ibu: 22, color: "#9E3B1F", fill: 70, desc: "Caramelo, tostado y color ladrillo, como las paredes de la casa." },
    { name: "Scottish", style: "Scottish Ale", abv: "6,2%", ibu: 20, color: "#7A3517", fill: 70, desc: "Maltosa y redonda. Para la charla larga de la mesa del fondo." },
    { name: "Stout", style: "Dry Stout", abv: "5,8%", ibu: 38, color: "#24140C", fill: 70, desc: "Negra como la noche de un sábado de RSB. Café, chocolate y espuma cremosa." },
    { name: "Session", style: "Session IPA", abv: "4,3%", ibu: 40, color: "#E0A640", fill: 70, desc: "Todo el lúpulo, menos graduación. Pensada para la maratón." }
  ];

  const board = $("#board"), glass = $(".glass"), beer = $("#beer"), foam = $("#foam"), pour = $(".pour");
  BEERS.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.className = "tap";
    btn.type = "button";
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", "false");
    btn.style.setProperty("--c", b.color === "#24140C" ? "#C9B79C" : b.color);
    btn.innerHTML = `<span class="tap__n">${i + 1}</span><span class="tap__name">${b.name}<small>${b.style}</small></span><span class="tap__abv">${b.abv}</span>`;
    btn.addEventListener("click", () => serve(i));
    board.appendChild(btn);
  });

  // burbujas dentro del vaso
  const gb = $("#glassBubbles"), NS = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 14; i++) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 55 + Math.random() * 90);
    c.setAttribute("cy", 270 + Math.random() * 15);
    c.setAttribute("r", 1.5 + Math.random() * 2.5);
    c.setAttribute("class", "glass__bubble");
    c.style.setProperty("--d", `${2 + Math.random() * 3}s`);
    c.style.setProperty("--delay", `${-Math.random() * 4}s`);
    gb.appendChild(c);
  }

  let current = -1;
  function serve(i) {
    if (i === current) return;
    current = i;
    const b = BEERS[i];
    $$(".tap", board).forEach((t, k) => t.setAttribute("aria-selected", k === i));
    // vaciar y volver a llenar
    glass.classList.add("no-anim");
    beer.style.transform = foam.style.transform = "translateY(300px)";
    void glass.getBoundingClientRect();
    glass.classList.remove("no-anim");
    beer.style.fill = b.color;
    const top = 62; // nivel del líquido
    requestAnimationFrame(() => {
      beer.style.transform = `translateY(${top}px)`;
      foam.style.transform = `translateY(${top - 28}px)`;
    });
    $("#beerNum").textContent = `Canilla #${i + 1}`;
    $("#beerName").textContent = b.name;
    $("#beerStyle").textContent = b.style;
    $("#beerAbv").textContent = b.abv;
    $("#beerIbu").textContent = b.ibu;
    $("#beerDesc").textContent = b.desc;
    pour.classList.remove("is-pouring"); void pour.offsetWidth; pour.classList.add("is-pouring");
  }
  // primera pinta cuando la sección aparece
  new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { setTimeout(() => serve(3), 300); obs.disconnect(); }
  }, { threshold: .35 }).observe($(".taproom"));

  /* ---------- TILT EN FLYERS ---------- */
  if (finePointer && !reduced) {
    $$(".tilt").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transition = "transform .12s ease-out, box-shadow .4s, border-color .4s";
        card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .4s, border-color .4s";
        card.style.transform = "";
      });
    });
  }

  /* ---------- PROMOS: flip al tocar ---------- */
  $$(".promo").forEach(p => {
    const flip = () => p.classList.toggle("is-flipped");
    p.addEventListener("click", () => { if (!finePointer) flip(); });
    p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  /* ---------- MARTES: no insista ---------- */
  const tue = $(".hours__tue"), insist = $("#insist");
  const lines = [
    "No.",
    "Dijimos que no.",
    "No insista.",
    "En serio, está cerrado.",
    "Ni Bertrand abriría un martes.",
    "La lógica es clara: martes ⇒ cerrado.",
    "Vaya a tomar agua. Mañana 18:30.",
    "…"
  ];
  let tries = 0;
  const nag = () => {
    insist.textContent = lines[Math.min(tries, lines.length - 1)];
    tries++;
    insist.classList.remove("pop"); void insist.offsetWidth; insist.classList.add("pop");
    tue.classList.remove("shake"); void tue.offsetWidth; tue.classList.add("shake");
  };
  tue.addEventListener("click", nag);
  tue.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nag(); } });

  /* ---------- LIGHTBOX ---------- */
  const lb = $("#lightbox"), lbImg = $("#lightboxImg");
  let lastFocus = null;
  function openLightbox(src, alt) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = alt;
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    $(".lightbox__close", lb).focus();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove("no-scroll");
    lastFocus?.focus();
  }
  $$(".shot").forEach(s => s.addEventListener("click", () => { const im = $("img", s); openLightbox(im.currentSrc || im.src, im.alt); }));
  lb.addEventListener("click", e => { if (e.target !== lbImg) closeLightbox(); });

  /* ---------- FAQ: uno abierto a la vez ---------- */
  $$(".faq details").forEach(d => d.addEventListener("toggle", () => {
    if (d.open) $$(".faq details").forEach(o => { if (o !== d) o.open = false; });
  }));

  $("#year").textContent = new Date().getFullYear();
})();
