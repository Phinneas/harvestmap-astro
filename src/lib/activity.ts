/**
 * Listing-activity classification for HarvestMap.
 *
 * "Agritourism" is a declining, definitional term that also pulls in unrelated
 * searches (Italian "agriturismo"). What people actually search are concrete
 * activities: pumpkin patch, corn maze, apple orchard, farm tour, farm stand.
 * This module derives a human-facing activity label for listings tagged
 * `agritourism` (and featured/editorial listings) so the site speaks in the
 * same words searchers use.
 *
 * The labels here are heuristic, derived from the listing's name, tagline,
 * description, practices, stand, and crop list. A hand-authored field wins
 * when present (see the `farmActivity` override in types).
 */

import type { Farm } from './types';

export type Activity =
  | 'pumpkin-patch'
  | 'corn-maze'
  | 'apple-orchard'
  | 'orchard'
  | 'farm-tour'
  | 'farm-stand'
  | 'u-pick'
  | 'berry-farm'
  | 'winery'
  | 'christmas-tree'
  | 'farm';

export const ACTIVITY_LABELS: Record<Activity, string> = {
  'pumpkin-patch': 'Pumpkin patch',
  'corn-maze': 'Corn maze',
  'apple-orchard': 'Apple orchard',
  'orchard': 'Orchard',
  'farm-tour': 'Farm tour',
  'farm-stand': 'Farm stand',
  'u-pick': 'U-pick farm',
  'berry-farm': 'Berry farm',
  'winery': 'Winery',
  'christmas-tree': 'Christmas tree farm',
  'farm': 'Farm',
};

// Human-facing labels for the non-agritourism directories we still serve.
export const DIRECTORY_LABELS: Record<string, string> = {
  farmersmarket: "Farmers' Market",
  csa: 'CSA',
  onfarmmarket: 'On-farm market',
};

interface ActivityMatch {
  key: Activity;
  terms: string[];
}

// Ordered from most specific to least. The first match wins as the primary tag.
const ACTIVITY_RULES: ActivityMatch[] = [
  { key: 'corn-maze', terms: ['corn maze', 'cornmaze', 'maize maze', 'hay maze', 'straw maze'] },
  { key: 'pumpkin-patch', terms: ['pumpkin patch', 'pumpkin farm', 'pumpkinfest', 'pumpkin'] },
  { key: 'apple-orchard', terms: ['apple orchard', 'apple farm', 'apple picking', 'apple'] },
  { key: 'winery', terms: ['winery', 'vineyard'] },
  { key: 'christmas-tree', terms: ['christmas tree', 'christmas trees', 'tree farm'] },
  { key: 'farm-tour', terms: ['farm tour', 'farm tours', 'ranch tour', 'barn tour'] },
  { key: 'farm-stand', terms: ['farm stand', 'produce stand', 'roadside stand', 'market stand'] },
  { key: 'orchard', terms: ['orchard', 'orchards'] },
  { key: 'u-pick', terms: ['u-pick', 'u pick', 'you-pick', 'you pick', 'pick your own', 'p.y.o', 'pyo'] },
  { key: 'berry-farm', terms: ['berry', 'berries', 'blueberry', 'strawberry', 'raspberry', 'blackberry'] },
];

function haystack(farm: Farm): string {
  const parts: (string | undefined)[] = [
    farm.name,
    farm.tagline,
    farm.region,
    farm.stand,
    ...(farm.description || []),
    ...(farm.practices || []),
    ...(farm.produce || []),
    ...(farm.crops || []),
  ];
  return parts.filter((p): p is string => !!p).join(' ').toLowerCase();
}

/**
 * Derive the primary activity for a listing. Falls back to "farm" when no
 * signal is present (honest for name-and-address stubs).
 */
export function deriveActivity(farm: Farm): Activity {
  const text = haystack(farm);
  for (const rule of ACTIVITY_RULES) {
    if (rule.terms.some((t) => text.includes(t))) return rule.key;
  }
  return 'farm';
}

export function activityLabel(activity: Activity): string {
  return ACTIVITY_LABELS[activity];
}

/**
 * Stable key used in the finder index and URL params. For agritourism and
 * featured listings it is the derived activity; for other directories it is
 * the directory itself, so one filter covers everything.
 */
export function listingTypeKey(farm: Farm): string {
  if (farm.directory === 'agritourism' || farm.directory === 'editorial') {
    return deriveActivity(farm);
  }
  return farm.directory;
}

export function listingTypeLabel(farm: Farm): string {
  if (farm.directory === 'agritourism' || farm.directory === 'editorial') {
    return activityLabel(deriveActivity(farm));
  }
  return DIRECTORY_LABELS[farm.directory] || 'Farm';
}

/** CSS modifier for the type badge. Activities share one neutral style. */
export function listingTypeCss(farm: Farm): string {
  if (farm.directory === 'agritourism' || farm.directory === 'editorial') {
    return 'activity';
  }
  return farm.directory;
}
