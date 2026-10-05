/**
 * Farm-name hygiene — junk-name detection, name recovery, and slug generation.
 *
 * `isJunkFarmName` here is the NARROW, data-oriented check: it flags only the
 * generic practice/note/certification terms that are never real farm names
 * (single generic words, "certified organic", "no pesticides", "note…",
 * "we/our…" practice sentences). The PYO scraper keeps its own broader filter
 * in enrich-pyo.ts (which also catches price lines, closures, headers, etc.
 * that only appear while parsing HTML).
 *
 * Used by:
 *   - scripts/cleanup-farm-names.ts (one-off data cleanup)
 *   - scripts/generate-farm-data.ts (build-time validation)
 */

/** Canonical slug for a farm name (matches scripts/refresh-farm-data.ts). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const GENERIC_SINGLES = new Set([
  'organic', 'organically', 'note', 'notes', 'certified', 'natural',
  'naturally', 'pyo', 'upick', 'pesticides',
]);

/**
 * True when `rawName` is a practice/note/generic/certification term rather
 * than a real farm name. Deliberately narrow so it never flags real names
 * like "Price Farms", "Local Honey", or "Certified Arkansas Farmers Market".
 */
export function isJunkFarmName(rawName: string): boolean {
  const name = (rawName || '').trim();
  if (name.length < 3) return true;

  // Punctuation folded to spaces so "ORGANIC," → "organic" and
  // "No pesticides used," → "no pesticides used".
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Single generic word (practice/certification terms are never names)
  if (/^[a-z]+$/.test(normalized) && GENERIC_SINGLES.has(normalized)) return true;

  // Certification labels (whole "name" is a certification)
  if (/^certified (organic|naturally grown)$/.test(normalized)) return true;

  // Practice / status notes
  if (/^no (pesticides|more u.?pick|pyo)\b/.test(normalized)) return true;
  if (/^we (minimize|limit|use)\b/.test(normalized)) return true;
  if (/^we have u[- ]?pick\b/.test(normalized)) return true;
  if (/^our (berries|farms|produce|fruit)\b/.test(normalized)) return true;
  if (/^our only\b/.test(normalized)) return true;
  if (/^uses (natural|organic|conventional|integrated pest)\b/.test(normalized)) return true;
  if (/^a visitor writes\b/.test(normalized)) return true;
  if (/^closed (for|since|until|as of|indefinitely|permanently|all)\b/.test(normalized)) return true;
  if (/^update\b/.test(normalized)) return true;
  if (/^follow organic methods/.test(normalized)) return true;
  if (normalized === 'organically grown') return true;

  // Note entries ("Note", "Notes", "Note:", "Note about…", "Note for…")
  if (/^notes?\b/.test(normalized)) return true;

  return false;
}

// Leading tokens that mean a tagline's first segment is a page title or
// description, not a farm name (so recovery fails rather than guessing).
const NON_NAME_LEADING =
  /^(about|home|general|pyo|farming methods|natural farming|pick your own|gold|peach|northeast|produce|hood river|mike'?s|moran fruit|cisa|we|our)\b/i;

// A recovered name must end in a farm-type word. This rejects page titles like
// "Market Report", "Blackberry Season", "Buy Eggs", "Regional Assessment".
const FARM_SUFFIX =
  /\b(farms?|orchards?|ranches?|organics?|produce|apiar(y|ies)|gardens?|groves?|vineyards?|wineries?|acres?|homesteads?|nurser(y|ies)|markets?|csa|patches?|harvests?)\s*$/i;

const BUSINESS_SUFFIX = /\s*(llc|l\.l\.c\.?|inc\.?|corp\.?|llp)\.?\s*$/i;

/**
 * Recover a real farm name from a listing's `tagline` (an SEO title).
 * Conservative on purpose: returns null (→ drop the farm) unless the tagline's
 * leading segment is unambiguously a clean, Title-Case farm name. Never guesses.
 */
export function recoverFarmName(tagline: string | undefined): string | null {
  if (!tagline) return null;

  // Leading name = text before the first title separator.
  let leading = tagline.split(/[,:;|–—]/)[0].trim();
  leading = leading.replace(BUSINESS_SUFFIX, '').trim();
  leading = leading.replace(/[.\s]+$/, '');

  if (leading.length < 3 || leading.length > 50) return null;
  // Addresses ("6147 Castle Hill Rd"), dates, and price notes.
  if (/\d/.test(leading)) return null;
  // Domains / URLs ("AyrshireFarm.com").
  if (/\.(com|org|net|io|co)\b/i.test(leading)) return null;
  // ALL-CAPS headers ("WELLNESS FEST", "WFFC & HCMC BLOG").
  if (leading === leading.toUpperCase() && /[A-Z]{2,}/.test(leading)) return null;
  if (isJunkFarmName(leading)) return null;
  if (NON_NAME_LEADING.test(leading)) return null;
  if (!FARM_SUFFIX.test(leading)) return null;

  return leading;
}
