/* Horarios de Russell, siempre en hora de Paraná */
export const TZ = "America/Argentina/Buenos_Aires";
const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function arNow() {
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
export const HOURS = { 0: [18.5, 25.5], 1: [18.5, 25.5], 2: null, 3: [18.5, 25.5], 4: [18.5, 25.5], 5: [18.5, 26.5], 6: [18.5, 26.5] };

export const fmt = t => {
  const mins = Math.round(t * 60);
  const h = Math.floor(mins / 60) % 24, m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function getStatus() {
  const n = arNow();
  const t = n.h + n.m / 60 + n.s / 3600;
  const prev = (n.dow + 6) % 7;
  if (HOURS[prev] && t + 24 < HOURS[prev][1]) return { state: "open", until: HOURS[prev][1] - 24, serviceDay: prev, t, n };
  const today = HOURS[n.dow];
  if (today && t >= today[0]) return { state: "open", until: today[1], serviceDay: n.dow, t, n };
  if (today) return { state: "later", opensIn: (today[0] - t) * 3600, serviceDay: n.dow, t, n };
  return { state: "tuesday", serviceDay: n.dow, t, n };
}

/* Turnos de retiro cada 15', desde 30' después de ahora (o de la apertura) hasta 15' antes del cierre.
   Si hoy ya no da, ofrece el próximo día abierto (saltando el martes, obvio). */
export function pickupSlots() {
  const st = getStatus();
  const build = (from, to) => {
    const out = [];
    for (let x = Math.ceil(from * 4) / 4; x <= to - 0.25 + 1e-9; x += 0.25) out.push(x);
    return out;
  };
  if (st.state === "open" || st.state === "later") {
    const day = st.serviceDay;
    const close = HOURS[day][1];
    const nowT = st.state === "open" && day !== st.n.dow ? st.t + 24 : st.t;
    const from = Math.max(HOURS[day][0] + 0.5, nowT + 0.5);
    const slots = build(from, close);
    if (slots.length) return { label: "Hoy", dayName: DAY_NAMES[day], slots };
  }
  // próximo día abierto
  let d = (st.n.dow + 1) % 7, ahead = 1;
  while (!HOURS[d]) { d = (d + 1) % 7; ahead++; }
  return { label: ahead === 1 ? "Mañana" : DAY_NAMES[d], dayName: DAY_NAMES[d], slots: build(HOURS[d][0] + 0.5, HOURS[d][1]), isTuesday: st.state === "tuesday" };
}
