/**
 * Fall "collection" pages for HarvestMap.
 *
 * These are the qualified SERP queries the directory can answer from its
 * structured listing attributes ("the moat"): corn mazes open at night,
 * pumpkin patches with a corn maze, pumpkin patches with a haunted house.
 * Each collection is a predicate over the farm's already-derived `features`
 * and `deriveActivity`, so a single generated route serves every topic and
 * every state instead of hand-written per-topic articles.
 *
 * Deliberately absent: "best…near you" and "cute…worth the drive" — those are
 * local/editorial intent and belong to the state pages and the finder, not to
 * a national static page. Also absent: "free admission", which has no data
 * yet; add a predicate here the day the flag is populated and it lights up
 * for free.
 */

import type { Farm } from './types';
import { deriveActivity } from './activity';
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
