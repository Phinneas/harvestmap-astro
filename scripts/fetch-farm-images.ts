// Fetch Open Graph images from farm websites.
// Reads the og:image meta tag from each farm's website,
// downloads the image, and updates the farm JSON with the local path.
//
// Usage: npx tsx scripts/fetch-farm-images.ts
//
// Rate-limited to 2 seconds between fetches to be respectful.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const farmsDir = join(process.cwd(), 'src', 'data', 'farms');
const imageDir = join(process.cwd(), 'public', 'farm-images');

if (!existsSync(imageDir)) {
  mkdirSync(imageDir, { recursive: true });
}

interface Farm {
  slug: string;
  name: string;
  website?: string;
  image?: string;
  [key: string]: any;
}

function loadAllFarms(): { farm: Farm; path: string }[] {
  const results: { farm: Farm; path: string }[] = [];
  function scanDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.json')) {
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

function extractOgImage(html: string): string | null {
  // Try <meta property="og:image" content="...">
  const match1 = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (match1) return match1[1];

  // Try <meta content="..." property="og:image">
  const match2 = html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (match2) return match2[1];

  // Try og:image:url
  const match3 = html.match(/<meta\s+property=["']og:image:url["']\s+content=["']([^"']+)["']/i);
  if (match3) return match3[1];

  return null;
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<{ ok: boolean; text: () => Promise<string>; arrayBuffer: () => Promise<ArrayBuffer>; headers: Headers }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HarvestMapBot/1.0 (https://www.harvestmap.co)' },
      redirect: 'follow',
    });
    return res as any;
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(url, 15000);
    if (!res.ok) return false;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return false;

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 1000) return false; // skip tiny images (likely placeholders)

    writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const allFarms = loadAllFarms();
  const farmsWithWebsite = allFarms.filter(
    ({ farm }) => farm.website && farm.website.startsWith('http') && !farm.website.includes('pickyourown.org')
  );

  console.log(`Found ${farmsWithWebsite.length} farms with websites to process`);

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let alreadyHas = 0;

  for (let i = 0; i < farmsWithWebsite.length; i++) {
    const { farm, path: farmPath } = farmsWithWebsite[i];

    // Skip if already has a real image
    if (farm.image && farm.image !== '/images/farm-placeholder.svg' && farm.image.startsWith('/farm-images/')) {
      alreadyHas++;
      continue;
    }

    const slug = farm.slug;
    const destPath = join(imageDir, `${slug}.jpg`);

    // Skip if image file already exists
    if (existsSync(destPath)) {
      farm.image = `/farm-images/${slug}.jpg`;
      farm.imageAlt = farm.name;
      writeFileSync(farmPath, JSON.stringify(farm, null, 2) + '\n');
      alreadyHas++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${farmsWithWebsite.length}] ${farm.name}... `);

    try {
      // Fetch the website HTML
      const res = await fetchWithTimeout(farm.website);
      if (!res.ok) {
        console.log(`FAIL (HTTP ${res.status})`);
        failed++;
        await sleep(2000);
        continue;
      }

      const html = await res.text();
      const ogImage = extractOgImage(html);

      if (!ogImage) {
        console.log('SKIP (no og:image)');
        skipped++;
        await sleep(2000);
        continue;
      }

      // Make og:image URL absolute if relative
      let imageUrl = ogImage;
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(farm.website);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      }

      // Download the image
      const downloaded = await downloadImage(imageUrl, destPath);
      if (downloaded) {
        farm.image = `/farm-images/${slug}.jpg`;
        farm.imageAlt = farm.name;
        writeFileSync(farmPath, JSON.stringify(farm, null, 2) + '\n');
        console.log('OK');
        fetched++;
      } else {
        console.log('FAIL (download failed)');
        failed++;
      }
    } catch (e: any) {
      console.log(`ERROR (${e.message || 'unknown'})`);
      failed++;
    }

    // Rate limit
    await sleep(2000);
  }

  console.log('\n--- Results ---');
  console.log(`Fetched: ${fetched}`);
  console.log(`Already had images: ${alreadyHas}`);
  console.log(`Skipped (no og:image): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total processed: ${fetched + skipped + failed + alreadyHas}`);
}

main().catch(console.error);
