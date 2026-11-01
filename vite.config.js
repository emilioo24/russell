import { defineConfig } from "vite";
import { resolve } from "node:path";

// base relativa: el sitio funciona igual en usuario.github.io/<repo>/,
// en un dominio propio o abriendo dist/ desde cualquier carpeta.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        carta: resolve(import.meta.dirname, "carta.html"),
        pedir: resolve(import.meta.dirname, "pedir.html")
      }
    }
  }
});
