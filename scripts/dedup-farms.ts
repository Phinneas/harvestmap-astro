// One-off dedup: merge same-name farms within a state whose addresses are the
// same farm recorded under slightly different strings (USDA feed quirks:
// "Southwest Wanamaker Road" vs "SW Wanamaker Rd", a dropped leading digit,
// or the farm name parked in the city field).
//
// Conservative: only merges when the street matches (house number ignored),
// the addresses are identical after normalization, or one address is empty or
// equals the name. Keeps the richest record, unions crops, prefers a valid
// phone / non-empty website / real city.
//
// Usage: npx tsx scripts/dedup-farms.ts [--dry-run]

import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const FARMS_DIR = join(process.cwd(), 'src', 'data', 'farms');

interface FarmRecord { [k: string]: any; slug: string; name: string; locationState?: string; locationCity?: string; location?: string; crops?: string[]; phone?: string; website?: string; lat?: number | null; lon?: number | null; provenance?: any[]; }

function norm(s: string | undefined): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function addrOf(f: FarmRecord): string { return f.locationCity || f.location || ''; }
function numberOf(addr: string): string { const m = norm(addr).match(/^\d+/); return m ? m[0] : ''; }
function streetKey(addr: string): string {
  return norm(addr)
    .replace(/^\d+\s*/, '')
    .replace(/\b(street|st)\b/g, 'st')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(avenue|ave)\b/g, 'ave')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(highway|hwy)\b/g, 'hwy')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(north|n)\b/g, 'n')
    .replace(/\b(south|s)\b/g, 's')
    .replace(/\b(east|e)\b/g, 'e')
    .replace(/\b(west|w)\b/g, 'w');
}
function isValidPhone(p: string | undefined): boolean { if (!p) return false; const d = p.replace(/\D/g, ''); return /^1?[2-9]\d{2}\d{7}$/.test(d); }
function score(f: FarmRecord): number {
  let s = Math.min((f.crops || []).length, 10) * 3;
  if (isValidPhone(f.phone)) s += 5;
  if (f.website) s += 3;
  if (f.locationCity && f.locationCity.trim()) s += 1;
  if (f.lat != null && f.lon != null) s += 1;
  return s;
}
function sameFarm(a: FarmRecord, b: FarmRecord): boolean {
  // Same website = same entity (strongest signal).
  if (a.website && b.website && norm(a.website) === norm(b.website)) return true;
  const na = norm(addrOf(a)), nb = norm(addrOf(b));
  if (!na && !nb) return true;
  if (na === nb) return true;
  if (na === norm(b.name) || nb === norm(a.name)) return true;
  const sa = streetKey(addrOf(a)), sb = streetKey(addrOf(b));
  if (sa && sb && sa === sb) {
    const numA = numberOf(addrOf(a)), numB = numberOf(addrOf(b));
    if (numA && numB) return numA.includes(numB) || numB.includes(numA);
    return true;
  }
  return false;
}
function mergeFarms(group: FarmRecord[]): FarmRecord {
  const base = [...group].sort((a, b) => score(b) - score(a))[0];
  const merged: FarmRecord = { ...base };
  const crops = new Set<string>();
  for (const f of group) for (const c of f.crops || []) crops.add(c);
  merged.crops = [...crops];
  merged.phone = group.map((f) => f.phone).find(isValidPhone) ?? base.phone;
  merged.website = group.map((f) => f.website).find((w) => w && w.trim()) ?? base.website;
  const withGeo = group.find((f) => f.lat != null && f.lon != null);
  if (withGeo) { merged.lat = withGeo.lat; merged.lon = withGeo.lon; }
  const prov = new Map<string, any>();
  for (const f of group) for (const p of f.provenance || []) if (p && p.source) prov.set(p.source, p);
  merged.provenance = [...prov.values()];
  return merged;
}

function main() {
  const records: { path: string; farm: FarmRecord }[] = [];
  (function scan(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (e.name.endsWith('.json')) { try { records.push({ path: p, farm: JSON.parse(readFileSync(p, 'utf-8')) }); } catch {} }
    }
  })(FARMS_DIR);

  // Group by (state, normalized name).
  const byName = new Map<string, typeof records>();
  for (const r of records) {
    const key = `${(r.farm.locationState || '?').toUpperCase()}::${norm(r.farm.name)}`;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(r);
  }

  let mergedGroups = 0, droppedFiles = 0;
  const toDelete = new Set<string>();
  const toWrite: { path: string; farm: FarmRecord }[] = [];

  for (const [key, group] of byName) {
    if (group.length < 2) continue;
    // Cluster by same-farm heuristic.
    const clusters: typeof group[] = [];
    for (const r of group) {
      const c = clusters.find((cl) => cl.some((m) => sameFarm(m.farm, r.farm)));
      if (c) c.push(r); else clusters.push([r]);
    }
    for (const cluster of clusters) {
      if (cluster.length < 2) continue;
      mergedGroups++;
      const merged = mergeFarms(cluster.map((r) => r.farm));
      const canonical = cluster[0];
      const target = join(dirname(canonical.path), `${merged.slug}.json`);
      console.log(`MERGE ${key}: ${cluster.map((r) => r.farm.slug).join(' + ')} -> ${merged.slug}`);
      for (const r of cluster) if (r.path !== target) { toDelete.add(r.path); droppedFiles++; }
      toWrite.push({ path: target, farm: merged });
    }
  }

  console.log(`\nGroups with duplicates: ${mergedGroups}; files to drop: ${droppedFiles}`);
  if (DRY_RUN) { console.log('DRY RUN — no writes.'); return; }

  for (const p of toDelete) unlinkSync(p);
  for (const w of toWrite) { mkdirSync(dirname(w.path), { recursive: true }); writeFileSync(w.path, JSON.stringify(w.farm, null, 2) + '\n', 'utf-8'); }
  console.log('Done.');
}

main();
