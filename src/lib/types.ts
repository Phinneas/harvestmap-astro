export type Directory =
  | 'agritourism'
  | 'csa'
  | 'farmersmarket'
  | 'foodhub'
  | 'onfarmmarket'
  | 'editorial';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'year';

export type OpeningHoursDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * Structured weekly opening hours for a single day.
 * `opens`/`closes` are 24h "HH:MM" local times. `closed` marks an explicit closure.
 */
export interface OpeningHours {
  day: OpeningHoursDay;
  opens?: string;
  closes?: string;
  closed?: boolean;
}

/**
 * Derived, queryable listing attributes. These are the fields a qualified
 * SERP query (e.g. "pumpkin patch with brewery", "free pumpkin patch",
 * "dog friendly pumpkin patch") can actually be answered from — the moat.
 *
 * Each boolean is the *effective* value: an explicit field on the farm wins,
 * otherwise it is inferred from name/description/hours heuristics. `inferred`
 * is true when at least one value was derived rather than hand-authored.
 */
export interface FarmFeatures {
  freeAdmission: boolean;
  hasCornMaze: boolean;
  hasBrewery: boolean; // brewery, cidery, winery, taproom, distillery
  nightHours: boolean; // open into the evening / after dark
  hasHauntedHouse: boolean; // haunted house, haunted trail, haunted hayride
  dogFriendly: boolean;
  accessible: boolean;
  openToday: boolean;
  openThisWeekend: boolean;
  inferred: boolean;
}

export interface CalendarEntry {
  name: string;
  months: string;
  season: Season;
}

export interface ProvenanceEntry {
  source: string;
  lastSeen: string;
}

export interface Farm {
  slug: string;
  name: string;
  source: 'usda' | 'editorial';
  directory: Directory;
  location: string;
  locationCity: string;
  locationState: string;
  locationZipcode: string;
  lat?: number;
  lon?: number;
  website?: string;
  phone?: string;
  email?: string;
  crops?: string[];
  provenance?: ProvenanceEntry[];
  usdaLastUpdated?: string;

  tagline?: string;
  region?: string;
  image?: string;
  imageAlt?: string;
  seasons?: Season[];
  peak?: Season;
  produce?: string[];
  inSeasonNow?: boolean;
  established?: number;
  stand?: string;
  practices?: string[];
  description?: string[];
  calendar?: CalendarEntry[];
  lastConfirmedAt?: string; // ISO date when a submission was last approved for this farm
  permanentlyClosed?: boolean; // Set when Exa search reveals farm is closed

  // --- Structured listing attributes (the SERP "moat") ---
  freeAdmission?: boolean;
  hasCornMaze?: boolean;
  hasBrewery?: boolean; // brewery, cidery, winery, taproom, distillery on-site
  nightHours?: boolean; // open into the evening / after dark
  hasHauntedHouse?: boolean; // haunted house, haunted trail, haunted hayride
  dogFriendly?: boolean;
  accessible?: boolean;
  openingHours?: OpeningHours[];
}
