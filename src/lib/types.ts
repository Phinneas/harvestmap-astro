export type Directory =
  | 'agritourism'
  | 'csa'
  | 'farmersmarket'
  | 'foodhub'
  | 'onfarmmarket'
  | 'editorial';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'year';

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
}
