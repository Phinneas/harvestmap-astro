import type { Farm, Season, CalendarEntry } from './types';
import rulesData from '../data/seasonality-rules.json';

interface SeasonRule {
  start: number;
  end: number;
  peak: number[];
}

type ZoneRules = Record<string, SeasonRule>;
type AllZones = Record<string, ZoneRules>;

const rules = rulesData as AllZones;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const SEASON_BY_MONTH: Season[] = [
  'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
];

// Approximate USDA hardiness zone from latitude.
// This is a rough approximation — real zone boundaries depend on many factors.
// For the US, lower latitudes and coastal areas tend to be warmer zones.
// Zone 5: ~45-48°N, Zone 6: ~42-45°N, Zone 7: ~38-42°N,
// Zone 8: ~35-38°N, Zone 9: ~32-35°N, Zone 10: ~25-32°N, Zone 11: <25°N
export function estimateHardinessZone(lat: number, lon?: number): string {
  // Coastal moderation: if near coast (lon < -122 for west coast), shift warmer
  const coastalBoost = lon !== undefined && lon < -122 && lat > 35 ? -1 : 0;

  const adjustedLat = lat + coastalBoost;

  if (adjustedLat >= 48) return 'zone_5';
  if (adjustedLat >= 42) return 'zone_6';
  if (adjustedLat >= 38) return 'zone_7';
  if (adjustedLat >= 35) return 'zone_8';
  if (adjustedLat >= 32) return 'zone_9';
  if (adjustedLat >= 25) return 'zone_10';
  return 'zone_11';
}

function isMonthInRange(month: number, start: number, end: number): boolean {
  if (start <= end) {
    return month >= start && month <= end;
  }
  // Wraps around year-end (e.g., citrus: Nov–Mar)
  return month >= start || month <= end;
}

function monthRangeString(start: number, end: number): string {
  if (start === end) return MONTH_NAMES[start - 1];
  if (start < end) {
    return `${MONTH_NAMES[start - 1]} – ${MONTH_NAMES[end - 1]}`;
  }
  // Wraps around year-end
  return `${MONTH_NAMES[start - 1]} – ${MONTH_NAMES[end - 1]}`;
}

function seasonForMonthRange(start: number, end: number): Season {
  // Use the midpoint month to determine season
  let midMonth: number;
  if (start <= end) {
    midMonth = Math.floor((start + end) / 2);
  } else {
    midMonth = Math.floor(((start + end + 12) / 2) % 12) || 12;
  }
  return SEASON_BY_MONTH[midMonth - 1];
}

export function getSeasonalityForFarm(farm: Farm): CalendarEntry[] {
  const crops = farm.produce || farm.crops;
  if (!crops || crops.length === 0) return [];

  const zone = farm.lat
    ? estimateHardinessZone(farm.lat, farm.lon)
    : // Default to zone_8 for CA farms without coordinates (most of CA is 8-10)
      farm.locationState === 'CA' ? 'zone_9' : 'zone_7';

  const zoneRules = rules[zone];
  if (!zoneRules) return [];

  const entries: CalendarEntry[] = [];

  for (const crop of crops) {
    const cropLower = crop.toLowerCase().trim();
    const rule = zoneRules[cropLower];
    if (!rule) continue;

    entries.push({
      name: crop,
      months: monthRangeString(rule.start, rule.end),
      season: seasonForMonthRange(rule.start, rule.end),
    });
  }

  return entries;
}

export function isFarmInSeasonNow(farm: Farm, referenceDate = new Date()): boolean {
  // If the farm has a hand-authored inSeasonNow field, use it
  if (farm.inSeasonNow !== undefined) return farm.inSeasonNow;

  const calendar = farm.calendar || getSeasonalityForFarm(farm);
  if (calendar.length === 0) return false;

  const currentMonth = referenceDate.getMonth() + 1; // 1-12

  for (const entry of calendar) {
    // Parse months string back to numeric range — this is fragile, so we
    // also check against auto-derived rules if available
    const crops = farm.produce || farm.crops || [];
    const crop = crops.find((c) => c.toLowerCase() === entry.name.toLowerCase());
    if (crop) {
      const zone = farm.lat
        ? estimateHardinessZone(farm.lat, farm.lon)
        : farm.locationState === 'CA' ? 'zone_9' : 'zone_7';
      const zoneRules = rules[zone];
      const rule = zoneRules?.[crop.toLowerCase()];
      if (rule && isMonthInRange(currentMonth, rule.start, rule.end)) {
        return true;
      }
    }
  }

  return false;
}

export function getFarmSeasons(farm: Farm): Season[] {
  if (farm.seasons && farm.seasons.length > 0) return farm.seasons;

  const calendar = farm.calendar || getSeasonalityForFarm(farm);
  if (calendar.length === 0) return [];

  const seasons = new Set<Season>();
  for (const entry of calendar) {
    seasons.add(entry.season);
  }
  return Array.from(seasons);
}

export function getFarmPeak(farm: Farm): Season | undefined {
  if (farm.peak) return farm.peak;

  const calendar = farm.calendar || getSeasonalityForFarm(farm);
  if (calendar.length === 0) return undefined;

  // Use the season that appears most frequently in the calendar
  const seasonCounts: Record<string, number> = {};
  for (const entry of calendar) {
    seasonCounts[entry.season] = (seasonCounts[entry.season] || 0) + 1;
  }
  return Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Season;
}
