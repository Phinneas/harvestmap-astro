// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://harvestmap.co';

// Pages that are built but should never be listed in the sitemap.
const SITEMAP_EXCLUDE = ['/admin/', '/style-guide/'];

// lastmod is only emitted where a real date exists: the publishDate in the
// frontmatter of guides and blog posts. Directory pages get no lastmod, since
// a build-time stamp would tell crawlers every page changed on every deploy.
function contentDates() {
  /** @type {Map<string, string>} */
  const dates = new Map();
  for (const collection of ['guides', 'blog']) {
    const dir = join(process.cwd(), 'src', 'content', collection);
    let files = [];
    try {
      files = readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
    } catch {
      continue;
    }
    for (const file of files) {
      const text = readFileSync(join(dir, file), 'utf-8');
      const match = text.match(/^publishDate:\s*["']?([^"'\n]+)/m);
      if (!match) continue;
      const date = new Date(match[1].trim());
      // Skip unparseable dates, and future ones: a lastmod ahead of today is invalid.
      if (Number.isNaN(date.valueOf()) || date.valueOf() > Date.now()) continue;
      const slug = file.replace(/\.mdx?$/, '');
      dates.set(`${SITE}/${collection}/${slug}/`, date.toISOString());
    }
  }
  return dates;
}

const lastmodByUrl = contentDates();

// HarvestMap uses on-demand rendering:
// - Most pages are prerendered (static) at build time
// - Farm detail pages (/farms/[slug]) are server-rendered on demand
//   to avoid building 27,000+ static pages (which exceeds Cloudflare's build limit)
export default defineConfig({
  site: SITE,
  adapter: cloudflare(),
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDE.some((path) => page.includes(path)),
      // Farm pages are server-rendered, so they live in their own sitemap
      // (src/pages/sitemap-farms.xml.ts). Listing it here puts it in
      // sitemap-index.xml, so one index covers the whole site.
      customSitemaps: [`${SITE}/sitemap-farms.xml`],
      serialize(item) {
        const lastmod = lastmodByUrl.get(item.url);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
