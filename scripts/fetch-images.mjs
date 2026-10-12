// One-time image fetch: download self-hosted photos from Pexels into
// public/images/ and write an attribution manifest (images.json).
//
// Reads PEXELS_API_KEY from the environment. Run locally with:
//   node --env-file=.env scripts/fetch-images.mjs
//
// Idempotent: skips slots whose file already exists (re-run to top up).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = join(ROOT, 'public', 'images');

const key = process.env.PEXELS_API_KEY;
if (!key) {
  console.error('PEXELS_API_KEY is not set. Run: node --env-file=.env scripts/fetch-images.mjs');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- crop -> Pexels query (for guides) ---
function cropToQuery(crop) {
  const c = (crop || '').toLowerCase();
  if (c.includes('apple')) return 'apple orchard';
  if (c.includes('pumpkin')) return 'pumpkin patch';
  if (c.includes('corn')) return 'corn maze';
  if (c.includes('asparagus')) return 'asparagus field';
  if (c.includes('mushroom')) return 'mushrooms';
  if (c.includes('blueberry')) return 'blueberries';
  if (c.includes('blackberry')) return 'blackberries';
  if (c.includes('raspberry')) return 'raspberries';
  if (c.includes('strawberry')) return 'strawberries';
  if (c.includes('cherry')) return 'cherries';
  if (c.includes('peach')) return 'peaches';
  if (c.includes('pear')) return 'pears';
  if (c.includes('grape')) return 'grapes vineyard';
  if (c.includes('tomato')) return 'tomatoes';
  if (c.includes('pea')) return 'peas garden';
  if (c.includes('squash')) return 'winter squash';
  if (c.includes('sweet corn')) return 'corn field';
  if (c.includes('berry') || c.includes('berries')) return 'mixed berries';
  if (c.includes('fall')) return 'autumn farm road';
  return 'farm';
}

// --- slots ---
const slots = [
  // Homepage
  { id: 'hero-apple-picking', query: 'person picking apples orchard', size: 'large2x', alt: 'A person picking apples in an orchard' },
  { id: 'growers-harvest', query: 'farmer harvest orchard', size: 'large2x', alt: 'A farmer harvesting in an orchard' },
  // Crop cards (homepage "Ripe This Week")
  { id: 'crop-strawberries', query: 'strawberries', size: 'large', alt: 'Strawberries' },
  { id: 'crop-blueberries', query: 'blueberries', size: 'large', alt: 'Blueberries' },
  { id: 'crop-raspberries', query: 'raspberries', size: 'large', alt: 'Raspberries' },
  { id: 'crop-blackberries', query: 'blackberries', size: 'large', alt: 'Blackberries' },
  { id: 'crop-apples', query: 'apples', size: 'large', alt: 'Apples' },
  { id: 'crop-peaches', query: 'peaches', size: 'large', alt: 'Peaches' },
  { id: 'crop-cherries', query: 'cherries', size: 'large', alt: 'Cherries' },
  { id: 'crop-pumpkins', query: 'pumpkins', size: 'large', alt: 'Pumpkins' },
  { id: 'crop-tomatoes', query: 'tomatoes', size: 'large', alt: 'Tomatoes' },
  { id: 'crop-grapes', query: 'grapes', size: 'large', alt: 'Grapes' },
  { id: 'crop-default', query: 'fresh produce vegetables', size: 'large', alt: 'Fresh produce' },
  // Editorial farm heroes
  { id: 'farm-sunhollow-orchard', query: 'apple orchard', size: 'large2x', alt: 'An apple orchard' },
  { id: 'farm-frostapple-orchard', query: 'apple orchard winter', size: 'large2x', alt: 'An apple orchard' },
  { id: 'farm-goldfield-grainworks', query: 'wheat field', size: 'large2x', alt: 'A wheat field' },
  { id: 'farm-mossgrove-mushrooms', query: 'mushrooms', size: 'large2x', alt: 'Mushrooms' },
  { id: 'farm-tidewater-greens', query: 'leafy greens vegetables', size: 'large2x', alt: 'Leafy greens' },
  { id: 'farm-bramble-and-bee', query: 'blackberries', size: 'large2x', alt: 'Blackberries' },
];

// Add a slot per guide (slug + crop from frontmatter).
const guidesDir = join(ROOT, 'src', 'content', 'guides');
for (const f of readdirSync(guidesDir).filter((f) => f.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  const raw = readFileSync(join(guidesDir, f), 'utf-8');
  const crop = (raw.match(/^crop:\s*"([^"]+)"/m) || [])[1] || 'Farm';
  slots.push({ id: `guide-${slug}`, query: cropToQuery(crop), size: 'large2x', alt: crop });
}

async function searchPhotos(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels search ${res.status} for "${query}": ${await res.text()}`);
  const data = await res.json();
  return data.photos || [];
}

async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  mkdirSync(IMG_DIR, { recursive: true });
  const manifestPath = join(IMG_DIR, 'images.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf-8')) : [];
  const seen = new Set(manifest.map((m) => m.id));

  let fetched = 0, skipped = 0;
  for (const slot of slots) {
    if (seen.has(slot.id)) { skipped++; continue; }
    const photos = await searchPhotos(slot.query);
    if (!photos.length) { console.warn(`  NO RESULTS  ${slot.id} ("${slot.query}")`); continue; }
    const photo = photos[0];
    const src = photo.src[slot.size] || photo.src.large;
    const file = `${slot.id}.jpg`;
    await download(src, join(IMG_DIR, file));
    manifest.push({
      id: slot.id, file, alt: slot.alt,
      pexelsUrl: photo.url, photographer: photo.photographer, photographerUrl: photo.photographer_url,
    });
    console.log(`  OK  ${slot.id}  <-  ${photo.photographer}`);
    fetched++;
    await sleep(200); // gentle rate limit
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nFetched ${fetched}, skipped ${skipped}. Total manifest entries: ${manifest.length}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
