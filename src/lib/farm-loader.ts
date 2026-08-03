import type { Farm } from './types';
import {
  getSeasonalityForFarm,
  isFarmInSeasonNow,
  getFarmSeasons,
  getFarmPeak,
} from './seasonality';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read all farm JSON files from the filesystem at build time.
// Using fs.readFileSync instead of import.meta.glob because
// Vite's module system overflows the V8 call stack with 8,000+ files.
function loadFarmData(): Farm[] {
  const farmsDir = join(process.cwd(), 'src', 'data', 'farms');
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
          farms.push(data);
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }

  scanDir(farmsDir);
  return farms.sort((a, b) => a.name.localeCompare(b.name));
}

const allFarms = loadFarmData();

export function loadAllFarms(): Farm[] {
  return allFarms;
}

// Only farms with crop data (produce, crops, or calendar).
// These appear in the homepage directory grid with rich cards.
// All farms get individual detail pages; this filter is only for
// the homepage grid which highlights enriched farms.
export function loadEnrichedFarms(): Farm[] {
  return allFarms.filter(
    (f) =>
      (f.produce && f.produce.length > 0) ||
      (f.crops && f.crops.length > 0) ||
      (f.calendar && f.calendar.length > 0) ||
      f.source === 'editorial',
  );
}

// All farms in a given state
export function loadFarmsByState(stateCode: string): Farm[] {
  const upper = stateCode.toUpperCase();
  return allFarms.filter((f) => f.locationState === upper);
}

// Enriched farms in a given state
export function loadEnrichedFarmsByState(stateCode: string): Farm[] {
  return loadFarmsByState(stateCode).filter(
    (f) =>
      (f.produce && f.produce.length > 0) ||
      (f.crops && f.crops.length > 0) ||
      (f.calendar && f.calendar.length > 0) ||
      f.source === 'editorial',
  );
}

// State codes that have at least one farm
export function getStatesWithFarms(): { code: string; name: string; count: number; enriched: number }[] {
  const stateNames: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
    FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
    IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
    NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
    PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
    TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
    WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  };

  const counts: Record<string, { count: number; enriched: number }> = {};
  for (const farm of allFarms) {
    const state = farm.locationState;
    if (!counts[state]) counts[state] = { count: 0, enriched: 0 };
    counts[state].count++;
    if (
      (farm.produce && farm.produce.length > 0) ||
      (farm.crops && farm.crops.length > 0) ||
      (farm.calendar && farm.calendar.length > 0) ||
      farm.source === 'editorial'
    ) {
      counts[state].enriched++;
    }
  }

  return Object.entries(counts)
    .filter(([code]) => code !== 'DC') // DC is not a state — farms still get individual pages
    .map(([code, { count, enriched }]) => ({
      code,
      name: stateNames[code] || code,
      count,
      enriched,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function augmentFarm(farm: Farm): Farm & {
  derivedCalendar: ReturnType<typeof getSeasonalityForFarm>;
  derivedSeasons: ReturnType<typeof getFarmSeasons>;
  derivedPeak?: ReturnType<typeof getFarmPeak>;
  derivedInSeasonNow: boolean;
  isEnriched: boolean;
} {
  const derivedCalendar =
    farm.calendar && farm.calendar.length > 0
      ? farm.calendar
      : getSeasonalityForFarm(farm);

  const derivedSeasons = getFarmSeasons(farm);
  const derivedPeak = getFarmPeak(farm);
  const derivedInSeasonNow = isFarmInSeasonNow(farm);

  const isEnriched = Boolean(
    farm.tagline || (farm.description && farm.description.length > 0) || farm.calendar,
  );

  return {
    ...farm,
    derivedCalendar,
    derivedSeasons,
    derivedPeak,
    derivedInSeasonNow,
    isEnriched,
  };
}

export function loadAllAugmentedFarms() {
  return loadAllFarms().map(augmentFarm);
}

export function loadEnrichedAugmentedFarms() {
  return loadEnrichedFarms().map(augmentFarm);
}

export function getFarmBySlug(slug: string): (ReturnType<typeof augmentFarm>) | null {
  const farms = loadAllAugmentedFarms();
  return farms.find((f) => f.slug === slug) || null;
}
