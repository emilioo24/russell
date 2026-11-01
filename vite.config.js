import { defineConfig } from "vite";

// base relativa: el sitio funciona igual en usuario.github.io/<repo>/,
// en un dominio propio o abriendo dist/ desde cualquier carpeta.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0
  }
});
