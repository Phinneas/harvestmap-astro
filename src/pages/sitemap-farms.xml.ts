export const prerender = true;
import type { APIRoute } from 'astro';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isIndexable } from '../lib/indexing';

// Generates a sitemap with all indexable farm URLs.
// Since farm pages are SSR (not in dist/), @astrojs/sitemap won't include them.
// This separate sitemap lists only farms that pass the indexing policy
// (food hubs excluded, thin name+address stubs excluded, region rollout honored)
// so Google never wastes crawl budget on noindex pages.
export const GET: APIRoute = async () => {
  const dataDir = join(process.cwd(), 'public', 'farm-data');
  const base = 'https://harvestmap.co';

  // Farm URLs are state-scoped (/farms/{state}/{slug}), so track the pair —
  // the Set guards against any duplicate (state, slug) slipping through.
  const urlSet = new Set<string>();
  const files = readdirSync(dataDir).filter(
    (f) => f.endsWith('.json') && f !== 'index.json',
  );

  for (const file of files) {
    let farms: any[];
    try {
      farms = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
    } catch {
      continue;
    }
    for (const farm of farms) {
      if (farm.slug && farm.locationState && isIndexable(farm)) {
        urlSet.add(`${(farm.locationState as string).toLowerCase()}/${farm.slug}`);
      }
    }
  }

  const urls = [...urlSet]
    .sort()
    .map((stateSlug) => `  <url>\n    <loc>${base}/farms/${stateSlug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
