/**
 * Site-level indexing policy for HarvestMap.
 *
 * Three levers, all in one place so they stay consistent across the SSR
 * detail pages, the finder index, and the sitemap:
 *
 *   1. EXCLUDED_DIRECTORIES — directories we never serve (food hubs: B2B
 *      wholesale intent, no consumer overlap).
 *   2. meetsQualityBar — the thin-content floor. A listing is indexable when
 *      it has a name and address plus at least one meaningful content signal
 *      (a substantive description, a real photo, crop data, or two contact
 *      details). This keeps bare name-and-address stubs from dragging down
 *      the Helpful Content signal site-wide.
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

const PLACEHOLDER_IMAGE = '/images/farm-placeholder.svg';

/**
 * Count the words in a farm's description/notes paragraphs.
 * Used by the thin-content floor so prose-only enriched farms are never noindexed.
 */
function descriptionWordCount(farm: Farm): number {
  const paragraphs = farm.description || [];
  return paragraphs
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * A "real" photo is a farm's own image — not the generic placeholder and not
 * Unsplash stock art. Unsplash images are decorative and don't signal that a
 * listing has been enriched.
 */
function hasRealPhoto(farm: Farm): boolean {
  if (!farm.image || farm.image === PLACEHOLDER_IMAGE) return false;
  if (/^https?:\/\/(images\.unsplash\.com|unsplash\.com)/i.test(farm.image)) return false;
  return true;
}

/**
 * name + address + at least one meaningful content signal.
 *
 * A listing clears the floor when it has ANY of:
 *   - a substantive description (>= 50 words of notes/prose)
 *   - a real photo (not the placeholder / Unsplash stock)
 *   - crop/product data
 *   - at least two contact signals (hours, phone, website)
 *
 * This is the noindex rule from the content audit: a page is only noindexed
 * when it is thin on all three enrichment dimensions (description, photos,
 * crops) AND lacks usable contact detail. Farms enriched with prose, a real
 * photo, or a crop list are always indexable.
 */
export function meetsQualityBar(farm: Farm): boolean {
  const hasName = !!farm.name;
  const hasAddress = !!(farm.locationCity || farm.location || farm.locationZipcode);

  const richDescription = descriptionWordCount(farm) >= 50;
  const realPhoto = hasRealPhoto(farm);
  const hasCrops =
    (farm.produce && farm.produce.length > 0) ||
    (farm.crops && farm.crops.length > 0);

  const hasHours = !!farm.stand;
  const hasPhone = !!farm.phone;
  const hasWebsite = !!farm.website;
  const contactSignals = [hasHours, hasPhone, hasWebsite].filter(Boolean).length;

  return hasName && hasAddress && (richDescription || realPhoto || hasCrops || contactSignals >= 2);
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
