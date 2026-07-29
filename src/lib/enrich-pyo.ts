// PickYourOwn.org parser — dynamically discovers county/region sub-pages
// from each state page, then scrapes farm listings from those sub-pages.
// Works for all 50 US states + DC.

const PYO_BASE = 'https://www.pickyourown.org/';

// All 50 states + DC with their PickYourOwn.org page codes
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export interface PyoEnrichmentRecord {
  name: string;
  city?: string;
  state: string;
  phone?: string;
  website?: string;
  crops: string[];
  seasonalNotes?: string;
  source: 'pickyourown.org';
}

const CROP_KEYWORDS: string[] = [
  'strawberries', 'blueberries', 'raspberries', 'blackberries', 'boysenberries',
  'apples', 'pears', 'peaches', 'nectarines', 'apricots', 'plums', 'cherries',
  'persimmons', 'pomegranates', 'figs', 'citrus', 'oranges', 'lemons', 'limes',
  'mandarins', 'tangerines', 'avocados', 'olives',
  'pumpkins', 'squash', 'corn', 'tomatoes', 'peppers', 'eggplant',
  'grapes', 'kiwi', 'guava', 'mango',
  'asparagus', 'artichokes', 'green beans', 'peas',
  'herbs', 'flowers', 'sunflowers', 'lavender',
  'walnuts', 'almonds', 'pecans',
  'honey', 'eggs',
  'christmas trees',
];

function extractCrops(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const crop of CROP_KEYWORDS) {
    if (lower.includes(crop)) {
      found.add(crop.charAt(0).toUpperCase() + crop.slice(1));
    }
  }
  return Array.from(found);
}

const STATE_NAMES = Object.fromEntries(US_STATES.map((s) => [s.code, s.name]));

// Decode common HTML entities in extracted text
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .trim();
}

// Filter out non-farm content that PYO pages mix in with farm listings.
// These include visitor comments, status updates, price notes, product
// affiliate links, section headers, and operational notes.
function isJunkFarmName(rawName: string): boolean {
  // Decode HTML entities first, then trim
  const name = decodeEntities(rawName);
  const lower = name.toLowerCase();

  if (!lower) return true;
  if (name.length < 3) return true;

  // Starts with punctuation (not letters, numbers, or quotes)
  if (!/^[A-Za-z0-9"' ]/.test(name)) return true;

  // Visitor comments (anywhere in name)
  if (/comments from a visitor/i.test(name)) return true;

  // Entries starting with a year (status notes, price notes, updates)
  if (/^(20\d{2}|19\d{2})\b/.test(lower)) return true;

  // Status / closure notes
  if (/(permanently|presumed|assumed).*(closed|close)/i.test(name)) return true;
  if (lower.startsWith('update ') || lower.startsWith('update for')) return true;
  if (/UPDATED:/i.test(name)) return true;

  // Price-only entries
  if (/^price[s]?\b/.test(lower)) return true;
  if (/chicken prices/i.test(name)) return true;

  // Growing practice fragments (not farm names)
  if (/^uses (natural|organic|conventional)/i.test(name)) return true;
  if (/^we limit.*chemical/i.test(name)) return true;
  if (/^no pyo/i.test(lower)) return true;

  // Visitor observation notes
  if (/^i (only )?see/i.test(name)) return true;

  // Notes
  if (lower.startsWith('notes for') || lower.startsWith('note:')) return true;

  // Product affiliate links
  if (lower.includes('pressure canner') || lower.includes('pressure cooker')) return true;
  if (lower.includes('presto ')) return true;

  // Section headers / category labels
  if (/^local (honey|meat|milk|eggs)/i.test(lower)) return true;
  if (/^pumpkin patches and corn mazes/i.test(lower)) return true;
  if (lower === 'by appointment only') return true;
  if (lower.includes('approximate ripening')) return true;
  if (lower.includes('all organic use approved sprays only')) return true;

  // URLs as names
  if (/^https?:\/\//i.test(lower)) return true;

  // Very long names (> 80 chars) are notes, not farm names
  if (name.length > 80) return true;

  return false;
}

// Parse a farm block from PickYourOwn.org HTML.
// Farm listings are in <li> or <p> blocks with the farm name as a link
// or bold text, followed by address/phone/crop text.
function parseFarmBlock(html: string, stateCode: string): PyoEnrichmentRecord | null {
  const nameMatch = html.match(/<a[^>]*><b>(.*?)<\/b><\/a>/i) || html.match(/<b>(.*?)<\/b>/i);
  if (!nameMatch) return null;

  const name = decodeEntities(nameMatch[1].replace(/<[^>]*>/g, ''));
  if (name.length < 3) return null;
  if (isJunkFarmName(name)) return null;

  const websiteMatch = html.match(/href="(https?:\/\/[^"]+)"/i);
  const website = websiteMatch?.[1];

  const phoneMatch = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch?.[0];

  // Extract city — match "City, ST" or "City, StateName" pattern
  const stateName = STATE_NAMES[stateCode];
  const cityMatch = html.match(
    new RegExp(`([A-Z][a-z]+(?:\\s[A-Z][a-z]+)?),\\s*(${stateCode}|${stateName})`),
  );
  const city = cityMatch?.[1];

  const text = html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ');
  const crops = extractCrops(text);

  const notesMatch = text.match(/(usually|typically|season is|ready|picking|ripe)[^.]*\./i);
  const seasonalNotes = notesMatch?.[0]?.trim();

  return { name, city, state: stateCode, phone, website, crops, seasonalNotes, source: 'pickyourown.org' };
}

function parseFarmBlocksFromHtml(html: string, stateCode: string): PyoEnrichmentRecord[] {
  const records: PyoEnrichmentRecord[] = [];

  // Pattern 1: <li> blocks containing farm links or bold text
  const liBlocks = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
  for (const block of liBlocks) {
    if (block.includes('href=') || block.includes('<b>')) {
      const record = parseFarmBlock(block, stateCode);
      if (record && record.crops.length > 0) records.push(record);
    }
  }

  // Pattern 2: <p> blocks with farm info (fallback if no <li> matches)
  if (records.length === 0) {
    const pBlocks = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    for (const block of pBlocks) {
      if (block.includes('href=') || block.includes('<b>')) {
        const record = parseFarmBlock(block, stateCode);
        if (record && record.crops.length > 0) records.push(record);
      }
    }
  }

  return records;
}

// Dynamically discover county/region sub-page links from a state page.
// PYO state pages have a "{State} U-Pick Farms and Orchards" section
// with links to county sub-pages. We extract those links.
function discoverCountyLinks(html: string, stateCode: string): string[] {
  const links: string[] = [];

  // Find all anchor tags pointing to .htm pages on pickyourown.org
  // that are likely county sub-pages (not the state page itself, not
  // harvest calendars, not other sister sites)
  const linkRegex = /<a[^>]*href="([A-Za-z0-9_\-]+\.htm)"/gi;
  let match;
  const statePage = `${stateCode}.htm`;
  const seen = new Set<string>();

  while ((match = linkRegex.exec(html)) !== null) {
    const path = match[1];
    // Skip the state page itself, harvest calendars, and non-farm pages
    if (path === statePage) continue;
    if (path.toLowerCase().includes('harvestcalendar')) continue;
    if (path.toLowerCase().includes('dates')) continue;
    if (path.toLowerCase().includes('pumpkin')) continue;
    if (path.toLowerCase().includes('xmastree')) continue;
    if (path.toLowerCase().includes('apple') && path.toLowerCase().includes('guide')) continue;

    // County pages typically start with the state code
    // e.g., CAmarin.htm, ORporteast.htm, GA-AtlantaNW-I75Ga400.htm, GAnorth.htm
    const upperPath = path.toUpperCase();
    if (upperPath.startsWith(stateCode.toUpperCase()) || upperPath.includes(`${stateCode.toUpperCase()}-`)) {
      if (!seen.has(path)) {
        seen.add(path);
        links.push(path);
      }
    }
  }

  return links;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchStateEnrichment(
  stateCode: string,
  fetchFn: typeof fetch = fetch,
  rateLimitMs = 500,
): Promise<PyoEnrichmentRecord[]> {
  const statePageUrl = `${PYO_BASE}${stateCode}.htm`;

  let stateHtml: string;
  try {
    const res = await fetchFn(statePageUrl);
    if (!res.ok) {
      console.error(`[PYO] ${stateCode}: state page failed ${res.status}`);
      return [];
    }
    stateHtml = await res.text();
  } catch (e) {
    console.error(`[PYO] ${stateCode}: fetch error`, e);
    return [];
  }

  // Discover county sub-page links
  const countyLinks = discoverCountyLinks(stateHtml, stateCode);

  // Also try parsing farms directly from the state page (some states
  // list farms directly without county sub-pages)
  const directRecords = parseFarmBlocksFromHtml(stateHtml, stateCode);

  if (countyLinks.length === 0 && directRecords.length === 0) {
    console.log(`[PYO] ${stateCode}: no county links or farms found`);
    return [];
  }

  console.log(`[PYO] ${stateCode}: ${countyLinks.length} county pages, ${directRecords.length} direct farms`);

  const all: PyoEnrichmentRecord[] = [...directRecords];

  // Fetch each county sub-page with rate limiting
  for (const countyPath of countyLinks) {
    await sleep(rateLimitMs);
    try {
      const res = await fetchFn(`${PYO_BASE}${countyPath}`);
      if (!res.ok) {
        console.error(`[PYO] ${stateCode}/${countyPath}: ${res.status}`);
        continue;
      }
      const html = await res.text();
      const records = parseFarmBlocksFromHtml(html, stateCode);
      if (records.length > 0) {
        console.log(`[PYO] ${stateCode}/${countyPath}: ${records.length} farms`);
      }
      all.push(...records);
    } catch (e) {
      console.error(`[PYO] ${stateCode}/${countyPath}: fetch error`, e);
    }
  }

  return all;
}

export async function fetchAllStates(
  stateCodes: string[] = US_STATES.map((s) => s.code),
  fetchFn: typeof fetch = fetch,
  rateLimitMs = 500,
): Promise<Map<string, PyoEnrichmentRecord[]>> {
  const results = new Map<string, PyoEnrichmentRecord[]>();

  for (const stateCode of stateCodes) {
    console.log(`\n[PYO] Processing ${stateCode}...`);
    const records = await fetchStateEnrichment(stateCode, fetchFn, rateLimitMs);
    results.set(stateCode, records);
    console.log(`[PYO] ${stateCode}: ${records.length} total enrichment records`);
  }

  return results;
}

// Backward compatibility — CA-only function
export async function fetchAllCaCounties(
  fetchFn: typeof fetch = fetch,
): Promise<PyoEnrichmentRecord[]> {
  return fetchStateEnrichment('CA', fetchFn);
}
