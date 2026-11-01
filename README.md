# Russell Beer Pub · demo web

Sitio estático (HTML + CSS + JS) armado con [Vite](https://vite.dev) y pnpm.

## Desarrollo

```bash
pnpm install
pnpm dev       # servidor local con recarga en vivo (también accesible desde el celu en la misma red)
pnpm build     # genera dist/
pnpm preview   # sirve dist/ para revisar el build
```

## Estructura

```
index.html        home
carta.html        carta completa (categorías + buscador)
pedir.html        pedido para retirar (carrito + checkout) — DEMO, no envía nada
css/styles.css    estilos generales (paleta y tipografías en :root)
css/shop.css      estilos de carta y pedidos
js/main.js        animaciones de la home
js/data.js        productos, cervezas y precios (de ejemplo)
js/hours.js       horarios, estado abierto/cerrado y turnos de retiro
js/carta.js, js/pedir.js, js/chrome.js
img/              fotos optimizadas para web
```

Toda la carta (cervezas, comida y precios) sale de `js/data.js`: con cambiar ese archivo se actualizan la home, la carta y los pedidos.

## Publicar en GitHub Pages

1. Crear un repo en GitHub y subir el proyecto a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` construye y publica solo (`.github/workflows/deploy.yml`).

El sitio queda en `https://<usuario>.github.io/<repo>/`. Como `vite.config.js` usa `base: "./"`,
funciona igual con cualquier nombre de repo o con un dominio propio.
