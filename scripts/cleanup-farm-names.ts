// One-off data cleanup: fix junk-named farms in src/data/farms/.
//
// For every farm whose `name` is a practice/note/generic term:
//   1. Recover a real name from `tagline` (text before the first separator).
//   2. If recovery fails, DROP the farm (delete the file) — never guess.
// Recovered farms are re-slugged in their ORIGINAL directory, and any resulting
// (state, slug) collision is merged (union crops, prefer a valid phone / city).
// Untouched farms are left byte-for-byte alone.
//
// Idempotent: re-running after a cleanup finds nothing to do.
//
// Usage: npx tsx scripts/cleanup-farm-names.ts [--dry-run]

import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { isJunkFarmName, recoverFarmName, slugify } from '../src/lib/farm-names';

const DRY_RUN = process.argv.includes('--dry-run');
const FARMS_DIR = join(process.cwd(), 'src', 'data', 'farms');

interface FarmRecord {
  [key: string]: any;
  slug: string;
  name: string;
  locationState?: string;
  crops?: string[];
  phone?: string;
  website?: string;
  locationCity?: string;
  lat?: number | null;
  lon?: number | null;
  provenance?: any[];
}

interface Record {
  path: string;
  farm: FarmRecord;
}

function loadFarms(): Record[] {
  const out: Record[] = [];
  function scan(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) scan(p);
      else if (entry.name.endsWith('.json')) {
        try {
          out.push({ path: p, farm: JSON.parse(readFileSync(p, 'utf-8')) });
        } catch { /* skip malformed */ }
      }
    }
  }
  scan(FARMS_DIR);
  return out;
}

// A plausible US phone number (area code can't be 0xx/1xx — rejects the
// Facebook page-ID "phones" like 1000646609 that slipped into the data).
function isValidPhone(p: string | undefined): boolean {
  if (!p) return false;
  const digits = p.replace(/\D/g, '');
  return /^1?[2-9]\d{2}\d{7}$/.test(digits);
}

function score(f: FarmRecord): number {
  let s = 0;
  if (isValidPhone(f.phone)) s += 4;
  if (f.website) s += 2;
  if (f.locationCity && f.locationCity.trim()) s += 1;
  if (f.lat != null && f.lon != null) s += 1;
  s += Math.min((f.crops || []).length, 10);
  return s;
}

function mergeFarms(group: FarmRecord[]): FarmRecord {
  const base = [...group].sort((a, b) => score(b) - score(a))[0];
  const merged: FarmRecord = { ...base };
  const crops = new Set<string>();
  for (const f of group) for (const c of f.crops || []) crops.add(c);
  merged.crops = [...crops];
  merged.phone = group.map((f) => f.phone).find(isValidPhone) ?? base.phone;
  merged.website = group.map((f) => f.website).find((w) => w && w.trim()) ?? base.website;
  merged.locationCity = group.map((f) => f.locationCity).find((c) => c && c.trim()) ?? base.locationCity ?? '';
  const withGeo = group.find((f) => f.lat != null && f.lon != null);
  if (withGeo) { merged.lat = withGeo.lat; merged.lon = withGeo.lon; }
  const prov = new Map<string, any>();
  for (const f of group) for (const p of f.provenance || []) {
    if (p && p.source) prov.set(p.source, p);
  }
  merged.provenance = [...prov.values()];
  return merged;
}

function main() {
  const records = loadFarms();
  const junk = records.filter((r) => isJunkFarmName(r.farm.name));
  const junkPaths = new Set(junk.map((r) => r.path));

  console.log(`Scanned ${records.length} farms. Found ${junk.length} junk-named.`);

  // Plan changes. Each entry tracks the original file(s) it replaces and the
  // directory to write back into (preserves the editorial/ subdirectory).
  interface Planned {
    farm: FarmRecord;
    dir: string;
    fromPaths: string[];
    changed: boolean;
  }
  const planned: Planned[] = [];
  let renamed = 0, dropped = 0;

  // Untouched farms — keep as-is (no rewrite).
  for (const r of records) {
    if (!junkPaths.has(r.path)) {
      planned.push({ farm: r.farm, dir: dirname(r.path), fromPaths: [r.path], changed: false });
    }
  }

  // Junk farms — recover or drop.
  for (const r of junk) {
    const recovered = recoverFarmName(r.farm.tagline);
    if (!recovered) {
      dropped++;
      console.log(`  DROP   ${r.farm.name} (${r.farm.locationState}) — ${r.path.replace(process.cwd() + '/', '')}`);
      continue;
    }
    const newSlug = slugify(recovered);
    renamed++;
    console.log(`  RENAME ${r.farm.name} -> ${recovered} [${newSlug}] (${r.farm.locationState})`);
    planned.push({
      farm: { ...r.farm, name: recovered, slug: newSlug },
      dir: dirname(r.path),
      fromPaths: [r.path],
      changed: true,
    });
  }

  // Dedupe by (state, slug) — merges collisions (e.g. 4x "A Natural Farm" in FL).
  const byKey = new Map<string, Planned[]>();
  for (const p of planned) {
    const key = `${(p.farm.locationState || '?').toUpperCase()}::${p.farm.slug}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(p);
  }
  let merged = 0;
  const deduped: Planned[] = [];
  for (const [key, group] of byKey) {
    if (group.length > 1) {
      merged += group.length - 1;
      console.log(`  MERGE  ${key} (${group.length} records)`);
      const base = [...group].sort((a, b) => score(b.farm) - score(a.farm))[0];
      deduped.push({
        farm: mergeFarms(group.map((g) => g.farm)),
        dir: base.dir,
        fromPaths: group.flatMap((g) => g.fromPaths),
        changed: true,
      });
    } else {
      deduped.push(group[0]);
    }
  }

  // Compute writes and deletes.
  const toWrite: { path: string; farm: FarmRecord }[] = [];
  const toDelete = new Set<string>();
  for (const p of deduped) {
    if (!p.changed) continue;
    const target = join(p.dir, `${p.farm.slug}.json`);
    for (const src of p.fromPaths) {
      if (src !== target) toDelete.add(src);
    }
    toWrite.push({ path: target, farm: p.farm });
  }
  // Dropped files (recovery returned null).
  for (const r of junk) {
    if (recoverFarmName(r.farm.tagline) === null) toDelete.add(r.path);
  }

  if (DRY_RUN) {
    console.log(`\nDRY RUN — would rename ${renamed}, drop ${dropped}, merge ${merged}.`);
    console.log(`Would delete ${toDelete.size} files, write ${toWrite.length}.`);
    console.log(`Final farm count: ${deduped.length} (was ${records.length}).`);
    return;
  }

  for (const p of toDelete) unlinkSync(p);
  for (const w of toWrite) {
    mkdirSync(dirname(w.path), { recursive: true });
    writeFileSync(w.path, JSON.stringify(w.farm, null, 2) + '\n', 'utf-8');
  }

  console.log(`\nDone: renamed ${renamed}, dropped ${dropped}, merged ${merged}, deleted ${toDelete.size} files, wrote ${toWrite.length}.`);
  console.log(`Final farm count: ${deduped.length} (was ${records.length}).`);
}

main();
