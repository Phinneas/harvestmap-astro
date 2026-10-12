// Data-quality cleanup: remove third-party website links and malformed phones.
//
// The `website` field on many listings points to a directory/aggregator/data
// site (pickyourown.farm, farm-to-door.com, localharvest.org, exa.ai,
// mapquest.com, LinkedIn, …) instead of the farm's own site — a reused-scrape
// signal. We null those. Malformed phone numbers (e.g. Facebook page IDs like
// 1000646609, or area code 1xx) are also nulled.
//
// Usage: npx tsx scripts/cleanup-contacts.ts [--dry-run]

import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');
const FARMS_DIR = join(process.cwd(), 'src', 'data', 'farms');

// Directory / data / aggregator / social / news / government domains that are
// NOT the farm's own website. (Real single-farm domains are deliberately absent.)
const THIRD_PARTY = new Set([
  'farm-to-door.com', 'localharvest.org', 'pickyourown.farm', 'pickyourown.org',
  'bhumifarms.co', 'mapquest.com', 'cropcartmarkets.com', 'bluebookservices.com',
  'localpicks.org', 'exa.ai', 'foodbevg.com', 'farmersmarket.country',
  'agriculture.sc.gov', 'affordablehousing411.com', 'picktnproducts.org',
  'foraged.com', 'opengovus.com', 'agritourismworld.com', 'opencorpdata.com',
  'harvestlymarkets.com', 'linkedin.com', 'upickfarmsusa.com', 'marketspread.com',
  'facebook.com', 'appalachiangrown.org', 'visitncfarms.com', 'whereorg.com',
  'organicfarmfood.org', 'mlive.com', 'dandb.com', 'gofarmhop.com',
  'organic.nears.me', 'businessyab.com', 'ncfarmfresh.com', 'landcan.org',
  'rootseller.app', 'farmzenda.com', 'patch.com', 'allthefarms.com',
  'farmsandmarkets.com', 'arkansasgrown.org', 'bizprofile.net',
  'upickfarmlocator.com', 'minnesotagrown.com', 'gathergrove.com',
  'allevents.in', 'hubbiz.com', 'visitiowafarms.org', 'en.wikipedia.org',
  'opengovco.com', 'wisconsin.agricultural-crops.org', 'kyagr.com',
  'opengovny.com', 'loc8nearme.com', 'grownyc.org', 'maps.roadtrippers.com',
  'californiafarmlife.com', 'bbb.org', 'agriculture.stepupbook.us',
  'foodproduction.us', 'farmdirectory.agriculture.ny.gov', 'missourigrownusa.com',
  'localitybiz.com', 'connecticutbarns.org', 'pumpkinpatches.com',
  'buylocalfood.org', 'chooseiowa.com', 'enjoyillinois.com', 'unilocal.net',
  'newenglandfarmguide.com', 'iloveny.com', 'greenpeople.org',
  'theorganicfoodguide.org', 'agrocado.com', 'activerain.com',
  'localdifference.org', 'certifiedsc.com', 'farmersmarketplaces.com',
  'compass.com', 'realmaine.com', 'dinehere.us', 'pcfma.org', 'voofla.com',
  'washington.agricultural-crops.org', 'vimarsana.com', 'eatwellguide.org',
  'fyple.com', 'restaurantji.com', 'directory.oak-ky.org', 'northeastharvest.com',
  'upicklocator.com', 'local-farmers-markets.com', 'hipcamp.com', 'top10fresh.com',
  'localhens.com', 'farmgrownmarket.com', 'michigan.agricultural-crops.org',
  'abundantmontana.com', 'honey.com', 'wanderlog.com', 'foodstampbalance.net',
  'caff.org', 'us-farming.com', 'nysmaple.com', 'happeningnext.com',
  'agritourism.utah.gov', 'realorganicproject.org', 'misterwhat.com',
  'zupermar.com', 'venunite.com', 'hhs.iowa.gov', 'startupwebsolutions.com.au',
  'collectivecrop.com', 'findthemarkets.com', 'coldwellbankerhomes.com',
  'ccof.org', 'contracosta.ca.gov', 'taxexemptworld.com', 'guidestar.org',
  'nextdoor.com', 'chicagoparkdistrict.com', 'farmersmarketsnm.org', 'vymaps.com',
  'fromthelandofkansas.com', 'locallygrown.app', 'gbig.org', 'latimes.com',
  'idahopreferred.com', 'freshfarm.org', 'everafterfarms.com', 'farm-monitor.com',
  'opendatany.com', 'farmranch.org', 'shopifarm.com',
  'minnesota.agricultural-crops.org', 'applepickingorchards.com',
  'foodmarketmaker.com', 'agmrc.org', 'fmi.org', 'usdalocalfoodportal.com',
]);

function domainOf(w: string): string {
  const m = String(w || '').match(/^https?:\/\/([^\/]+)/i);
  if (!m) return '';
  return m[1].replace(/^www\./, '').toLowerCase();
}

function isValidPhone(p: string | undefined): boolean {
  if (!p) return true;
  const d = String(p).replace(/\D/g, '');
  return /^1?[2-9]\d{2}\d{7}$/.test(d);
}

function main() {
  const records: { path: string; farm: any }[] = [];
  (function scan(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) scan(p);
      else if (e.name.endsWith('.json')) { try { records.push({ path: p, farm: JSON.parse(readFileSync(p, 'utf-8')) }); } catch {} }
    }
  })(FARMS_DIR);

  let websiteNulled = 0, phoneNulled = 0;
  const toWrite: { path: string; farm: any }[] = [];

  for (const r of records) {
    let changed = false;
    const farm = { ...r.farm };
    if (farm.website && THIRD_PARTY.has(domainOf(farm.website))) {
      farm.website = null; changed = true; websiteNulled++;
    }
    if (!isValidPhone(farm.phone)) {
      farm.phone = null; changed = true; phoneNulled++;
    }
    if (changed) toWrite.push({ path: r.path, farm });
  }

  console.log(`Websites to null (third-party): ${websiteNulled}`);
  console.log(`Phones to null (malformed): ${phoneNulled}`);
  if (DRY_RUN) { console.log('DRY RUN — no writes.'); return; }

  for (const w of toWrite) writeFileSync(w.path, JSON.stringify(w.farm, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${toWrite.length} files.`);
}

main();
