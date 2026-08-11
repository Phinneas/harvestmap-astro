/**
 * Generates per-state farm data JSON files in public/farm-data/.
 *
 * Output:
 *   public/farm-data/index.json  — { "farm-slug": "AL", ... } (slug → state code)
 *   public/farm-data/{state}.json — [ { farm }, { farm }, ... ] (all farms for that state)
 *
 * These files are served as static assets and read by the SSR farm page
 * at request time via env.ASSETS.fetch().
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const farmsDir = join(process.cwd(), 'src', 'data', 'farms');
const outDir = join(process.cwd(), 'public', 'farm-data');

interface Farm {
  slug: string;
  name: string;
  locationState?: string;
  locationCity?: string;
  locationAddress?: string;
  locationZip?: string;
  lat?: number | null;
  lon?: number | null;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  produce?: string[];
  crops?: string[];
  calendar?: any[];
  seasons?: string[];
  peak?: string;
  practices?: string[];
  image?: string;
  imageAlt?: string;
  directory?: string;
  isEnriched?: boolean;
  permanentlyClosed?: boolean;
  tagline?: string;
  region?: string;
  source?: string;
  lastConfirmedAt?: string;
  [key: string]: any;
}

function loadFarmData(): Farm[] {
  const farms: Farm[] = [];
  function scanDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.json')) {
        try {
          const data = JSON.parse(readFileSync(fullPath, 'utf-8'));
          if (data.slug) farms.push(data);
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
  scanDir(farmsDir);
  return farms;
}

function main() {
  console.log('Loading farm data from src/data/farms/...');
  const farms = loadFarmData();
  console.log(`Loaded ${farms.length} farms`);

  // Group by state
  const byState: Record<string, Farm[]> = {};
  const slugIndex: Record<string, string> = {};

  for (const farm of farms) {
    const state = (farm.locationState || 'UNKNOWN').toUpperCase();
    if (!byState[state]) byState[state] = [];
    byState[state].push(farm);
    if (farm.slug) slugIndex[farm.slug] = state;
  }

  // Create output directory
  mkdirSync(outDir, { recursive: true });

  // Write index file (slug → state)
  const indexPath = join(outDir, 'index.json');
  writeFileSync(indexPath, JSON.stringify(slugIndex));
  console.log(`Wrote index.json (${Object.keys(slugIndex).length} slugs, ${(readFileSync(indexPath, 'utf-8').length / 1024).toFixed(0)}KB)`);

  // Write per-state files
  let totalSize = 0;
  for (const [state, stateFarms] of Object.entries(byState)) {
    const statePath = join(outDir, `${state.toLowerCase()}.json`);
    const json = JSON.stringify(stateFarms);
    writeFileSync(statePath, json);
    totalSize += json.length;
    console.log(`  ${state.toLowerCase()}.json: ${stateFarms.length} farms (${(json.length / 1024).toFixed(0)}KB)`);
  }

  console.log(`\nDone! ${Object.keys(byState).length} state files + 1 index (${(totalSize / 1024 / 1024).toFixed(1)}MB total)`);
}

main();
