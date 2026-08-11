/**
 * Runtime-safe farm augmentation (no Node.js fs imports).
 * Used by SSR farm pages to compute derived seasonality fields.
 */

import type { Farm } from './types';
import {
  getSeasonalityForFarm,
  isFarmInSeasonNow,
  getFarmSeasons,
  getFarmPeak,
} from './seasonality';

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
