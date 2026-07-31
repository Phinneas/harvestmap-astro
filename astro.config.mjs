// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// HarvestMap is a static, zero-JS-framework Astro site.
// All interactivity (theme toggle, mobile nav, filters) is vanilla JS.
export default defineConfig({
  site: 'https://harvestmap.example',
  build: {
    inlineStylesheets: 'never', // keep one external CSS file (easier handoff / inspection)
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
