// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// HarvestMap uses on-demand rendering:
// - Most pages are prerendered (static) at build time
// - Farm detail pages (/farms/[slug]) are server-rendered on demand
//   to avoid building 27,000+ static pages (which exceeds Cloudflare's build limit)
export default defineConfig({
  site: 'https://harvestmap.co',
  adapter: cloudflare(),
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      // Include the farm sitemap (generated separately from the SSR farm pages)
      // in sitemap-index.xml so submitting the index in Search Console covers
      // every indexable farm URL, not just the prerendered pages.
      customSitemaps: ['https://harvestmap.co/sitemap-farms.xml'],
    }),
  ],
});
