// scripts/refresh-harvest-calendars.ts
//
// Builds the five regional harvest calendars for HarvestMap's fall outing
// regions from two sources:
//
//   1. PickYourOwn.org per-state harvest calendars
//      (https://www.pickyourown.org/{ST}harvestcalendar.htm) — the same site
//      the farm-enrichment scraper already uses. These pages carry a real,
//      month-by-month "Early / Most Active / Late" crop table.
//   2. HarvestMap's own guide research — the fall windows that were hand-vetted
//      for each outing region (variety-level apple timing, pumpkin windows,
//      region micro-climate notes). This is the authoritative fall layer; PYO
//      supplies full-year breadth.
//
// Usage:
//   tsx scripts/refresh-harvest-calendars.ts
//
// Output:
//   src/data/regional-harvest-calendars.json

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PYO_BASE = 'https://www.pickyourown.org/';

interface RegionCrop {
  crop: string;
  slug: string;
  start: number; // 1-12
  end: number; // 1-12 (wraps when end < start, e.g. citrus)
  peak?: number[];
  months: string;
  fall?: boolean;
  note?: string;
}

interface RegionalCalendar {
  id: string;
  name: string;
  state: string;
  bestWindow?: string;
  crops: RegionCrop[];
}

interface CuratedFallCrop {
  crop: string;
  slug: string;
  start: number;
  end: number;
  peak?: number[];
  note?: string;
}

// ---------------------------------------------------------------------------
// Region → state + curated fall layer (from HarvestMap guide research)
// ---------------------------------------------------------------------------

const CURATED_FALL: Record<string, { bestWindow: string; crops: CuratedFallCrop[] }> = {
  'hudson-valley': {
    bestWindow: 'Late September through mid-October',
    crops: [
      { crop: 'Apples', slug: 'apples', start: 8, end: 11, peak: [9, 10], note: 'Gala & Honeycrisp late Sept; Empire, Macoun, Jonagold mid-Oct' },
      { crop: 'Pumpkins', slug: 'pumpkins', start: 9, end: 10, peak: [10], note: 'Howden, Sugar Pie, Lumina, Knucklehead, Jack-Be-Little' },
      { crop: 'Pears', slug: 'pears', start: 8, end: 10, peak: [9] },
      { crop: 'Grapes', slug: 'grapes', start: 9, end: 10, peak: [9] },
      { crop: 'Winter squash', slug: 'squash', start: 9, end: 11, peak: [10], note: 'Butternut, acorn, delicata peak in October' },
      { crop: 'Sweet corn', slug: 'corn', start: 7, end: 9, peak: [8], note: 'Last of the sweet corn by late September' },
      { crop: 'Tomatoes', slug: 'tomatoes', start: 7, end: 10, peak: [8], note: 'The last heirlooms, often smaller and more intense' },
    ],
  },
  'finger-lakes': {
    bestWindow: 'Late September through mid-October',
    crops: [
      { crop: 'Apples', slug: 'apples', start: 8, end: 11, peak: [9, 10], note: 'Gala, McIntosh, Empire, Honeycrisp; runs about a week behind the Hudson Valley' },
      { crop: 'Grapes', slug: 'grapes', start: 9, end: 11, peak: [9, 10], note: 'Late-harvest Riesling grapes left on the vine into November' },
      { crop: 'Pumpkins', slug: 'pumpkins', start: 9, end: 10, peak: [10] },
      { crop: 'Pears', slug: 'pears', start: 8, end: 10, peak: [9] },
      { crop: 'Winter squash', slug: 'squash', start: 9, end: 11, peak: [10], note: 'Butternut, delicata, acorn' },
      { crop: 'Tomatoes', slug: 'tomatoes', start: 7, end: 10, peak: [8], note: 'The last heirlooms of the season' },
    ],
  },
  berkshires: {
    bestWindow: 'Late September through mid-October',
    crops: [
      { crop: 'Apples', slug: 'apples', start: 8, end: 11, peak: [9, 10], note: 'McIntosh, Cortland, Empire; Macoun is the signature — elevation runs slightly later' },
      { crop: 'Pumpkins', slug: 'pumpkins', start: 9, end: 10, peak: [10], note: 'Howden, Sugar Pie, New England Pie, Lumina' },
      { crop: 'Pears', slug: 'pears', start: 8, end: 10, peak: [9] },
      { crop: 'Winter squash', slug: 'squash', start: 9, end: 11, peak: [10] },
    ],
  },
  'lehigh-valley': {
    bestWindow: 'Late September through mid-October',
    crops: [
      { crop: 'Apples', slug: 'apples', start: 8, end: 11, peak: [9, 10], note: 'Stayman is the Pennsylvania apple; Empire, Fuji, Rome by mid-October' },
      { crop: 'Pumpkins', slug: 'pumpkins', start: 9, end: 10, peak: [10], note: 'Howden, Sugar Pie, decorative gourds' },
      { crop: 'Pears', slug: 'pears', start: 8, end: 10, peak: [9] },
      { crop: 'Grapes', slug: 'grapes', start: 8, end: 10, peak: [9] },
      { crop: 'Winter squash', slug: 'squash', start: 9, end: 11, peak: [10] },
      { crop: 'Sweet corn', slug: 'corn', start: 7, end: 9, peak: [8], note: 'The slate belt hills run a week behind the valley floor' },
    ],
  },
  'loudoun-county': {
    bestWindow: 'Late September through late October',
    crops: [
      { crop: 'Apples', slug: 'apples', start: 8, end: 11, peak: [9, 10], note: 'Gala, Honeycrisp, Fuji late Sept; Red Delicious, Rome, Granny Smith mid-Oct — milder climate runs longer' },
      { crop: 'Pumpkins', slug: 'pumpkins', start: 9, end: 11, peak: [10], note: 'Virginia\u2019s longer season means bigger pumpkins, later close' },
      { crop: 'Grapes', slug: 'grapes', start: 8, end: 10, peak: [9], note: 'Wine grapes from Loudoun\u2019s 40+ farm wineries' },
      { crop: 'Pears', slug: 'pears', start: 8, end: 10, peak: [9] },
      { crop: 'Winter squash', slug: 'squash', start: 9, end: 11, peak: [10] },
      { crop: 'Tomatoes', slug: 'tomatoes', start: 7, end: 10, peak: [8] },
    ],
  },
};

const REGIONS: { id: string; name: string; state: string }[] = [
  { id: 'hudson-valley', name: 'Hudson Valley', state: 'NY' },
  { id: 'finger-lakes', name: 'Finger Lakes', state: 'NY' },
  { id: 'berkshires', name: 'Berkshires', state: 'MA' },
  { id: 'lehigh-valley', name: 'Lehigh Valley', state: 'PA' },
  { id: 'loudoun-county', name: 'Loudoun County', state: 'VA' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// Canonical crop names → (display name, site slug). Site slugs match the
// `produce` vocabulary in src/data/farms/*.json so calendar entries link to
// real /crops/{slug} pages.
// ---------------------------------------------------------------------------

const CANONICAL: Record<string, { crop: string; slug: string }> = {
  apples: { crop: 'Apples', slug: 'apples' },
  pears: { crop: 'Pears', slug: 'pears' },
  'asian pears': { crop: 'Asian pears', slug: 'asian-pears' },
  peaches: { crop: 'Peaches', slug: 'peaches' },
  nectarines: { crop: 'Nectarines', slug: 'nectarines' },
  plums: { crop: 'Plums', slug: 'plums' },
  apricots: { crop: 'Apricots', slug: 'apricots' },
  cherries: { crop: 'Cherries', slug: 'cherries' },
  blueberries: { crop: 'Blueberries', slug: 'blueberries' },
  raspberries: { crop: 'Raspberries', slug: 'raspberries' },
  'fall raspberries': { crop: 'Fall raspberries', slug: 'raspberries' },
  blackberries: { crop: 'Blackberries', slug: 'blackberries' },
  strawberries: { crop: 'Strawberries', slug: 'strawberries' },
  grapes: { crop: 'Grapes', slug: 'grapes' },
  figs: { crop: 'Figs', slug: 'figs' },
  pumpkins: { crop: 'Pumpkins', slug: 'pumpkins' },
  squash: { crop: 'Winter squash', slug: 'squash' },
  corn: { crop: 'Sweet corn', slug: 'corn' },
  'sweet corn': { crop: 'Sweet corn', slug: 'corn' },
  tomatoes: { crop: 'Tomatoes', slug: 'tomatoes' },
  peppers: { crop: 'Peppers', slug: 'peppers' },
  eggplant: { crop: 'Eggplant', slug: 'eggplant' },
  cucumbers: { crop: 'Cucumbers', slug: 'cucumbers' },
  'green beans': { crop: 'Green beans', slug: 'green beans' },
  beans: { crop: 'Green beans', slug: 'green beans' },
  'snap beans': { crop: 'Snap beans', slug: 'green beans' },
  'lima beans': { crop: 'Lima beans', slug: 'lima-beans' },
  peas: { crop: 'Peas', slug: 'peas' },
  asparagus: { crop: 'Asparagus', slug: 'asparagus' },
  lettuce: { crop: 'Lettuce', slug: 'lettuce' },
  broccoli: { crop: 'Broccoli', slug: 'broccoli' },
  cabbage: { crop: 'Cabbage', slug: 'cabbage' },
  cauliflower: { crop: 'Cauliflower', slug: 'cauliflower' },
  kale: { crop: 'Kale', slug: 'kale' },
  spinach: { crop: 'Spinach', slug: 'spinach' },
  beets: { crop: 'Beets', slug: 'beets' },
  carrots: { crop: 'Carrots', slug: 'carrots' },
  onions: { crop: 'Onions', slug: 'onions' },
  potatoes: { crop: 'Potatoes', slug: 'potatoes' },
  rhubarb: { crop: 'Rhubarb', slug: 'rhubarb' },
  zucchini: { crop: 'Zucchini', slug: 'zucchini' },
  'brussels sprouts': { crop: 'Brussels sprouts', slug: 'brussels-sprouts' },
  collards: { crop: 'Collards', slug: 'collards' },
  okra: { crop: 'Okra', slug: 'okra' },
  'swiss chard': { crop: 'Swiss chard', slug: 'swiss-chard' },
  flowers: { crop: 'Flowers', slug: 'flowers' },
  herbs: { crop: 'Herbs', slug: 'herbs' },
};

function canonicalizeCrop(raw: string): { crop: string; slug: string } | null {
  let name = raw
    .replace(/&nbsp;/g, ' ')
    .replace(/\([^)]*\)/g, ' ') // strip "(aka, sweet corn)", "(green, yellow...)"
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (name.startsWith('squash')) name = 'squash';
  if (name.startsWith('corn')) name = 'corn';
  if (name.startsWith('kale')) name = 'kale';

  if (CANONICAL[name]) return CANONICAL[name];

  for (const key of Object.keys(CANONICAL)) {
    if (name === key || name.startsWith(key) || key.startsWith(name)) {
      return CANONICAL[key];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Date parsing (month names)
// ---------------------------------------------------------------------------

const MONTH_TOKENS: [RegExp, number][] = [
  [/jan(?:uary)?/i, 1],
  [/feb(?:ruary)?/i, 2],
  [/mar(?:ch)?/i, 3],
  [/apr(?:il)?/i, 4],
  [/may/i, 5],
  [/jun(?:e)?/i, 6],
  [/jul(?:y)?/i, 7],
  [/aug(?:ust)?/i, 8],
  [/sep(?:t|tember)?/i, 9],
  [/oct(?:ober)?/i, 10],
  [/nov(?:ember)?/i, 11],
  [/dec(?:ember)?/i, 12],
];

function monthNumbersIn(text: string): number[] {
  const months: number[] = [];
  for (const [re, m] of MONTH_TOKENS) {
    const matches = text.match(new RegExp(re.source, 'gi'));
    if (matches) for (let i = 0; i < matches.length; i++) months.push(m);
  }
  return months;
}

// "May 1 - May 30" / "July 1 - October 31" / "December . 5" → {start, end} months.
function parseWindow(text: string): { start: number; end: number } | null {
  if (!text) return null;
  const months = monthNumbersIn(text);
  if (months.length === 0) return null;
  return { start: months[0], end: months[months.length - 1] };
}

// ---------------------------------------------------------------------------
// PYO HTML parsing
// ---------------------------------------------------------------------------

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cellText(cell: string): string {
  return stripTags(cell);
}

interface RawCropWindow {
  crop: string;
  slug: string;
  start: number;
  end: number;
  fall: boolean;
}

/**
 * Parse the "Crops | Early | Most Active | Late" table (NY, MA, PA).
 * Uses the "Most Active" range as the canonical window, falling back to the
 * Early/Late endpoint columns.
 */
function parseEarlyActiveLate(html: string): RawCropWindow[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  for (const table of tables) {
    if (!/Most Active/i.test(table)) continue;
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const out: RawCropWindow[] = [];
    for (const row of rows) {
      const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(cellText);
      if (cells.length < 4) continue;
      const canon = canonicalizeCrop(cells[0]);
      if (!canon) continue;
      const active = parseWindow(cells[2]); // "Most Active"
      const early = parseWindow(cells[1]);
      const late = parseWindow(cells[3]);
      const start = active?.start ?? early?.start ?? late?.start;
      const end = active?.end ?? late?.end ?? early?.end;
      if (start === undefined || end === undefined) continue;
      out.push({ crop: canon.crop, slug: canon.slug, start, end, fall: isFallCrop(canon.slug) });
    }
    if (out.length > 0) return out;
  }
  return [];
}

/**
 * Parse a "Crop | Start Date | End Date" table (PA's berry/stone-fruit table).
 */
function parseStartEnd(html: string): RawCropWindow[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  const out: RawCropWindow[] = [];
  for (const table of tables) {
    if (!/Start Date/i.test(table) || !/End Date/i.test(table)) continue;
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    for (const row of rows) {
      const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(cellText);
      if (cells.length < 3) continue;
      const canon = canonicalizeCrop(cells[0]);
      if (!canon) continue;
      const start = parseWindow(cells[1]);
      const end = parseWindow(cells[2]);
      if (!start || !end) continue;
      out.push({ crop: canon.crop, slug: canon.slug, start: start.start, end: end.end, fall: isFallCrop(canon.slug) });
    }
  }
  return out;
}

/**
 * Parse a month-grid table ("Fruit/Veg | Jan..Dec" with X marks).
 * Handles the two-cell-per-month layout MA uses.
 */
function parseMonthGrid(html: string): RawCropWindow[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  for (const table of tables) {
    const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    const headRow = rows[0] || '';
    const headCells = (headRow.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(cellText);
    const hasMonthHead = headCells.some((c) => /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(c));
    if (!hasMonthHead) continue;

    const out: RawCropWindow[] = [];
    for (const row of rows.slice(1)) {
      const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
      if (cells.length < 2) continue;
      const canon = canonicalizeCrop(cellText(cells[0]));
      if (!canon) continue;
      const marked: number[] = [];
      cells.slice(1).forEach((c, i) => {
        if (/X/.test(stripTags(c))) marked.push(i + 1);
      });
      if (marked.length === 0) continue;
      if (cells.length - 1 >= 20) {
        // Two cells per month: collapse pairs.
        const collapsed: number[] = [];
        for (let i = 0; i < marked.length; i += 2) {
          collapsed.push(Math.floor((marked[i] - 1) / 2) + 1);
        }
        out.push({ crop: canon.crop, slug: canon.slug, start: collapsed[0], end: collapsed[collapsed.length - 1], fall: isFallCrop(canon.slug) });
      } else {
        out.push({ crop: canon.crop, slug: canon.slug, start: marked[0], end: marked[marked.length - 1], fall: isFallCrop(canon.slug) });
      }
    }
    if (out.length > 0) return out;
  }
  return [];
}

const FALL_SLUGS = new Set([
  'apples', 'pears', 'pumpkins', 'squash', 'corn', 'grapes',
  'figs', 'persimmons', 'pomegranates', 'asian-pears',
]);

function isFallCrop(slug: string): boolean {
  return FALL_SLUGS.has(slug);
}

function parseStateCalendar(state: string, html: string): RawCropWindow[] {
  const fromEAL = parseEarlyActiveLate(html);
  if (fromEAL.length > 0) {
    return mergeRaw(fromEAL, parseStartEnd(html));
  }
  const fromGrid = parseMonthGrid(html);
  if (fromGrid.length > 0) return fromGrid;
  return parseStartEnd(html);
}

function mergeRaw(a: RawCropWindow[], b: RawCropWindow[]): RawCropWindow[] {
  const map = new Map<string, RawCropWindow>();
  for (const r of [...a, ...b]) {
    if (!map.has(r.slug)) map.set(r.slug, r);
  }
  return [...map.values()];
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function monthsLabel(start: number, end: number): string {
  if (start === end) return MONTH_NAMES[start - 1];
  return `${MONTH_NAMES[start - 1]} – ${MONTH_NAMES[end - 1]}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const states = [...new Set(REGIONS.map((r) => r.state))];
  const pyoByState: Record<string, RawCropWindow[]> = {};

  for (const st of states) {
    const url = `${PYO_BASE}${st}harvestcalendar.htm`;
    try {
      const html = await fetchHtml(url);
      pyoByState[st] = parseStateCalendar(st, html);
      console.log(`[PYO] ${st}: ${pyoByState[st].length} crops from ${url}`);
    } catch (e) {
      console.error(`[PYO] ${st} failed:`, e);
      pyoByState[st] = [];
    }
    await sleep(400);
  }

  const regions: RegionalCalendar[] = REGIONS.map((region) => {
    const curated = CURATED_FALL[region.id];
    const pyoCrops = pyoByState[region.state] || [];
    const crops = new Map<string, RegionCrop>();

    // 1. Full-year breadth from PYO.
    for (const raw of pyoCrops) {
      if (crops.has(raw.slug)) continue;
      crops.set(raw.slug, {
        crop: raw.crop,
        slug: raw.slug,
        start: raw.start,
        end: raw.end,
        months: monthsLabel(raw.start, raw.end),
        fall: raw.fall,
      });
    }

    // 2. Authoritative fall layer from guide research (overrides PYO).
    for (const fc of curated.crops) {
      crops.set(fc.slug, {
        crop: fc.crop,
        slug: fc.slug,
        start: fc.start,
        end: fc.end,
        peak: fc.peak,
        months: monthsLabel(fc.start, fc.end),
        fall: true,
        note: fc.note,
      });
    }

    const sorted = [...crops.values()].sort((a, b) => {
      if ((a.fall ? 1 : 0) !== (b.fall ? 1 : 0)) return (b.fall ? 1 : 0) - (a.fall ? 1 : 0);
      if (a.start !== b.start) return a.start - b.start;
      return a.crop.localeCompare(b.crop);
    });

    return {
      id: region.id,
      name: region.name,
      state: region.state,
      bestWindow: curated.bestWindow,
      crops: sorted,
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'pickyourown.org harvest calendars + HarvestMap guide research',
    regions,
  };

  const outPath = join(process.cwd(), 'src', 'data', 'regional-harvest-calendars.json');
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`\nWrote ${outPath} (${regions.length} regions, ${regions.reduce((n, r) => n + r.crops.length, 0)} crops)`);
}

main();
