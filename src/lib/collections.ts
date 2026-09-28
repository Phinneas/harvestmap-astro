/**
 * "Collection" pages for HarvestMap.
 *
 * These are the qualified SERP queries the directory can answer from its
 * structured listing attributes: farmers markets, farm stands, CSAs, pumpkin
 * patches, orchards, corn mazes, Christmas tree farms, and the qualified fall
 * combos (night corn mazes, pumpkin patches with a corn maze / haunted house).
 * Each collection is a predicate over the farm's `listingTypeKey` — the same
 * type taxonomy the finder uses — so a single generated route serves every
 * topic and every state instead of hand-written per-topic articles.
 *
 * Deliberately absent: "best…near you" and "cute…worth the drive" — those are
 * local/editorial intent and belong to the state pages and the finder, not to
 * a national static page. Also absent: "free admission" and "dog friendly",
 * which have no data yet; add a predicate here the day the flags are
 * populated and they light up for free.
 */

import type { Farm } from './types';
import { deriveActivity, listingTypeKey } from './activity';
import { deriveFarmFeatures } from './features';
import { getStatesWithFarms } from './farm-loader';

export type AugmentedFarm = Farm & {
  derivedInSeasonNow: boolean;
  isEnriched: boolean;
  features: ReturnType<typeof deriveFarmFeatures>;
};

export const STATE_NAMES: Record<string, string> = Object.fromEntries(
  getStatesWithFarms().map((s) => [s.code, s.name]),
);

export interface FeatureCollection {
  id: string;
  label: string;
  icon: string;
  title: (stateName?: string) => string;
  description: (count: number, stateName?: string) => string;
  predicate: (f: AugmentedFarm) => boolean;
}

export const FEATURE_COLLECTIONS: FeatureCollection[] = [
  {
    id: 'farmers-markets',
    label: 'Farmers markets',
    icon: '🧺',
    title: (s) => `Farmers markets${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} farmers markets${s ? ` in ${s}` : ''} with seasonal produce, baked goods, and local growers.`,
    predicate: (f) => listingTypeKey(f) === 'farmersmarket',
  },
  {
    id: 'farm-stands',
    label: 'Farm stands & on-farm markets',
    icon: '🛒',
    title: (s) => `Farm stands & on-farm markets${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} farm stands and on-farm markets${s ? ` in ${s}` : ''} selling produce straight from the field.`,
    predicate: (f) => ['farm-stand', 'onfarmmarket'].includes(listingTypeKey(f)),
  },
  {
    id: 'csa',
    label: 'CSA farms',
    icon: '📦',
    title: (s) => `CSA farms${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} CSA farms${s ? ` in ${s}` : ''} offering season-long harvest shares.`,
    predicate: (f) => listingTypeKey(f) === 'csa',
  },
  {
    id: 'pumpkin-patches',
    label: 'Pumpkin patches',
    icon: '🎃',
    title: (s) => `Pumpkin patches${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} pumpkin patches${s ? ` in ${s}` : ''} for u-pick pumpkins, hayrides, and fall weekends.`,
    predicate: (f) => listingTypeKey(f) === 'pumpkin-patch',
  },
  {
    id: 'orchards',
    label: 'Orchards',
    icon: '🌳',
    title: (s) => `Orchards${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} orchards${s ? ` in ${s}` : ''} growing peaches, pears, cherries, and more.`,
    predicate: (f) => listingTypeKey(f) === 'orchard',
  },
  {
    id: 'apple-orchards',
    label: 'Apple orchards',
    icon: '🍎',
    title: (s) => `Apple orchards${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} apple orchards${s ? ` in ${s}` : ''} for u-pick apples, cider, and fall outings.`,
    predicate: (f) => listingTypeKey(f) === 'apple-orchard',
  },
  {
    id: 'corn-mazes',
    label: 'Corn mazes',
    icon: '🌾',
    title: (s) => `Corn mazes${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} corn mazes${s ? ` in ${s}` : ''} open for fall weekends.`,
    predicate: (f) => listingTypeKey(f) === 'corn-maze',
  },
  {
    id: 'christmas-tree-farms',
    label: 'Christmas tree farms',
    icon: '🎄',
    title: (s) => `Christmas tree farms${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} Christmas tree farms${s ? ` in ${s}` : ''} for cut-your-own trees in November and December.`,
    predicate: (f) => listingTypeKey(f) === 'christmas-tree',
  },
  {
    id: 'corn-mazes-at-night',
    label: 'Corn mazes open at night',
    icon: '🌙',
    title: (s) => `Corn mazes open at night${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} corn mazes${s ? ` in ${s}` : ''} open after dark — flashlight mazes, moonlight walks, and late-night hours.`,
    predicate: (f) =>
      f.features.nightHours && (f.features.hasCornMaze || deriveActivity(f) === 'corn-maze'),
  },
  {
    id: 'pumpkin-patches-with-corn-maze',
    label: 'Pumpkin patches with a corn maze',
    icon: '🌽',
    title: (s) => `Pumpkin patches with a corn maze${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} pumpkin patches${s ? ` in ${s}` : ''} that also run a corn maze.`,
    predicate: (f) =>
      deriveActivity(f) === 'pumpkin-patch' && f.features.hasCornMaze,
  },
  {
    id: 'pumpkin-patches-haunted',
    label: 'Pumpkin patches with a haunted house',
    icon: '👻',
    title: (s) => `Pumpkin patches with a haunted house${s ? ` in ${s}` : ''}`,
    description: (n, s) =>
      `${n} pumpkin patches${s ? ` in ${s}` : ''} with a haunted house, haunted trail, or haunted hayride.`,
    predicate: (f) =>
      deriveActivity(f) === 'pumpkin-patch' && f.features.hasHauntedHouse,
  },
];

export function getCollection(id: string): FeatureCollection | undefined {
  return FEATURE_COLLECTIONS.find((c) => c.id === id);
}

export function collectionStates(
  collection: FeatureCollection,
  farms: AugmentedFarm[],
): { code: string; name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const f of farms) {
    if (!collection.predicate(f)) continue;
    counts[f.locationState] = (counts[f.locationState] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([code, count]) => ({ code, name: STATE_NAMES[code] || code, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
