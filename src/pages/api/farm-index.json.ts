export const prerender = true;
import type { APIRoute } from 'astro';
import { loadAllAugmentedFarms } from '../../lib/farm-loader';

// Static endpoint that outputs a compact farm index for the Finder API.
// Prerendered at build time — served as a static file on Cloudflare.
// The Finder API (src/pages/api/finder.ts) reads this via env.ASSETS.
export const GET: APIRoute = async () => {
  const farms = loadAllAugmentedFarms();

  const index = farms.map((f) => ({
    s: f.slug,
    n: f.name,
    c: f.locationCity || '',
    st: f.locationState || '',
    d: f.directory || '',
    lat: f.lat || null,
    lon: f.lon || null,
    cr: (f.produce || f.crops || []).slice(0, 8),
    sn: f.derivedInSeasonNow,
    pk: f.peak || f.derivedPeak || '',
    pc: f.permanentlyClosed || false,
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
