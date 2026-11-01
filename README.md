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
index.html        página única
css/styles.css    estilos (paleta y tipografías en :root)
js/main.js        animaciones, estado abierto/cerrado, canillas, etc.
img/              fotos optimizadas para web
```

Las cervezas de la pizarra se editan en el array `BEERS` de `js/main.js`.

## Publicar en GitHub Pages

1. Crear un repo en GitHub y subir el proyecto a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` construye y publica solo (`.github/workflows/deploy.yml`).

El sitio queda en `https://<usuario>.github.io/<repo>/`. Como `vite.config.js` usa `base: "./"`,
funciona igual con cualquier nombre de repo o con un dominio propio.
