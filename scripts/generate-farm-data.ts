/**
 * Generates per-state farm data JSON files in public/farm-data/.
 *
 * Output:
 *   public/farm-data/{state}.json — [ { farm }, { farm }, ... ] (all farms for that state)
 *
 * These files are served as static assets and read by the SSR farm page
 * at request time via env.ASSETS.fetch(). Farm URLs are state-scoped
 * (/farms/{state}/{slug}), so no slug→state index is needed.
 *
 * This is also the build-time validation gate: it aborts if any farm name
 * matches junk patterns or if a (state, slug) key is duplicated.
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isJunkFarmName } from '../src/lib/farm-names';

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
  freeAdmission?: boolean;
  hasCornMaze?: boolean;
  hasBrewery?: boolean;
  nightHours?: boolean;
  dogFriendly?: boolean;
  accessible?: boolean;
  openingHours?: any[];
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
          // Exclude food hubs (B2B wholesale intent) from the served data.
          if (data.slug && data.directory !== 'foodhub') farms.push(data);
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

  // --- Build-time validation: fail loudly on junk names or (state, slug) dups ---
  const junk = farms.filter((f) => isJunkFarmName(f.name));
  if (junk.length > 0) {
    const sample = junk
      .slice(0, 20)
      .map((f) => `  ${f.name} (${f.locationState}, ${f.slug})`)
      .join('\n');
    throw new Error(
      `Build aborted: ${junk.length} farm(s) have junk names.\n${sample}\n` +
      `Run \`npx tsx scripts/cleanup-farm-names.ts\` to fix.`,
    );
  }

  const seen = new Set<string>();
  const dupKeys = new Set<string>();
  for (const farm of farms) {
    const key = `${(farm.locationState || 'UNKNOWN').toUpperCase()}::${farm.slug}`;
    if (seen.has(key)) dupKeys.add(key);
    seen.add(key);
  }
  if (dupKeys.size > 0) {
    throw new Error(`Build aborted: duplicate (state, slug) keys: ${[...dupKeys].join(', ')}`);
  }

  // Group by state
  const byState: Record<string, Farm[]> = {};
  for (const farm of farms) {
    const state = (farm.locationState || 'UNKNOWN').toUpperCase();
    if (!byState[state]) byState[state] = [];
    byState[state].push(farm);
  }

  // Create output directory
  mkdirSync(outDir, { recursive: true });

  // Write per-state files
  let totalSize = 0;
  for (const [state, stateFarms] of Object.entries(byState)) {
    const statePath = join(outDir, `${state.toLowerCase()}.json`);
    const json = JSON.stringify(stateFarms);
    writeFileSync(statePath, json);
    totalSize += json.length;
    console.log(`  ${state.toLowerCase()}.json: ${stateFarms.length} farms (${(json.length / 1024).toFixed(0)}KB)`);
  }

  console.log(`\nDone! ${Object.keys(byState).length} state files (${(totalSize / 1024 / 1024).toFixed(1)}MB total)`);
}

main();
