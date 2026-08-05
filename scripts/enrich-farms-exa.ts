// Enrich farm data using Exa search API.
// Searches for each farm by name + location to find websites, crop info,
// descriptions, and images. Updates farm JSON files with enriched data.
//
// Usage: EXA_API_KEY="your-key" npx tsx scripts/enrich-farms-exa.ts
//
// Options:
//   --limit=N    Process only N farms (default: all without websites)
//   --state=XX   Process only farms in state XX
//   --dry-run    Search but don't write changes

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const EXA_API_KEY = process.env.EXA_API_KEY;
if (!EXA_API_KEY) {
  console.error('Error: Set EXA_API_KEY environment variable');
  console.error('  EXA_API_KEY="your-key" npx tsx scripts/enrich-farms-exa.ts');
  process.exit(1);
}

const EXA_SEARCH_URL = 'https://api.exa.ai/search';
const EXA_CONTENTS_URL = 'https://api.exa.ai/contents';

const farmsDir = join(process.cwd(), 'src', 'data', 'farms');
const imageDir = join(process.cwd(), 'public', 'farm-images');
if (!existsSync(imageDir)) mkdirSync(imageDir, { recursive: true });

// Parse CLI args
const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const stateArg = args.find((a) => a.startsWith('--state='));
const dryRun = args.includes('--dry-run');
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;
const stateFilter = stateArg ? stateArg.split('=')[1].toUpperCase() : '';

interface Farm {
  slug: string;
  name: string;
  website?: string;
  phone?: string;
  image?: string;
  imageAlt?: string;
  description?: string[];
  tagline?: string;
  produce?: string[];
  crops?: string[];
  locationCity: string;
  locationState: string;
  [key: string]: any;
}

function loadFarms(): { farm: Farm; path: string }[] {
  const results: { farm: Farm; path: string }[] = [];
  function scanDir(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) scanDir(fullPath);
      else if (entry.name.endsWith('.json')) {
        try {
          const farm = JSON.parse(readFileSync(fullPath, 'utf-8'));
          results.push({ farm, path: fullPath });
        } catch {}
      }
    }
  }
  scanDir(farmsDir);
  return results;
}

async function exaSearch(query: string, numResults = 3): Promise<any[]> {
  try {
    const res = await fetch(EXA_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY!,
      },
      body: JSON.stringify({
        query,
        numResults,
        useAutoprompt: true,
        type: 'neural',
      }),
    });
    if (!res.ok) {
      console.error(`  Exa search failed: ${res.status}`);
      return [];
    }
    const data = await res.json() as any;
    return data.results || [];
  } catch (e: any) {
    console.error(`  Exa search error: ${e.message}`);
    return [];
  }
}

async function exaGetContents(url: string): Promise<any | null> {
  try {
    const res = await fetch(EXA_CONTENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY!,
      },
      body: JSON.stringify({ urls: [url], text: true }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

// Extract useful data from Exa search results
function extractFarmData(
  results: any[],
  farm: Farm,
): { website?: string; phone?: string; tagline?: string; description?: string[]; image?: string } {
  const extracted: any = {};

  for (const result of results) {
    const url = result.url || '';

    // Find a real farm website (not a directory listing)
    if (!extracted.website && url && !url.includes('facebook.com') && !url.includes('yelp.com') &&
        !url.includes('tripadvisor.com') && !url.includes('pickyourown.org') &&
        !url.includes('usdalocalfoodportal.com') && !url.includes('yellowpages.com') &&
        !url.includes('foursquare.com') && !url.includes('instagram.com')) {
      extracted.website = url;
    }

    // Extract image from ogImage or favicon
    if (!extracted.image && result.ogImage) {
      extracted.image = result.ogImage;
    }

    // Extract a tagline from the title or text
    if (!extracted.tagline && result.title) {
      const title = result.title.replace(/\s*[-|]\s*.*/, '').trim();
      if (title.length > 10 && title.length < 100) {
        extracted.tagline = title;
      }
    }

    // Extract description from text
    if (!extracted.description && result.text) {
      const text = result.text.slice(0, 500).trim();
      if (text.length > 50) {
        // Split into paragraphs
        const paragraphs = text.split(/\n+/).filter((p: string) => p.length > 30).slice(0, 2);
        if (paragraphs.length > 0) {
          extracted.description = paragraphs.map((p: string) => p.trim());
        }
      }
    }
  }

  return extracted;
}

async function downloadImage(url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HarvestMapBot/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 2000) return null;
    const destPath = join(imageDir, `${slug}.jpg`);
    writeFileSync(destPath, Buffer.from(buffer));
    return `/farm-images/${slug}.jpg`;
  } catch {
    return null;
  }
}

const COMMON_CROPS = [
  'Strawberries', 'Blueberries', 'Raspberries', 'Blackberries', 'Apples', 'Pears',
  'Peaches', 'Nectarines', 'Apricots', 'Plums', 'Cherries', 'Pumpkins', 'Squash',
  'Corn', 'Tomatoes', 'Peppers', 'Grapes', 'Asparagus', 'Green beans', 'Peas',
  'Herbs', 'Flowers', 'Sunflowers', 'Lavender', 'Honey', 'Eggs', 'Christmas trees',
  'Persimmons', 'Figs', 'Oranges', 'Lemons', 'Limes', 'Mandarins', 'Kiwi',
  'Eggplant', 'Walnuts', 'Almonds', 'Pecans',
];

function extractCropsFromText(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const crop of COMMON_CROPS) {
    if (lower.includes(crop.toLowerCase()) && !found.includes(crop)) {
      found.push(crop);
    }
  }
  return found;
}

async function main() {
  const allFarms = loadFarms();
  let farmsToProcess = allFarms.filter(({ farm }) => {
    if (farm.website && !farm.website.includes('pickyourown.org')) return false;
    if (stateFilter && farm.locationState !== stateFilter) return false;
    return true;
  });

  if (limit > 0) farmsToProcess = farmsToProcess.slice(0, limit);

  console.log(`Processing ${farmsToProcess.length} farms${stateFilter ? ` in ${stateFilter}` : ''}${dryRun ? ' (dry run)' : ''}`);
  console.log('');

  let enriched = 0;
  let websitesFound = 0;
  let imagesFound = 0;
  let cropsFound = 0;
  let skipped = 0;

  for (let i = 0; i < farmsToProcess.length; i++) {
    const { farm, path: farmPath } = farmsToProcess[i];
    const query = `${farm.name} ${farm.locationCity} ${farm.locationState} farm u-pick`;

    process.stdout.write(`[${i + 1}/${farmsToProcess.length}] ${farm.name}... `);

    try {
      const results = await exaSearch(query, 3);

      if (results.length === 0) {
        console.log('SKIP (no results)');
        skipped++;
        continue;
      }

      const extracted = extractFarmData(results, farm);

      // Try to get more data from the top result
      let crops: string[] = [];
      const topResult = results[0];
      if (topResult.url && topResult.url !== extracted.website) {
        const content = await exaGetContents(topResult.url);
        if (content?.text) {
          const textCrops = extractCropsFromText(content.text);
          crops = textCrops;
        }
      }

      // Also extract crops from search result text
      if (crops.length === 0) {
        for (const r of results) {
          if (r.text) {
            crops = extractCropsFromText(r.text);
            if (crops.length > 0) break;
          }
        }
      }

      let changed = false;

      // Add website if found
      if (extracted.website && !farm.website) {
        farm.website = extracted.website;
        websitesFound++;
        changed = true;
      }

      // Add tagline if found
      if (extracted.tagline && !farm.tagline) {
        farm.tagline = extracted.tagline;
        changed = true;
      }

      // Add description if found
      if (extracted.description && !farm.description) {
        farm.description = extracted.description;
        changed = true;
      }

      // Add crops if found and farm has none
      if (crops.length > 0 && !(farm.produce || farm.crops || []).length) {
        farm.produce = crops;
        cropsFound++;
        changed = true;
      }

      // Download image if found
      if (extracted.image && (!farm.image || farm.image === '/images/farm-placeholder.svg')) {
        if (!dryRun) {
          const localImage = await downloadImage(extracted.image, farm.slug);
          if (localImage) {
            farm.image = localImage;
            farm.imageAlt = farm.name;
            imagesFound++;
            changed = true;
          }
        }
      }

      if (changed && !dryRun) {
        writeFileSync(farmPath, JSON.stringify(farm, null, 2) + '\n');
        enriched++;
        console.log(`OK (website:${extracted.website ? 'Y' : 'N'} crops:${crops.length} image:${farm.image?.startsWith('/farm-images/') ? 'Y' : 'N'})`);
      } else if (changed && dryRun) {
        console.log(`DRY RUN (would enrich: website:${extracted.website ? 'Y' : 'N'} crops:${crops.length} image:${extracted.image ? 'Y' : 'N'})`);
      } else {
        console.log('SKIP (no useful data)');
        skipped++;
      }
    } catch (e: any) {
      console.log(`ERROR (${e.message})`);
      skipped++;
    }

    // Rate limit: 500ms between searches
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('');
  console.log('--- Results ---');
  console.log(`Enriched: ${enriched}`);
  console.log(`  Websites found: ${websitesFound}`);
  console.log(`  Images found: ${imagesFound}`);
  console.log(`  Crops found: ${cropsFound}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total processed: ${farmsToProcess.length}`);
}

main().catch(console.error);
