/**
 * Site-level indexing policy for HarvestMap.
 *
 * Three levers, all in one place so they stay consistent across the SSR
 * detail pages, the finder index, and the sitemap:
 *
 *   1. EXCLUDED_DIRECTORIES — directories we never serve (food hubs: B2B
 *      wholesale intent, no consumer overlap).
 *   2. meetsQualityBar — the thin-content floor. A listing is indexable when
 *      it has a name and address plus at least two of {hours, crops/products,
 *      phone, website}. This is what keeps name-and-address stubs from
 *      dragging down the Helpful Content signal site-wide.
 *   3. RELEASED_STATES — a batched rollout toggle. Set to a list of state
 *      codes to index only those regions while the rest are noindexed; expand
 *      as listings get enriched. Default is "ALL".
 */

import type { Farm } from './types';

export const EXCLUDED_DIRECTORIES = ['foodhub'] as const;

/**
 * Batched rollout. Default "ALL" indexes every listing that meets the quality
 * bar. To release by region, replace with a list, e.g. ['NY', 'PA', 'OH'].
 */
export const RELEASED_STATES: string[] | 'ALL' = 'ALL';

export function isServedFarm(farm: Farm): boolean {
  return !(EXCLUDED_DIRECTORIES as readonly string[]).includes(farm.directory);
}

/**
 * name + address + 2 of {hours, crops/products, phone, website}
 */
export function meetsQualityBar(farm: Farm): boolean {
  const hasName = !!farm.name;
  const hasAddress = !!(farm.locationCity || farm.location || farm.locationZipcode);

  const hasHours = !!farm.stand;
  const hasProducts =
    (farm.produce && farm.produce.length > 0) ||
    (farm.crops && farm.crops.length > 0);
  const hasPhone = !!farm.phone;
  const hasWebsite = !!farm.website;

  const signalCount = [hasHours, hasProducts, hasPhone, hasWebsite].filter(Boolean).length;

  return hasName && hasAddress && signalCount >= 2;
}

/**
 * Whether a farm should be served AND indexed. Editorial/hand-authored farms
 * are always indexable; everything else must be served, released by region,
 * and clear the quality bar.
 */
export function isIndexable(farm: Farm): boolean {
  if (!isServedFarm(farm)) return false;
  if (farm.source === 'editorial') return true;
  if (RELEASED_STATES !== 'ALL' && !RELEASED_STATES.includes(farm.locationState)) {
    return false;
  }
  return meetsQualityBar(farm);
}
