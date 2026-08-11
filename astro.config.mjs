// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// HarvestMap uses on-demand rendering:
// - Most pages are prerendered (static) at build time
// - Farm detail pages (/farms/[slug]) are server-rendered on demand
//   to avoid building 27,000+ static pages (which exceeds Cloudflare's build limit)
export default defineConfig({
  site: 'https://harvestmap.example',
  adapter: cloudflare(),
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
