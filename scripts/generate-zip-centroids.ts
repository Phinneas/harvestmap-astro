/**
 * Generates a compact US ZIP-code → [lat, lon] centroid map at
 *   public/data/zip-centroids.json
 *
 * Source: GeoNames postal-code dataset for the United States
 *   http://download.geonames.org/export/zip/US.zip
 * License: Creative Commons Attribution 4.0 (CC BY 4.0) — see
 *   https://creativecommons.org/licenses/by/4.0/  and https://www.geonames.org/
 * Attribution: "Contains data from GeoNames (https://www.geonames.org/) licensed
 * under CC BY 4.0."
 *
 * Output shape: { "00501": [40.92, -72.64], "00544": [40.69, -73.04], ... }
 * ~33–40k entries. The file is fetched client-side by /u-pick-farms to resolve a
 * user-entered ZIP to coordinates before calling /api/finder?lat=&lon=.
 *
 * Run:  npm run gen-zips
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const SOURCE_URL = 'http://download.geonames.org/export/zip/US.zip';
const OUT_DIR = join(process.cwd(), 'public', 'data');
const OUT_PATH = join(OUT_DIR, 'zip-centroids.json');

async function main() {
  console.log('Downloading GeoNames US postal codes…');
  const workDir = join(tmpdir(), `hm-zips-${Date.now()}`);
  mkdirSync(workDir, { recursive: true });
  const zipPath = join(workDir, 'US.zip');
  const txtPath = join(workDir, 'US.txt');

  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'HarvestMap/1.0 (zip-locator; contact hello@example.com)' },
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(zipPath, buf);
  console.log(`  downloaded ${(buf.length / 1024).toFixed(0)}KB`);

  // Unzip. `unzip` is standard on macOS/Linux; fall back to `python3 -m zipfile`.
  try {
    execSync(`unzip -o "${zipPath}" -d "${workDir}"`, { stdio: 'pipe' });
  } catch {
    execSync(`python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "${zipPath}" "${workDir}"`, { stdio: 'pipe' });
  }
  if (!existsSync(txtPath)) throw new Error('US.txt not found after unzip');
  const text = readFileSync(txtPath, 'utf-8');

  // GeoNames US.txt is tab-separated. Columns:
  // 0 country  1 postal_code  2 place_name  3 state_name  4 state_code
  // 5 county_name  6 county_code  7 admin2  8 admin3  9 lat  10 lon  11 accuracy
  const centroids: Record<string, [number, number]> = {};
  let lines = 0;
  for (const line of text.split('\n')) {
    if (!line) continue;
    const cols = line.split('\t');
    const zip = cols[1];
    const lat = parseFloat(cols[9]);
    const lon = parseFloat(cols[10]);
    if (!zip || isNaN(lat) || isNaN(lon)) continue;
    // Keep the first row per ZIP (GeoNames can list a ZIP under multiple place names;
    // the centroid is close enough for a "nearby farms" radius search).
    if (centroids[zip]) continue;
    centroids[zip] = [round(lat), round(lon)];
    lines++;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const json = JSON.stringify(centroids);
  writeFileSync(OUT_PATH, json);

  // Clean up the temp dir.
  rmSync(workDir, { recursive: true, force: true });

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  ${Object.keys(centroids).length} ZIPs, ${(json.length / 1024).toFixed(0)}KB`);
}

function round(n: number): number {
  // 4 decimal places ≈ ~11m — more than enough for a miles-radius farm search.
  return Math.round(n * 10000) / 10000;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
