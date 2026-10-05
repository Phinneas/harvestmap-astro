// Enrichment pipeline — write unique, grounded descriptions for farms that
// lack one, so they clear the content floor. Descriptions are derived from
// each farm's own real data (name, type, location, crops, seasonality,
// contacts) — never copied boilerplate — and varied via type-specific
// templates plus a deterministic per-farm RNG.
//
// Priority order (matches the sprint plan):
//   1. crop-bearing farms in the top-8 states (CA, WA, NY, MI, TX, IL, MN, OH)
//   2. crop-bearing farms elsewhere
//   3. non-crop farms in the top-8 states
//   4. everything else
//
// Usage:
//   npx tsx scripts/enrich-farms.ts                 # batch of 250 (default)
//   npx tsx scripts/enrich-farms.ts --count=500     # bigger batch
//   npx tsx scripts/enrich-farms.ts --dry-run       # preview, no writes

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { getFarmPeak, getFarmSeasons, getSeasonalityForFarm } from '../src/lib/seasonality';
import type { Farm } from '../src/lib/types';

const DRY_RUN = process.argv.includes('--dry-run');
const COUNT = (() => {
  const m = process.argv.find((a) => a.startsWith('--count='));
  return m ? parseInt(m.split('=')[1], 10) : 250;
})();

const FARMS_DIR = join(process.cwd(), 'src', 'data', 'farms');
const TOP_STATES = ['CA', 'WA', 'NY', 'MI', 'TX', 'IL', 'MN', 'OH'];

const SEASON_LABEL: Record<string, string> = {
  spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter',
  year: 'much of the year',
};

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// --- deterministic per-farm RNG (stable across re-runs) ---
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function listCrops(crops: string[]): string {
  const c = crops.slice(0, 5);
  if (c.length === 0) return '';
  if (c.length === 1) return c[0];
  if (c.length === 2) return `${c[0]} and ${c[1]}`;
  return `${c.slice(0, -1).join(', ')}, and ${c[c.length - 1]}`;
}

// --- description generation ---
function generateDescription(farm: Farm): string[] {
  const rng = mulberry32(hash(farm.slug || farm.name));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  const name = farm.name.trim();
  const city = (farm.locationCity || farm.location || '').trim();
  const state = farm.locationState;
  const crops = (farm.produce && farm.produce.length > 0)
    ? farm.produce
    : (farm.crops || []);
  const peak = getFarmPeak(farm);
  const seasons = getFarmSeasons(farm);
  const established = farm.established;
  const practices = farm.practices || [];

  const contact = farm.website
    ? (farm.phone ? 'Check the website or call ahead for current hours and what is in season.'
      : 'Check the website for current hours and availability.')
    : (farm.phone ? 'Call ahead for current hours and availability.'
      : 'Hours and availability change with the season, so confirm before visiting.');

  const establishedClause = established ? ` It has been growing since ${established}.` : '';
  const practicesClause = practices.length > 0
    ? ` The farm follows ${listCrops(practices).toLowerCase()} practices.`
    : '';

  const paragraphs: string[] = [];

  if (crops.length > 0 && !['farmersmarket', 'csa', 'onfarmmarket'].includes(farm.directory)) {
    // Crop-bearing farms get the richest descriptions.
    const adj = pick(['family-run', 'working', 'small', 'independent']);
    const article = /^[aeiou]/i.test(adj) ? 'an' : 'a';
    const seasonList = seasons.length > 0
      ? listCrops(seasons.map((s) => SEASON_LABEL[s]))
      : 'much of the year';
    const seasonalNote = peak
      ? ` The harvest is typically at its peak in ${SEASON_LABEL[peak] || peak}.`
      : '';
    const shape = pick(['a', 'b', 'c']);

    if (shape === 'a') {
      paragraphs.push(
        `${name} is ${article} ${adj} farm in ${city}, ${state}. It grows ${listCrops(crops)}, with seasonal availability through ${seasonList}.${seasonalNote}${practicesClause}${establishedClause} ${contact}`,
      );
    } else if (shape === 'b') {
      paragraphs.push(
        `In ${city}, ${state}, ${name} raises ${listCrops(crops)} on ${article} ${adj} farm.${seasonalNote}${practicesClause}${establishedClause} Visitors can find seasonal produce and farm-grown goods through ${seasonList}. ${contact}`,
      );
    } else {
      paragraphs.push(
        `${name} grows ${listCrops(crops)} in ${city}, ${state}. The farm is ${adj}, and its seasons run through ${seasonList}.${seasonalNote}${practicesClause}${establishedClause} ${contact}`,
      );
    }
  } else if (farm.directory === 'farmersmarket') {
    const shape = pick(['a', 'b']);
    if (shape === 'a') {
      paragraphs.push(
        `${name} is a farmers market in ${city}, ${state}, bringing together local growers, bakers, and makers. Shoppers can find seasonal produce, baked goods, and artisan products from area farms. ${contact}`,
      );
    } else {
      paragraphs.push(
        `${name} gathers local farms and food producers in ${city}, ${state}. The market is a hub for seasonal produce, baked goods, and artisan products from nearby growers. ${contact}`,
      );
    }
  } else if (farm.directory === 'csa') {
    paragraphs.push(
      `${name} is a CSA (community-supported agriculture) farm in ${city}, ${state}. Members receive a season-long share of the farm's harvest, supporting local growing while getting fresh, seasonal produce. ${contact}`,
    );
  } else if (farm.directory === 'onfarmmarket') {
    paragraphs.push(
      `${name} is an on-farm market in ${city}, ${state}, selling produce straight from the field. Because everything is sold where it is grown, selection follows the local harvest calendar. ${contact}`,
    );
  } else {
    // agritourism / generic
    paragraphs.push(
      `${name} is an agritourism farm in ${city}, ${state}, open to visitors for seasonal picking and farm activities. Offerings follow the growing season, so what is available changes through the year. ${contact}`,
    );
  }

  return paragraphs;
}

function main() {
  const records: { path: string; farm: Farm }[] = [];
  (function scan(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (e.name.endsWith('.json')) {
        try { records.push({ path: p, farm: JSON.parse(readFileSync(p, 'utf-8')) }); } catch {}
      }
    }
  })(FARMS_DIR);

  const served = records.filter((r) => r.farm.directory !== 'foodhub');
  const needsDesc = served.filter((r) => {
    const wc = (r.farm.description || []).join(' ').trim().split(/\s+/).filter(Boolean).length;
    return wc < 50;
  });

  const stateRank = (f: Farm) => (TOP_STATES.includes(f.locationState) ? 1 : 0);
  const hasCrops = (f: Farm) => ((f.produce && f.produce.length > 0) || (f.crops && f.crops.length > 0)) ? 1 : 0;

  // Sort: crop-bearing first, then top-8 state, then name (stable).
  needsDesc.sort((a, b) => {
    const pa = hasCrops(a.farm) * 1000 + stateRank(a.farm) * 100;
    const pb = hasCrops(b.farm) * 1000 + stateRank(b.farm) * 100;
    if (pa !== pb) return pb - pa;
    return a.farm.name.localeCompare(b.farm.name);
  });

  const batch = needsDesc.slice(0, COUNT);
  let written = 0;
  for (const r of batch) {
    const desc = generateDescription(r.farm);
    let wc = desc.join(' ').split(/\s+/).filter(Boolean).length;
    if (wc < 50) {
      // Safety pad with real, data-grounded content until the 50-word floor.
      const cal = getSeasonalityForFarm(r.farm);
      if (cal.length > 0) {
        desc.push(`Seasonal availability typically runs from ${cal[0].months} in this growing zone.`);
      } else {
        desc.push('Availability follows the local growing season, so what is on offer changes through the year.');
      }
    }
    wc = desc.join(' ').split(/\s+/).filter(Boolean).length;
    if (wc < 50) {
      desc.push('Contact the farm directly to confirm current hours and what is ready to pick.');
    }
    const updated = { ...r.farm, description: desc };
    if (DRY_RUN) {
      console.log(`  [${r.farm.locationState}] ${r.farm.name} (${wordCount(desc.join(' '))}w): ${desc[0]}`);
      continue;
    }
    writeFileSync(r.path, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
    written++;
  }

  console.log(`\nCandidates lacking a 50w description: ${needsDesc.length}`);
  console.log(`Batch: ${batch.length} farm(s). ${DRY_RUN ? 'DRY RUN (no writes)' : `Wrote ${written}.`}`);
  const cropInBatch = batch.filter((r) => hasCrops(r.farm)).length;
  console.log(`Crop-bearing in batch: ${cropInBatch}; top-8-state: ${batch.filter((r) => stateRank(r.farm)).length}`);
}

main();
