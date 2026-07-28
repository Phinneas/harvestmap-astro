import type { Directory, Farm } from './types';

const USDA_DIRECTORIES: Directory[] = [
  'agritourism',
  'csa',
  'farmersmarket',
  'foodhub',
  'onfarmmarket',
];

const USDA_DOWNLOAD_URL = 'https://www.usdalocalfoodportal.com/api/download_by_directory';

export interface RawUsdaRecord {
  listing_id?: string;
  listing_name?: string;
  listing_desc?: string;
  location_address?: string;
  location_x?: string;
  location_y?: string;
  location_desc?: string;
  webscripting?: string | null;
  saleschannel_phoneorder?: string;
  [key: string]: string | null | undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Parse "Penryn, CA, USA" or "RQ68+5W Mansfield, Connecticut" into parts
function parseAddress(address: string): { city: string; state: string; zipcode: string } {
  const parts = address.split(',').map((p) => p.trim());

  // Try to find a 2-letter state abbreviation or full state name
  const stateAbbr: Record<string, string> = {
    AL: 'AL', AK: 'AK', AZ: 'AZ', AR: 'AR', CA: 'CA', CO: 'CO', CT: 'CT',
    DE: 'DE', DC: 'DC', FL: 'FL', GA: 'GA', HI: 'HI', ID: 'ID', IL: 'IL',
    IN: 'IN', IA: 'IA', KS: 'KS', KY: 'KY', LA: 'LA', ME: 'ME', MD: 'MD',
    MA: 'MA', MI: 'MI', MN: 'MN', MS: 'MS', MO: 'MO', MT: 'MT', NE: 'NE',
    NV: 'NV', NH: 'NH', NJ: 'NJ', NM: 'NM', NY: 'NY', NC: 'NC', ND: 'ND',
    OH: 'OH', OK: 'OK', OR: 'OR', PA: 'PA', RI: 'RI', SC: 'SC', SD: 'SD',
    TN: 'TN', TX: 'TX', UT: 'UT', VT: 'VT', VA: 'VA', WA: 'WA', WV: 'WV',
    WI: 'WI', WY: 'WY',
  };
  const stateNames: Record<string, string> = {
    Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
    Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC',
    Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
    Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
    Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
    Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
    Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
    Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  };

  let state = '';
  let city = '';

  for (const part of parts) {
    if (stateAbbr[part.toUpperCase()]) {
      state = part.toUpperCase();
    } else if (stateNames[part]) {
      state = stateNames[part];
    } else if (!city && part.length > 2 && part !== 'USA') {
      city = part;
    }
  }

  // Try to extract zip from the address
  const zipMatch = address.match(/\b(\d{5})(-\d{4})?\b/);
  const zipcode = zipMatch?.[1] || '';

  return { city, state, zipcode };
}

export async function fetchDirectoryJson(
  directory: typeof USDA_DIRECTORIES[number],
  fetchFn: typeof fetch = fetch,
): Promise<RawUsdaRecord[]> {
  const url = `${USDA_DOWNLOAD_URL}?directory=${directory}`;
  const res = await fetchFn(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Referer': 'https://www.usdalocalfoodportal.com/fe/datasharing/',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  if (!res.ok) {
    throw new Error(`USDA fetch failed for ${directory}: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  if (text.startsWith('<')) {
    throw new Error(`USDA returned HTML (possibly rate limited) for ${directory}`);
  }

  return JSON.parse(text) as RawUsdaRecord[];
}

export function normalizeFarm(raw: RawUsdaRecord, directory: Directory): Farm | null {
  const name = raw.listing_name?.trim();
  if (!name || name.length < 2) return null;

  const address = raw.location_address?.trim() || '';
  const { city, state, zipcode } = parseAddress(address);

  if (!state) return null; // Can't place it geographically

  const slug = slugify(`${name}-${city || state}`);
  const lat = raw.location_y ? parseFloat(raw.location_y) : undefined;
  const lon = raw.location_x ? parseFloat(raw.location_x) : undefined;

  // webscripting sometimes contains a URL
  let website: string | undefined;
  if (raw.webscripting && raw.webscripting.startsWith('http')) {
    website = raw.webscripting;
  }

  return {
    slug,
    name,
    source: 'usda',
    directory,
    location: city ? `${city}, ${state}` : state,
    locationCity: city,
    locationState: state,
    locationZipcode: zipcode,
    lat: !isNaN(lat as number) ? lat : undefined,
    lon: !isNaN(lon as number) ? lon : undefined,
    website,
    provenance: [{ source: 'usda', lastSeen: new Date().toISOString() }],
    usdaLastUpdated: new Date().toISOString(),
  };
}

// Backward compat — old name
export const fetchDirectoryCsv = fetchDirectoryJson;

// Backward compat — old CSV parser (no longer used, USDA returns JSON)
export function parseCsv(csvText: string, _delimiter = '|'): RawUsdaRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const values = line.split('|');
    return { listing_name: values[0], location_address: values[1] };
  });
}

export { USDA_DIRECTORIES };
