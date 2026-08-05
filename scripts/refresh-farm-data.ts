// scripts/refresh-farm-data.ts
//
// Monthly refresh script — fetches USDA CSV + PickYourOwn.org enrichment,
// normalizes, geocodes, deduplicates, and writes per-farm JSON to
// src/data/farms/. Hand-authored editorial fields are preserved across
// re-imports (the thejuiceindex pattern).
//
// Usage:
//   npx tsx scripts/refresh-farm-data.ts                # all 50 states + DC
//   npx tsx scripts/refresh-farm-data.ts --state=CA     # single state
//   npx tsx scripts/refresh-farm-data.ts --states=CA,OR # multiple states
//   npx tsx scripts/refresh-farm-data.ts --usda-only    # skip PYO scraping
//
// GitHub Action: .github/workflows/refresh-farm-data.yml runs this monthly,
// commits the diff, and triggers a Cloudflare Pages rebuild.

import { writeFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  USDA_DIRECTORIES,
  fetchDirectoryCsv,
  normalizeFarm,
} from '../src/lib/usda.ts';
import { geocodeBatch } from '../src/lib/geocode.ts';
import { fetchStateEnrichment, US_STATES } from '../src/lib/enrich-pyo.ts';
import type { Farm, Directory } from '../src/lib/types.ts';

const EDITORIAL_FIELDS = [
  'tagline', 'region', 'image', 'imageAlt', 'seasons', 'peak',
  'produce', 'inSeasonNow', 'established', 'stand', 'practices',
  'description', 'calendar',
  'website', 'phone', 'email', 'permanentlyClosed',
] as const;

const OUTPUT_DIR = join(process.cwd(), 'src/data/farms');

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function namesSimilar(a: string, b: string): boolean {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return true;
  const dist = levenshtein(la, lb);
  return dist <= 2 && Math.max(la.length, lb.length) > 5;
}

function geoClose(
  a: { lat?: number; lon?: number },
  b: { lat?: number; lon?: number },
  maxMeters = 200,
): boolean {
  if (a.lat === undefined || b.lat === undefined) return false;
  if (a.lon === undefined || b.lon === undefined) return false;
  const dLat = (a.lat - b.lat) * 111000;
  const dLon = (a.lon - b.lon) * 111000 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon) < maxMeters;
}

async function preserveEditorialFields(filePath: string, farm: Farm): Promise<Farm> {
  try {
    const existing = JSON.parse(await readFile(filePath, 'utf-8'));
    for (const field of EDITORIAL_FIELDS) {
      if (existing[field] !== undefined) {
        (farm as any)[field] = existing[field];
      }
    }
  } catch {
    // No existing file — nothing to preserve
  }
  return farm;
}

interface Args {
  states: string[];
  usdaOnly: boolean;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const stateFlag = args.find((a) => a.startsWith('--state='));
  const statesFlag = args.find((a) => a.startsWith('--states='));
  const usdaOnly = args.includes('--usda-only');

  let states: string[];
  if (statesFlag) {
    states = statesFlag.split('=')[1].split(',').map((s) => s.trim().toUpperCase());
  } else if (stateFlag) {
    states = [stateFlag.split('=')[1].toUpperCase()];
  } else {
    states = US_STATES.map((s) => s.code);
  }

  return { states, usdaOnly };
}

async function loadExistingFarms(stateDir: string): Promise<Map<string, Farm>> {
  const existing = new Map<string, Farm>();
  if (!existsSync(stateDir)) return existing;

  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
        try {
          const farm = JSON.parse(await readFile(fullPath, 'utf-8'));
          if (farm.slug) existing.set(farm.slug, farm);
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  await scanDir(stateDir);
  return existing;
}

async function refreshState(state: string, usdaOnly: boolean) {
  console.log(`\n=== ${state} ===`);

  const stateDir = join(OUTPUT_DIR, state.toLowerCase());
  const existingFarms = await loadExistingFarms(stateDir);

  // Step 1: Fetch USDA CSV for all 5 directories, filter to this state
  let usdaFarms: Farm[] = [];
  for (const directory of USDA_DIRECTORIES) {
    try {
      const raw = await fetchDirectoryCsv(directory);
      const normalized = raw
        .map((r) => normalizeFarm(r, directory as Directory))
        .filter((f): f is Farm => f !== null)
        .filter((f) => f.locationState === state);
      if (normalized.length > 0) {
        console.log(`  [USDA] ${directory}: ${normalized.length}`);
      }
      usdaFarms.push(...normalized);
    } catch (e) {
      console.error(`  [USDA] ${directory} failed:`, e);
    }
  }

  // Step 2: Fetch PickYourOwn.org enrichment
  let pyoRecords: Awaited<ReturnType<typeof fetchStateEnrichment>> = [];
  if (!usdaOnly) {
    try {
      pyoRecords = await fetchStateEnrichment(state);
    } catch (e) {
      console.error(`  [PYO] failed:`, e);
    }
  }

  if (usdaFarms.length === 0 && pyoRecords.length === 0) {
    console.log(`  No data found, skipping`);
    return 0;
  }

  // Step 3: Merge PYO crop data into USDA farms
  let enrichedCount = 0;
  for (const farm of usdaFarms) {
    const match = pyoRecords.find(
      (p) =>
        namesSimilar(p.name, farm.name) &&
        (p.city === farm.locationCity || p.state === farm.locationState),
    );
    if (match) {
      if (match.crops.length > 0) {
        farm.crops = match.crops;
        enrichedCount++;
      }
      if (match.phone && !farm.phone) farm.phone = match.phone;
      if (match.website && !farm.website) farm.website = match.website;
      farm.provenance = [
        ...(farm.provenance || []),
        { source: 'pickyourown.org', lastSeen: new Date().toISOString() },
      ];
    }
  }

  // Add PYO farms not in USDA
  const usdaNames = new Set(usdaFarms.map((f) => f.name.toLowerCase()));
  for (const pyo of pyoRecords) {
    if (!usdaNames.has(pyo.name.toLowerCase()) && pyo.crops.length > 0) {
      usdaFarms.push({
        slug: pyo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        name: pyo.name,
        source: 'usda',
        directory: 'agritourism',
        location: pyo.city ? `${pyo.city}, ${pyo.state}` : pyo.state,
        locationCity: pyo.city || '',
        locationState: pyo.state,
        locationZipcode: '',
        website: pyo.website,
        phone: pyo.phone,
        crops: pyo.crops,
        provenance: [{ source: 'pickyourown.org', lastSeen: new Date().toISOString() }],
      });
    }
  }

  // Step 4: Deduplicate
  const deduped: Farm[] = [];
  for (const farm of usdaFarms) {
    const dup = deduped.find(
      (d) => namesSimilar(d.name, farm.name) && geoClose(d, farm, 200),
    );
    if (!dup) {
      deduped.push(farm);
    } else {
      dup.crops = Array.from(new Set([...(dup.crops || []), ...(farm.crops || [])]));
    }
  }

  // Step 5: Geocode farms missing coordinates
  const needGeocoding = deduped.filter((f) => f.lat === undefined);
  if (needGeocoding.length > 0) {
    try {
      const results = await geocodeBatch(
        needGeocoding.map((f) => ({
          city: f.locationCity,
          state: f.locationState,
          zip: f.locationZipcode || undefined,
        })),
      );
      needGeocoding.forEach((farm, i) => {
        if (results[i]?.lat !== undefined && results[i]?.lon !== undefined) {
          farm.lat = results[i]!.lat;
          farm.lon = results[i]!.lon;
        }
      });
    } catch (e) {
      console.error(`  [geocode] failed (non-fatal):`, e);
    }
  }

  // Step 6: Write per-farm JSON, preserving editorial fields
  await mkdir(stateDir, { recursive: true });
  let written = 0;
  let preserved = 0;
  for (const farm of deduped) {
    const filePath = join(stateDir, `${farm.slug}.json`);
    const wasExisting = existingFarms.has(farm.slug);
    await preserveEditorialFields(filePath, farm);
    if (wasExisting) preserved++;
    await writeFile(filePath, JSON.stringify(farm, null, 2) + '\n', 'utf-8');
    written++;
  }

  const geoCount = deduped.filter((f) => f.lat !== undefined).length;
  console.log(
    `  ${deduped.length} farms | ${enrichedCount} enriched | ${geoCount} geocoded | ${written} written | ${preserved} preserved`,
  );
  return deduped.length;
}

async function main() {
  const { states, usdaOnly } = parseArgs();
  console.log('HarvestMap farm data refresh');
  console.log(`States: ${states.length === 1 ? states[0] : `${states.length} states`}${usdaOnly ? ' (USDA only)' : ''}`);
  console.log(`Time: ${new Date().toISOString()}`);

  let totalFarms = 0;
  let statesWithFarms = 0;

  for (const state of states) {
    try {
      const count = await refreshState(state, usdaOnly);
      totalFarms += count;
      if (count > 0) statesWithFarms++;
    } catch (e) {
      console.error(`State ${state} failed:`, e);
    }
  }

  console.log(`\n=== Complete: ${totalFarms} farms across ${statesWithFarms} states ===`);
}

main();
