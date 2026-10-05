// State page intros — original, state-specific prose for the /{state} pages.
// Each intro is composed from (a) hand-written per-state facts (regions +
// signature crops + a distinctive note) and (b) the state's real data (farm
// count, top crops by farm count, and actual enriched farms for the
// "don't miss" list). No two states share the same facts, so intros are not
// templated near-duplicates.

export interface HighlightFarm {
  name: string;
  slug: string;
  crops: string[];
}

export interface StateIntro {
  paragraphs: string[];
  highlightFarms: HighlightFarm[];
}

interface StateFacts {
  regions: string;
  signature: string;
  note: string;
}

const STATE_FACTS: Record<string, StateFacts> = {
  AL: { regions: 'the Tennessee Valley and the Black Belt', signature: 'peaches, blueberries, and sweet potatoes', note: 'Chilton County peaches ripen through June and July.' },
  AK: { regions: 'the Matanuska-Susitna Valley and the Kenai Peninsula', signature: 'potatoes, carrots, and hardy greens', note: 'Long summer days drive a short but intense growing season.' },
  AZ: { regions: 'the Salt River Valley and the Yuma basin', signature: 'citrus, pecans, and dates', note: "Yuma's winter vegetables ship nationwide while most of the country is frozen." },
  AR: { regions: 'the Ozarks and the Delta', signature: 'rice, tomatoes, and peaches', note: 'The Ozark highlands hold most of the state\u2019s u-pick orchards.' },
  CA: { regions: 'the Central Valley, the Salinas Valley, and the coastal hills', signature: 'strawberries, almonds, citrus, and grapes', note: 'Coastal fog keeps berries cool well into summer.' },
  CO: { regions: 'the Western Slope and the Front Range', signature: 'peaches, sweet corn, and potatoes', note: 'Palisade peaches are a high-country rite of late summer.' },
  CT: { regions: 'the Connecticut River Valley and the Litchfield Hills', signature: 'apples, sweet corn, and pumpkins', note: 'River-valley orchards are a short drive from nearly everywhere in the state.' },
  DE: { regions: 'Kent and Sussex counties', signature: 'watermelons, sweet corn, and peaches', note: 'The small state packs a long growing season into its southern counties.' },
  FL: { regions: 'the central ridge and the Redland of south Florida', signature: 'citrus, strawberries, and blueberries', note: 'Winter strawberries make Florida the nation\u2019s early berry source.' },
  GA: { regions: 'the north Georgia mountains and the coastal plain', signature: 'peaches, blueberries, and pecans', note: 'The mountain orchards cool off first and open the apple season.' },
  HI: { regions: 'the windward and upcountry slopes', signature: 'pineapple, coffee, and tropical fruit', note: 'Year-round growing means something is always in season.' },
  ID: { regions: 'the Snake River Plain', signature: 'potatoes, onions, and sugar beets', note: 'High desert sunshine and irrigation shape the Snake River valley.' },
  IL: { regions: 'the central prairies and the Shawnee Hills', signature: 'sweet corn, pumpkins, apples, and peaches', note: 'Southern Illinois orchards ripen before the rest of the Midwest.' },
  IN: { regions: 'the central till plains and the south', signature: 'sweet corn, tomatoes, and melons', note: 'Late-summer sweet corn and melons anchor the state\u2019s roadside stands.' },
  IA: { regions: 'the Driftless hills and central Iowa', signature: 'sweet corn, apples, and pumpkins', note: 'The Driftless region\u2019s bluffs shelter a cluster of small orchards.' },
  KS: { regions: 'the Flint Hills and the Arkansas River lowlands', signature: 'wheat, sunflowers, and pumpkins', note: 'Sunflower fields and pumpkin patches fill the calendar by early autumn.' },
  KY: { regions: 'the Bluegrass and the western coalfields', signature: 'apples, peaches, and pumpkins', note: 'Bluegrass orchards and burley tobacco country share the same rolling hills.' },
  LA: { regions: 'the river parishes and the north shore', signature: 'strawberries, satsumas, and sweet potatoes', note: "Ponchatoula's strawberry season is a spring tradition." },
  ME: { regions: 'the midcoast and Aroostook County', signature: 'wild blueberries, apples, and potatoes', note: 'The midcoast and Downeast barrens produce the state\u2019s wild blueberries.' },
  MD: { regions: 'the Eastern Shore and the Piedmont', signature: 'sweet corn, tomatoes, and apples', note: 'The Eastern Shore\u2019s sandy soil grows famously sweet corn.' },
  MA: { regions: 'the Connecticut Valley and the South Shore', signature: 'cranberries, apples, and sweet corn', note: 'Southeastern bogs flood every autumn for the cranberry harvest.' },
  MI: { regions: 'the west Michigan fruit belt and the Thumb', signature: 'cherries, apples, blueberries, and peaches', note: 'Traverse City cherries are a July institution.' },
  MN: { regions: 'the Minnesota River Valley and the southeast bluffs', signature: 'apples, wild rice, berries, and sweet corn', note: 'Southeast bluff-country orchards lead the state\u2019s apple crop.' },
  MS: { regions: 'the Delta and the piney woods', signature: 'blueberries, sweet potatoes, and pecans', note: 'South Mississippi blueberries come in early, before the summer heat peaks.' },
  MO: { regions: 'the Ozarks and the Missouri River bottoms', signature: 'peaches, apples, and black walnuts', note: 'The Ozark plateau keeps orchards cooler than the river bottoms.' },
  MT: { regions: 'the Flathead Valley and the Yellowstone basin', signature: 'cherries, huckleberries, and wheat', note: 'Flathead Lake cherries ripen against the backdrop of the Mission Mountains.' },
  NE: { regions: 'the Platte Valley and the edge of the Sandhills', signature: 'sweet corn, apples, and pumpkins', note: 'River-valley irrigation turns the Platte into a fruit-and-vegetable belt.' },
  NV: { regions: 'the high-desert oases of the north', signature: 'melons, onions, and garlic', note: 'Desert sun and mountain snowmelt water the northern valleys.' },
  NH: { regions: 'the Merrimack Valley and the Monadnock region', signature: 'apples, pumpkins, and maple syrup', note: 'Fall foliage and apple picking share the same October weekends.' },
  NJ: { regions: 'the south and the Highlands', signature: 'blueberries, cranberries, tomatoes, and sweet corn', note: 'Hammonton calls itself the blueberry capital of the world.' },
  NM: { regions: 'the Rio Grande Valley and the Hatch valley', signature: 'chile peppers, pecans, and apples', note: 'Hatch chiles are roasted roadside every autumn.' },
  NY: { regions: 'the Hudson Valley, the Finger Lakes, and Long Island', signature: 'apples, grapes, maple syrup, and sweet corn', note: 'The Finger Lakes and Hudson Valley are the state\u2019s apple and wine country.' },
  NC: { regions: 'the mountains and the coastal plain', signature: 'sweet potatoes, apples, and strawberries', note: 'Mountain orchards ripen apples while the coast is still warm.' },
  ND: { regions: 'the Red River Valley', signature: 'wheat, sunflowers, and honey', note: 'The Red River Valley is some of the richest farmland on the continent.' },
  OH: { regions: 'the Lake Erie shore, Amish Country, and the Hocking Hills', signature: 'apples, tomatoes, sweet corn, and maple syrup', note: 'Lake Erie moderates the climate for a long orchard season.' },
  OK: { regions: 'the eastern hills and the Red River', signature: 'peaches, pecans, and watermelon', note: 'Eastern Oklahoma hills are the state\u2019s peach country.' },
  OR: { regions: 'the Willamette Valley and the Hood River valley', signature: 'berries, pears, cherries, and hazelnuts', note: 'The Willamette Valley grows most of the nation\u2019s cane berries.' },
  PA: { regions: 'the Susquehanna Valley and Lancaster County', signature: 'apples, sweet corn, pumpkins, and mushrooms', note: 'Kennett Square grows a large share of the country\u2019s mushrooms.' },
  RI: { regions: 'the coastal farms of South County', signature: 'apples, sweet corn, and berries', note: 'Ocean breezes stretch the coastal growing season.' },
  SC: { regions: 'the upstate and the Pee Dee', signature: 'peaches, strawberries, and collards', note: 'The upstate is peach country, ripening earlier than Georgia.' },
  SD: { regions: 'the James River valley and the Black Hills', signature: 'sweet corn, pumpkins, and sunflowers', note: 'Late-summer sunflowers and pumpkins blanket the east-river counties.' },
  TN: { regions: 'the Tennessee Valley and the Cumberland Plateau', signature: 'apples, tomatoes, and strawberries', note: 'The Cumberland Plateau\u2019s orchards ripen through autumn.' },
  TX: { regions: 'the Hill Country, the Rio Grande Valley, and East Texas', signature: 'peaches, pecans, citrus, and melons', note: 'Fredericksburg peaches and Rio Grande citrus bookend the state\u2019s seasons.' },
  UT: { regions: 'the Wasatch Front and the high valleys', signature: 'cherries, peaches, and apricots', note: 'High-altitude orchards ripen stone fruit in the shadow of the Wasatch.' },
  VT: { regions: 'the Champlain Valley and the Green Mountains', signature: 'apples, maple syrup, and berries', note: 'The Champlain Valley is apple country; the hills run on maple.' },
  VA: { regions: 'the Shenandoah Valley and the Piedmont', signature: 'apples, peaches, and pumpkins', note: 'The Shenandoah Valley\u2019s orchards open the autumn season.' },
  WA: { regions: 'the Yakima Valley, the Skagit Valley, and the Wenatchee hills', signature: 'apples, cherries, berries, and pears', note: 'Wenatchee and Yakima grow more apples than anywhere else in the country.' },
  WV: { regions: 'the eastern panhandle and the Greenbrier Valley', signature: 'apples, peaches, and pumpkins', note: 'Mountain orchards in the eastern panhandle ripen late and cool.' },
  WI: { regions: 'the Driftless and the central sands', signature: 'cranberries, cherries, sweet corn, and apples', note: 'Door County cherries and central-sands cranberries define the state\u2019s fruit.' },
  WY: { regions: 'the high plains and the Bighorn Basin', signature: 'sugar beets, hay, and honey', note: 'High-altitude sunlight makes for short but productive seasons.' },
};

// Crop -> season mapping (general, used to build each state's season calendar).
const CROP_SEASON: Record<string, string> = {
  asparagus: 'spring', peas: 'spring', strawberries: 'spring', rhubarb: 'spring',
  herbs: 'spring', flowers: 'spring', 'green beans': 'summer', greens: 'spring',
  blueberries: 'summer', raspberries: 'summer', blackberries: 'summer', boysenberries: 'summer',
  peaches: 'summer', nectarines: 'summer', apricots: 'summer', plums: 'summer', cherries: 'summer',
  tomatoes: 'summer', corn: 'summer', 'sweet corn': 'summer', peppers: 'summer', eggplant: 'summer',
  cucumbers: 'summer', melons: 'summer', watermelon: 'summer', figs: 'summer', grapes: 'summer',
  apples: 'autumn', pears: 'autumn', pumpkins: 'autumn', squash: 'autumn', 'winter squash': 'autumn',
  persimmons: 'autumn', pecans: 'autumn', walnuts: 'autumn', almonds: 'autumn', cider: 'autumn',
  'christmas trees': 'autumn', sunflowers: 'autumn', gourds: 'autumn',
  citrus: 'winter', oranges: 'winter', lemons: 'winter', limes: 'winter', mandarins: 'winter',
  tangerines: 'winter', grapefruit: 'winter', kale: 'winter', dates: 'winter',
};

const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_LABEL: Record<string, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

function seasonOf(crop: string): string | undefined {
  const key = crop.toLowerCase();
  return CROP_SEASON[key] || CROP_SEASON[`${key}s`] || CROP_SEASON[key.replace(/s$/, '')];
}

function listItems(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function getStateIntro(
  stateCode: string,
  stateName: string,
  totalCount: number,
  topCrops: string[],
  typeCounts: { agritourism: number; markets: number; stands: number; csa: number },
  farms: { name: string; slug: string; crops: string[]; isEnriched: boolean }[],
): StateIntro {
  const facts = STATE_FACTS[stateCode] || {
    regions: 'every corner of the state',
    signature: 'seasonal produce',
    note: 'Confirm what is in season before visiting.',
  };

  // Season calendar from the state's actual top crops.
  const bySeason: Record<string, string[]> = { spring: [], summer: [], autumn: [], winter: [] };
  for (const crop of topCrops) {
    const s = seasonOf(crop);
    if (s) bySeason[s].push(crop);
  }
  const phrase = (list: string[]) => (list.length > 0 ? listItems(list.slice(0, 5).map((c) => c.toLowerCase())) : '');

  // Don't-miss farms: crop-bearing enriched first, then any other enriched.
  // Dedupe by name (some states list the same farm name more than once).
  const cropFarms = farms
    .filter((f) => f.isEnriched && f.crops.length > 0)
    .sort((a, b) => b.crops.length - a.crops.length);
  const otherFarms = farms.filter((f) => f.isEnriched && f.crops.length === 0);
  const seenNames = new Set<string>();
  const highlightFarms = [...cropFarms, ...otherFarms].filter((f) => {
    const key = f.name.toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  }).slice(0, 3);

  const paragraphs: string[] = [];

  paragraphs.push(
    `${stateName} is farm country, with ${totalCount.toLocaleString()} listings spread across ${facts.regions}. From u-pick orchards and roadside farm stands to farmers markets and CSAs, growers here raise ${facts.signature}, and the picking calendar stretches across the seasons. ${facts.note}`,
  );

  const seasonParts: string[] = [];
  if (bySeason.spring.length) seasonParts.push(`spring brings ${phrase(bySeason.spring)}`);
  if (bySeason.summer.length) seasonParts.push(`summer peaks with ${phrase(bySeason.summer)}`);
  if (bySeason.autumn.length) seasonParts.push(`autumn turns to ${phrase(bySeason.autumn)}`);
  if (bySeason.winter.length) seasonParts.push(`winter carries ${phrase(bySeason.winter)}`);
  if (seasonParts.length) {
    paragraphs.push(`The season runs like this: ${seasonParts.join('; ')}.`);
  }

  const dominant = SEASON_ORDER.reduce((b, s) => (bySeason[s].length > bySeason[b].length ? s : b), 'spring');
  if (bySeason[dominant].length) {
    paragraphs.push(
      `For most visitors the sweet spot is ${SEASON_LABEL[dominant].toLowerCase()}, when ${phrase(bySeason[dominant])} are at their best. Plan around the weather and confirm with individual farms before you go.`,
    );
  } else {
    paragraphs.push(
      `With a shorter growing window, timing matters here — confirm what is in season with individual farms before you go.`,
    );
  }

  const typeBits: string[] = [];
  if (typeCounts.agritourism) typeBits.push(`${typeCounts.agritourism.toLocaleString()} u-pick farms and orchards`);
  if (typeCounts.markets) typeBits.push(`${typeCounts.markets.toLocaleString()} farmers markets`);
  if (typeCounts.stands) typeBits.push(`${typeCounts.stands.toLocaleString()} farm stands and on-farm markets`);
  if (typeCounts.csa) typeBits.push(`${typeCounts.csa.toLocaleString()} CSAs`);
  if (typeBits.length) {
    paragraphs.push(
      `The listings break down into ${listItems(typeBits)}. Below, farms with crop and seasonality data are listed first. Always call ahead to confirm hours and what is ready to pick, since availability moves with the weather.`,
    );
  }

  if (highlightFarms.length > 0) {
    const desc = highlightFarms.map((f) =>
      `${f.name}${f.crops.length ? ` (${listItems(f.crops.slice(0, 2)).toLowerCase()})` : ''}`,
    );
    paragraphs.push(`Three standouts worth a look: ${listItems(desc)}.`);
  }

  return { paragraphs, highlightFarms };
}
