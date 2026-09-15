/**
 * Listing-attribute derivation for HarvestMap.
 *
 * These are the structured fields that make a listing answerable for
 * qualified SERP queries ("free pumpkin patches", "pumpkin patch with
 * brewery", "dog friendly pumpkin patch", "accessible pumpkin patch").
 * No external source holds this data today, so we seed it from two places:
 *
 *   1. Explicit hand-authored fields on the farm JSON (authoritative).
 *   2. High-confidence heuristics over name/description/practices/hours.
 *
 * The "open today / open this weekend" fields are computed from structured
 * `openingHours` (or a conservatively parsed free-text `stand`) and never
 * fabricated: when we don't hold hours data, they resolve to `false`.
 */

import type { Farm, FarmFeatures, OpeningHours, OpeningHoursDay } from './types';

const DAY_ORDER: OpeningHoursDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Map JS Date.getDay() (0=Sun) to our day token.
function dayFromDate(date: Date): OpeningHoursDay {
  return DAY_ORDER[date.getDay()];
}

// ---------------------------------------------------------------------------
// Keyword dictionaries. Matched against a normalized haystack built from the
// farm's name, tagline, region, description, practices, stand, and crops.
// ---------------------------------------------------------------------------

const CORN_MAZE_TERMS = ['corn maze', 'cornmaze', 'maize maze', 'maze'];
const BREWERY_TERMS = [
  'brewery', 'cidery', 'cider mill', 'taproom', 'tap room', 'tasting room',
  'winery', 'distillery', 'hard cider',
];
const NIGHT_TERMS = [
  'flashlight', 'moonlight', 'after dark', 'glow', 'evening',
  'night hours', 'late night', 'sunset', 'bonfire',
];
const HAUNTED_TERMS = [
  'haunted house', 'haunted trail', 'haunted hayride', 'haunted barn',
  'haunted maze', 'haunted',
];
const DOG_TERMS = [
  'dog friendly', 'dog-friendly', 'dogs welcome', 'leashed dogs',
  'pets welcome', 'pet friendly', 'pet-friendly',
];
const ACCESSIBLE_TERMS = [
  'accessible', 'wheelchair', 'wheelchair accessible', 'ada accessible',
  'stroller friendly',
];
const FREE_TERMS = [
  'free admission', 'free entry', 'no admission', 'admission free',
  'free to visit', 'no entry fee', 'free parking',
];

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

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

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t));
}

// ---------------------------------------------------------------------------
// Free-text hours parsing
// ---------------------------------------------------------------------------

const DAY_ALIASES: Record<string, OpeningHoursDay> = {
  mon: 'mon', monday: 'mon',
  tue: 'tue', tues: 'tue', tuesday: 'tue',
  wed: 'wed', weds: 'wed', wednesday: 'wed',
  thu: 'thu', thur: 'thu', thurs: 'thu', thursday: 'thu',
  fri: 'fri', friday: 'fri',
  sat: 'sat', saturday: 'sat',
  sun: 'sun', sunday: 'sun',
};

const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi;

function parseTimeTo24(token: string): string | null {
  TIME_RE.lastIndex = 0;
  const m = TIME_RE.exec(token);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3].toLowerCase();
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  if (hour > 23 || minutes > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function extractTimes(text: string): { opens: string; closes: string } | null {
  const times = text.match(TIME_RE) || [];
  if (times.length < 2) return null;
  const first = times[0];
  const last = times[times.length - 1];
  if (!first || !last) return null;
  const opens = parseTimeTo24(first);
  const closes = parseTimeTo24(last);
  if (!opens || !closes) return null;
  return { opens, closes };
}

/**
 * Conservatively parse a free-text `stand`/hours string into structured
 * opening hours. Returns null unless BOTH days and open/close times can be
 * read confidently. Handles "U-pick Wed–Sun, 8am–6pm", "Daily 9am–5pm",
 * "Sat & Sun 10am–4pm", etc.
 */
function parseStandHours(stand: string): OpeningHours[] | null {
  const text = stand.toLowerCase().trim();
  if (!text) return null;

  const times = extractTimes(text);
  if (!times) return null;

  let days: OpeningHoursDay[] | null = null;

  if (/daily|every day|7 days|seven days|open daily/.test(text)) {
    days = DAY_ORDER.slice();
  } else {
    // Collect day tokens in order of appearance.
    const tokens = text.match(/mon(?:day)?|tues?|tue(?:sday)?|weds?|wed(?:nesday)?|thur?s?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?/g);
    if (!tokens || tokens.length === 0) return null;
    const seen: OpeningHoursDay[] = [];
    for (const t of tokens) {
      const day = DAY_ALIASES[t] || DAY_ALIASES[t.replace(/day$/, '')];
      if (day && !seen.includes(day)) seen.push(day);
    }
    if (seen.length === 0) return null;

    // If two day tokens are present and are endpoints of a range (e.g. "wed–sun"),
    // expand the range. Otherwise use the explicit list.
    if (seen.length === 2) {
      const a = DAY_ORDER.indexOf(seen[0]);
      const b = DAY_ORDER.indexOf(seen[1]);
      if (a !== -1 && b !== -1 && a !== b) {
        days = [];
        for (let i = a; ; i = (i + 1) % 7) {
          days.push(DAY_ORDER[i]);
          if (i === b) break;
        }
      } else {
        days = seen;
      }
    } else {
      days = seen;
    }
  }

  if (!days || days.length === 0) return null;

  return days.map((day) => ({ day, opens: times.opens, closes: times.closes }));
}

function getOpeningHours(farm: Farm): OpeningHours[] | null {
  if (farm.openingHours && farm.openingHours.length > 0) return farm.openingHours;
  if (farm.stand) return parseStandHours(farm.stand);
  return null;
}

function isOpenOn(hours: OpeningHours[] | null, day: OpeningHoursDay): boolean {
  if (!hours) return false;
  const entry = hours.find((h) => h.day === day);
  if (!entry) return false;
  if (entry.closed) return false;
  return true;
}

function closesAfterDark(hours: OpeningHours[] | null): boolean {
  if (!hours) return false;
  return hours.some((h) => {
    if (h.closed || !h.closes) return false;
    const closeHour = parseInt(h.closes.slice(0, 2), 10);
    return closeHour >= 20 || closeHour < 4; // after 8pm, or past midnight
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const FEATURE_LABELS: Record<keyof FarmFeatures, string> = {
  freeAdmission: 'Free admission',
  hasCornMaze: 'Corn maze',
  hasBrewery: 'Brewery / cidery',
  nightHours: 'Night hours',
  hasHauntedHouse: 'Haunted house',
  dogFriendly: 'Dog friendly',
  accessible: 'Wheelchair accessible',
  openToday: 'Open today',
  openThisWeekend: 'Open this weekend',
  inferred: 'Inferred',
};

export const FEATURE_ICONS: Record<keyof FarmFeatures, string> = {
  freeAdmission: '🎟️',
  hasCornMaze: '🌽',
  hasBrewery: '🍺',
  nightHours: '🌙',
  hasHauntedHouse: '👻',
  dogFriendly: '🐕',
  accessible: '♿',
  openToday: '🕐',
  openThisWeekend: '📅',
  inferred: '•',
};

/**
 * Compute the effective listing attributes for a farm, plus whether any were
 * inferred from heuristics rather than read from an explicit field.
 */
export function deriveFarmFeatures(farm: Farm, referenceDate: Date = new Date()): FarmFeatures {
  const text = haystack(farm);

  const freeAdmission = farm.freeAdmission ?? containsAny(text, FREE_TERMS);
  const hasCornMaze = farm.hasCornMaze ?? containsAny(text, CORN_MAZE_TERMS);
  const hasBrewery = farm.hasBrewery ?? containsAny(text, BREWERY_TERMS);
  const nightHours = farm.nightHours ?? (containsAny(text, NIGHT_TERMS) || closesAfterDark(getOpeningHours(farm)));
  const hasHauntedHouse = farm.hasHauntedHouse ?? containsAny(text, HAUNTED_TERMS);
  const dogFriendly = farm.dogFriendly ?? containsAny(text, DOG_TERMS);
  const accessible = farm.accessible ?? containsAny(text, ACCESSIBLE_TERMS);

  const hours = getOpeningHours(farm);
  const today = dayFromDate(referenceDate);
  const openToday = isOpenOn(hours, today);
  const openThisWeekend = isOpenOn(hours, 'sat') || isOpenOn(hours, 'sun');

  const inferred = [
    freeAdmission, hasCornMaze, hasBrewery, nightHours, hasHauntedHouse, dogFriendly, accessible,
  ].some((value, i) => {
    const explicit = [
      farm.freeAdmission, farm.hasCornMaze, farm.hasBrewery,
      farm.nightHours, farm.hasHauntedHouse, farm.dogFriendly, farm.accessible,
    ][i];
    return value === true && explicit === undefined;
  });

  return {
    freeAdmission,
    hasCornMaze,
    hasBrewery,
    nightHours,
    hasHauntedHouse,
    dogFriendly,
    accessible,
    openToday,
    openThisWeekend,
    inferred,
  };
}

/** True if the farm carries any structured attribute worth surfacing. */
export function hasAnyFeature(features: FarmFeatures): boolean {
  return (
    features.freeAdmission ||
    features.hasCornMaze ||
    features.hasBrewery ||
    features.nightHours ||
    features.dogFriendly ||
    features.accessible ||
    features.openToday ||
    features.openThisWeekend
  );
}

/** Ordered list of the human-facing "amenity" flags currently true on a farm. */
export function activeFeatureList(features: FarmFeatures): { key: keyof FarmFeatures; label: string; icon: string }[] {
  const order: (keyof FarmFeatures)[] = [
    'freeAdmission',
    'hasCornMaze',
    'hasBrewery',
    'nightHours',
    'hasHauntedHouse',
    'dogFriendly',
    'accessible',
    'openToday',
    'openThisWeekend',
  ];
  return order
    .filter((key) => features[key] === true)
    .map((key) => ({ key, label: FEATURE_LABELS[key], icon: FEATURE_ICONS[key] }));
}
