// WS1.3 verification: prove the noindex/sitemap contract is internally consistent.
// Re-implements src/lib/indexing.ts faithfully, computes isIndexable over every
// farm in dist/farm-data, and compares against dist/sitemap-farms.xml (whose
// URLs are state-scoped: /farms/{state}/{slug}).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dataDir = join(process.cwd(), 'dist', 'farm-data');
const PLACEHOLDER_IMAGE = '/images/farm-placeholder.svg';

function descriptionWordCount(farm) {
  const paragraphs = farm.description || [];
  return paragraphs.join(' ').trim().split(/\s+/).filter(Boolean).length;
}
function hasRealPhoto(farm) {
  if (!farm.image || farm.image === PLACEHOLDER_IMAGE) return false;
  if (/^https?:\/\/(images\.unsplash\.com|unsplash\.com)/i.test(farm.image)) return false;
  return true;
}
function meetsQualityBar(farm) {
  const hasName = !!farm.name;
  const hasAddress = !!(farm.locationCity || farm.location || farm.locationZipcode);
  const richDescription = descriptionWordCount(farm) >= 50;
  const realPhoto = hasRealPhoto(farm);
  const hasCrops = (farm.produce && farm.produce.length > 0) || (farm.crops && farm.crops.length > 0);
  const hasHours = !!farm.stand;
  const hasPhone = !!farm.phone;
  const hasWebsite = !!farm.website;
  const contactSignals = [hasHours, hasPhone, hasWebsite].filter(Boolean).length;
  return hasName && hasAddress && (richDescription || realPhoto || hasCrops || contactSignals >= 2);
}
function isServedFarm(farm) {
  return !['foodhub'].includes(farm.directory);
}
function isIndexable(farm) {
  if (!isServedFarm(farm)) return false;
  if (farm.source === 'editorial') return true;
  return meetsQualityBar(farm);
}

const farms = [];
const files = readdirSync(dataDir).filter((f) => f.endsWith('.json') && f !== 'index.json');
for (const file of files) {
  let arr = [];
  try { arr = JSON.parse(readFileSync(join(dataDir, file), 'utf-8')); } catch { continue; }
  for (const f of arr) farms.push(f);
}

const indexable = farms.filter(isIndexable);
const indexableKeys = new Set(
  indexable.map((f) => `${(f.locationState || '').toLowerCase()}/${f.slug}`),
);

const sitemap = readFileSync(join(process.cwd(), 'dist', 'sitemap-farms.xml'), 'utf-8');
const sitemapKeys = new Set(
  [...sitemap.matchAll(/<loc>https:\/\/harvestmap\.co\/farms\/([^<]+)<\/loc>/g)].map((m) => m[1]),
);

const missing = [...indexableKeys].filter((s) => !sitemapKeys.has(s));
const extra = [...sitemapKeys].filter((s) => !indexableKeys.has(s));

console.log(`total farms scanned: ${farms.length}`);
console.log(`isIndexable (enriched) farms:  ${indexableKeys.size}`);
console.log(`sitemap-farms.xml URLs:        ${sitemapKeys.size}`);
console.log(`indexable-but-missing: ${missing.length}`);
console.log(`in-sitemap-but-not-indexable: ${extra.length}`);

// 5 enriched + 5 thin samples
console.log('\n--- 5 ENRICHED (indexable) samples ---');
for (const f of indexable.slice(0, 5)) {
  console.log(`  ${(f.locationState || '').toLowerCase()}/${f.slug}  [crops=${(f.produce || f.crops || []).length}, desc=${(f.description || []).length} paras]`);
}
console.log('\n--- 5 THIN (noindex) samples ---');
for (const f of farms.filter((f) => !isIndexable(f)).slice(0, 5)) {
  console.log(`  ${f.slug}  [crops=${(f.produce || f.crops || []).length}, desc=${(f.description || []).length} paras]`);
}

if (missing.length === 0 && extra.length === 0) {
  console.log('\nRESULT: PASS — sitemap and isIndexable agree exactly.');
} else {
  console.log('\nRESULT: FAIL — see mismatches above.');
  process.exitCode = 1;
}
