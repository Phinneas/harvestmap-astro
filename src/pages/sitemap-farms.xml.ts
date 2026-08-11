export const prerender = true;
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Generates a sitemap with all farm URLs.
// Since farm pages are SSR (not in dist/), @astrojs/sitemap won't include them.
// This separate sitemap ensures Google can discover all 27k farm pages.
export const GET: APIRoute = async () => {
  const indexPath = join(process.cwd(), 'public', 'farm-data', 'index.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  const base = 'https://harvestmap.example';

  const urls = Object.keys(index)
    .map((slug) => `  <url>\n    <loc>${base}/farms/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
