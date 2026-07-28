interface GeocodeResult {
  lat?: number;
  lon?: number;
  confidence: 'match' | 'non_match' | 'tie';
  matchedAddress?: string;
}

interface GeocodeInput {
  street?: string;
  city: string;
  state: string;
  zip?: string;
}

const CENSUS_GEOCODER_URL =
  'https://geocoding.geo.census.gov/geocoder/locations/addressbatch';

export async function geocodeBatch(
  addresses: GeocodeInput[],
  fetchFn: typeof fetch = fetch,
): Promise<GeocodeResult[]> {
  if (addresses.length === 0) return [];

  // Census Bureau batch endpoint accepts CSV: id, street, city, state, zip
  const lines = addresses.map((addr, i) =>
    [String(i), addr.street || '', addr.city, addr.state, addr.zip || '']
      .map((f) => `"${f.replace(/"/g, '""')}"`)
      .join(','),
  );
  const csvBody = lines.join('\n');

  const formData = new FormData();
  formData.append('addressFile', new Blob([csvBody], { type: 'text/csv' }), 'addresses.csv');
  formData.append('benchmark', 'Public_AR_Current');

  const res = await fetchFn(CENSUS_GEOCODER_URL, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Census geocoder failed: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  // Response CSV: id, street, match, exact, lat, lon, matchedAddress, corner
  const resultLines = text.trim().split(/\r?\n/);
  const results: GeocodeResult[] = new Array(addresses.length).fill(null).map(() => ({
    confidence: 'non_match',
  }));

  for (const line of resultLines) {
    const cols = line.split(',');
    const id = parseInt(cols[0], 10);
    const matchType = cols[2]?.trim();
    const lat = parseFloat(cols[4]);
    const lon = parseFloat(cols[5]);
    const matchedAddress = cols[6]?.trim().replace(/^"|"$/g, '');

    if (!isNaN(id) && id >= 0 && id < results.length) {
      results[id] = {
        lat: !isNaN(lat) ? lat : undefined,
        lon: !isNaN(lon) ? lon : undefined,
        confidence: matchType === 'Match' ? 'match' : matchType === 'Tie' ? 'tie' : 'non_match',
        matchedAddress,
      };
    }
  }

  return results;
}
