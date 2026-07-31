import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";

// NOTE: Tailwind is compiled by the standalone CLI (see npm run css ->
// public/hm.css, linked from Base.astro) instead of the Vite plugin —
// the plugin's stylesheet never lands in dist on this setup.
export default defineConfig({
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
