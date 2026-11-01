/* Productos y precios DE EJEMPLO para la demo.
   Cuando Russell pase su carta real, se reemplaza solo este archivo. */

export const BEERS = [
  { name: "Golden", style: "Golden Ale", abv: "5,0%", ibu: 18, color: "#E9B949", desc: "La puerta de entrada. Liviana, rubia, sin vueltas. Para arrancar la noche sin filosofar demasiado." },
  { name: "Honey", style: "Honey Beer", abv: "6,5%", ibu: 15, color: "#DE9A2E", desc: "Miel entrerriana y un final dulce que te hace pedir otra antes de terminar esta." },
  { name: "APA", style: "American Pale Ale", abv: "5,4%", ibu: 35, color: "#D48A2A", desc: "Lúpulo cítrico, amargor amable. La que pedís cuando no sabés qué pedir." },
  { name: "IPA", style: "India Pale Ale", abv: "6,4%", ibu: 60, color: "#C97A20", desc: "Amarga, aromática y orgullosa de serlo. Va de la mano con las Papas Bertrand." },
  { name: "Hazy", style: "New England IPA", abv: "6,8%", ibu: 30, color: "#EBB654", desc: "Turbia a propósito. Jugosa, frutal, peligrosamente tomable." },
  { name: "Pilsen", style: "Bohemian Pilsner", abv: "4,8%", ibu: 28, color: "#F2CF55", desc: "Clásica, cristalina y bien fría. Para los que dudan de todo, menos de esto." },
  { name: "Red", style: "Irish Red Ale", abv: "5,6%", ibu: 22, color: "#9E3B1F", desc: "Caramelo, tostado y color ladrillo, como las paredes de la casa." },
  { name: "Scottish", style: "Scottish Ale", abv: "6,2%", ibu: 20, color: "#7A3517", desc: "Maltosa y redonda. Para la charla larga de la mesa del fondo." },
  { name: "Stout", style: "Dry Stout", abv: "5,8%", ibu: 38, color: "#24140C", desc: "Negra como la noche de un sábado de RSB. Café, chocolate y espuma cremosa." },
  { name: "Session", style: "Session IPA", abv: "4,3%", ibu: 40, color: "#E0A640", desc: "Todo el lúpulo, menos graduación. Pensada para la maratón." }
];

export const PRICES = { pinta: 6000, media: 4500, growler: 9500 };

const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const FOOD = [
  {
    id: "picar", name: "Para picar", note: "Para el centro de la mesa (o para vos solo, no juzgamos).",
    items: [
      { name: "Papas Bertrand", price: 11500, tags: ["estrella", "compartir"], desc: "Papas rústicas con cheddar fundido, panceta crocante, verdeo y la salsa secreta de la casa. Russell las aprobaría sin dudar." },
      { name: "Papas clásicas", price: 7000, tags: ["veggie"], desc: "Bastones fritos y sal. Lo simple también es filosofía." },
      { name: "Nachos lógicos", price: 10500, tags: ["veggie", "picante", "compartir"], desc: "Cheddar, guacamole, pico de gallo y jalapeños. Premisa: pican. Conclusión: otra pinta." },
      { name: "Aros de cebolla", price: 8000, tags: ["veggie"], desc: "Rebozados en cerveza de la casa, con dip barbacoa." },
      { name: "Bastones de muzza", price: 9000, tags: ["veggie"], desc: "Seis bastones con salsa de tomate especiada." }
    ]
  },
  {
    id: "burgers", name: "Hamburguesas", note: "Todas vienen con papas fritas.",
    items: [
      { name: "La Russell", price: 14500, tags: ["estrella"], desc: "Doble medallón, doble cheddar, panceta, cebolla caramelizada y salsa de la casa en pan de papa." },
      { name: "La Lógica", price: 12000, tags: [], desc: "Medallón, cheddar, lechuga, tomate y pepinos. Si A es hambre, entonces B." },
      { name: "La Paradoja", price: 12500, tags: ["veggie"], desc: "Medallón de garbanzos y hongos, provoleta, rúcula y alioli. ¿Es hamburguesa si no tiene carne? Discutilo comiendo." },
      { name: "La Nobel", price: 15500, tags: [], desc: "Doble medallón, provolone, jamón crudo, rúcula y pesto. Premio a la mejor del año (según nosotros)." }
    ]
  },
  {
    id: "pizzas", name: "Pizzas", note: "Ocho porciones. Horno bien fuerte.",
    items: [
      { name: "Muzzarella", price: 11000, tags: ["veggie"], desc: "Salsa de tomate, muzzarella, orégano y aceitunas." },
      { name: "Jamón y morrones", price: 13000, tags: [], desc: "La clásica de siempre, la que sale en las fotos." },
      { name: "Principia", price: 14500, tags: ["estrella"], desc: "Muzzarella, cebolla caramelizada, panceta y huevo a caballo. Tres tomos de sabor." },
      { name: "Fugazzeta rellena", price: 14000, tags: ["veggie"], desc: "Doble masa, mucho queso, mucha cebolla." }
    ]
  },
  {
    id: "postres", name: "Postres", note: "",
    items: [
      { name: "Brownie con helado", price: 7500, tags: [], desc: "Brownie tibio con una bocha de helado de crema." },
      { name: "Flan casero", price: 6500, tags: [], desc: "Con dulce de leche o crema. Con los dos, si hay confianza." }
    ]
  },
  {
    id: "sin-alcohol", name: "Sin alcohol", note: "",
    items: [
      { name: "Limonada de la casa", price: 4500, tags: [], desc: "Limón, menta y jengibre. Jarra de 500 ml." },
      { name: "Gaseosa 500 ml", price: 3000, tags: [], desc: "Línea cola, lima-limón o naranja." },
      { name: "Agua", price: 2500, tags: [], desc: "Con o sin gas. Ideal para el martes." }
    ]
  }
].map(cat => ({ ...cat, items: cat.items.map(it => ({ ...it, id: slug(it.name), cat: cat.id })) }));

// Para retirar, las tiradas salen en growler de 1 litro
export const GROWLERS = {
  id: "growlers", name: "Growlers para llevar", note: "Tirada en el momento, growler de 1 litro. Traé el tuyo o llevate uno.",
  items: BEERS.map(b => ({ id: "growler-" + slug(b.name), cat: "growlers", name: `Growler ${b.name}`, price: PRICES.growler, tags: [], desc: `${b.style} · ${b.abv} · ${b.ibu} IBU`, color: b.color }))
};

export const TAGS = {
  estrella: "★ De la casa",
  veggie: "Veggie",
  picante: "Picante",
  compartir: "Para compartir"
};

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const fmtPrice = n => money.format(n);
