// Cloudflare Pages Function — Finder API
// Searches all 7,025 farms by location, crop, radius, and state.
// Reads the static farm index from /api/farm-index.json via env.ASSETS.
//
// Query params:
//   lat, lon    — coordinates for radius search
//   radius      — search radius in miles (default 50)
//   crop        — filter by crop name (case-insensitive substring)
//   state       — filter by state code (e.g. "CA")
//   inSeason    — "true" to filter to farms currently in season
//   limit       — max results (default 50, max 200)
//   offset      — pagination offset

const EARTH_RADIUS_MILES = 3959;

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const lat = parseFloat(params.get('lat') || '');
  const lon = parseFloat(params.get('lon') || '');
  const radius = Math.min(parseFloat(params.get('radius') || '50'), 500);
  const crop = (params.get('crop') || '').toLowerCase().trim();
  const state = (params.get('state') || '').toUpperCase().trim();
  const inSeasonOnly = params.get('inSeason') === 'true';
  const limit = Math.min(parseInt(params.get('limit') || '50', 10), 200);
  const offset = parseInt(params.get('offset') || '0', 10);

  const hasLocation = !isNaN(lat) && !isNaN(lon);

  // Fetch the static farm index
  let farms;
  try {
    const indexUrl = new URL('/api/farm-index.json', url.origin);
    const res = env.ASSETS
      ? await env.ASSETS.fetch(indexUrl)
      : await fetch(indexUrl);
    farms = await res.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Farm index unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Filter
  let results = farms;

  if (state) {
    results = results.filter((f) => f.st === state);
  }

  if (crop) {
    results = results.filter((f) =>
      (f.cr || []).some((c) => c.toLowerCase().includes(crop))
    );
  }

  if (inSeasonOnly) {
    results = results.filter((f) => f.sn === true);
  }

  if (hasLocation) {
    results = results
      .filter((f) => f.lat != null && f.lon != null)
      .map((f) => ({
        ...f,
        distance: haversineMiles(lat, lon, f.lat, f.lon),
      }))
      .filter((f) => f.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  } else {
    results = results.sort((a, b) => a.n.localeCompare(b.n));
  }

  const total = results.length;
  const paged = results.slice(offset, offset + limit);

  return new Response(
    JSON.stringify({
      total,
      offset,
      limit,
      farms: paged.map((f) => ({
        slug: f.s,
        name: f.n,
        city: f.c,
        state: f.st,
        lat: f.lat,
        lon: f.lon,
        crops: f.cr,
        inSeason: f.sn,
        peak: f.pk,
        distance: hasLocation ? Math.round(f.distance * 10) / 10 : undefined,
        url: `/farms/${f.s}`,
      })),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
