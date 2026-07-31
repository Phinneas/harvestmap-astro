export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export interface Farm {
  slug: string;
  name: string;
  region: string;
  location: string;
  peak: Season;
  inSeasonNow: boolean;
  upick: string[];
  confirmed?: boolean;
  harvestingNow?: boolean;
}

/** Farms confirmed harvesting this week (community-confirmed) */
export const confirmedFarms: Farm[] = [
  {
    slug: "bramble-and-bee",
    name: "Bramble & Bee",
    region: "Berries & honey",
    location: "Hood River, OR",
    peak: "Summer",
    inSeasonNow: true,
    harvestingNow: true,
    confirmed: true,
    upick: ["Strawberries", "Raspberries", "Blueberries", "Wildflower honey"],
  },
  {
    slug: "sunhollow-orchard",
    name: "Sunhollow Orchard",
    region: "Stone fruit & orchard",
    location: "Sebastopol, CA",
    peak: "Summer",
    inSeasonNow: true,
    harvestingNow: true,
    confirmed: true,
    upick: ["Cherries", "Apricots", "Peaches & Nectarines", "Plums"],
  },
  {
    slug: "frostapple-orchard",
    name: "Frostapple Orchard",
    region: "Apples, pears & cider",
    location: "Sebastopol, CA",
    peak: "Autumn",
    inSeasonNow: false,
    confirmed: true,
    upick: ["Early apples", "Pears & Quince", "Heirloom apples", "Barrel cider"],
  },
  {
    slug: "goldfield-grainworks",
    name: "Goldfield Grainworks",
    region: "Grain, squash & roots",
    location: "Petaluma, CA",
    peak: "Autumn",
    inSeasonNow: false,
    confirmed: true,
    upick: ["Sweet corn", "Heirloom beans", "Winter squash", "Stone-milled flour"],
  },
  {
    slug: "mossgrove-mushrooms",
    name: "Mossgrove Mushrooms",
    region: "Foraged & cultivated fungi",
    location: "Olympia, WA",
    peak: "Autumn",
    inSeasonNow: false,
    confirmed: true,
    upick: ["Oyster & Lion's mane", "Shiitake", "Chanterelles", "Winter hedgehogs"],
  },
];

/** Sample of the wider directory (7,025 farms in the real database) */
export const directoryFarms: Farm[] = [
  ...confirmedFarms,
  {
    slug: "4-h-center-at-auer-farm",
    name: "4-H Center at Auer Farm",
    region: "Agritourism",
    location: "Bloomfield, CT",
    peak: "Summer",
    inSeasonNow: true,
    upick: ["Blueberries", "Raspberries"],
  },
  {
    slug: "4g-reyes-farms",
    name: "4G Reyes Farms",
    region: "Agritourism",
    location: "Poteet, TX",
    peak: "Spring",
    inSeasonNow: false,
    upick: ["Strawberries"],
  },
  {
    slug: "a-and-b-country-chicken",
    name: "A and B Country Chicken",
    region: "Agritourism",
    location: "Humboldt, NE",
    peak: "Autumn",
    inSeasonNow: true,
    upick: ["Pumpkins", "Squash", "Tomatoes", "Peas"],
  },
  {
    slug: "aarstads-blueberry-farm",
    name: "Aarstad's Blueberry Farm",
    region: "Agritourism",
    location: "Snohomish, WA",
    peak: "Summer",
    inSeasonNow: true,
    upick: ["Blueberries"],
  },
  {
    slug: "abbottsford-farms",
    name: "Abbottsford Farms",
    region: "Agritourism",
    location: "Grange, GA",
    peak: "Spring",
    inSeasonNow: false,
    upick: ["Strawberries", "Pumpkins"],
  },
  {
    slug: "wyeast-vineyards",
    name: "Wy'East Vineyards",
    region: "Agritourism",
    location: "Hood River, OR",
    peak: "Autumn",
    inSeasonNow: false,
    upick: ["Grapes"],
  },
  {
    slug: "ymca-farm",
    name: "YMCA Farm",
    region: "Agritourism",
    location: "Puyallup, WA",
    peak: "Summer",
    inSeasonNow: true,
    upick: ["Strawberries", "Raspberries", "Apples", "Cherries"],
  },
  {
    slug: "yuletide-farms",
    name: "Yuletide Farms",
    region: "Agritourism",
    location: "Macomb, OK",
    peak: "Autumn",
    inSeasonNow: false,
    upick: ["Pumpkins", "Christmas trees"],
  },
];

export interface SeasonInfo {
  name: Season;
  tagline: string;
  crops: { name: string; months: string }[];
  farmCount: number;
  current?: boolean;
}

export const seasons: SeasonInfo[] = [
  {
    name: "Spring",
    tagline: "First shoots & blossoms",
    crops: [
      { name: "Asparagus", months: "Mar – May" },
      { name: "Cutting lettuces", months: "Apr – Jun" },
      { name: "Strawberries", months: "May – Jun" },
      { name: "Peas & herbs", months: "Apr – Jun" },
    ],
    farmCount: 499,
  },
  {
    name: "Summer",
    tagline: "The glut of the year",
    current: true,
    crops: [
      { name: "Apricots", months: "June" },
      { name: "Peaches & nectarines", months: "Jul – Aug" },
      { name: "Berries", months: "Jun – Aug" },
      { name: "Sweet corn", months: "August" },
    ],
    farmCount: 914,
  },
  {
    name: "Autumn",
    tagline: "Orchards & curing barns",
    crops: [
      { name: "Heirloom apples", months: "Sep – Nov" },
      { name: "Winter squash", months: "Oct – Dec" },
      { name: "Chanterelles", months: "Sep – Dec" },
      { name: "Pears & quince", months: "Sep – Oct" },
    ],
    farmCount: 538,
  },
  {
    name: "Winter",
    tagline: "Citrus, cider & stores",
    crops: [
      { name: "Citrus", months: "Dec – Feb" },
      { name: "Hardy greens", months: "Nov – Feb" },
      { name: "Barrel cider", months: "Dec – Mar" },
      { name: "Storage roots", months: "Nov – Feb" },
    ],
    farmCount: 5,
  },
];

export interface StateInfo {
  name: string;
  farms: number;
  enriched: number;
}

export const states: StateInfo[] = [
  { name: "Alabama", farms: 97, enriched: 56 },
  { name: "Alaska", farms: 12, enriched: 2 },
  { name: "Arizona", farms: 65, enriched: 8 },
  { name: "Arkansas", farms: 106, enriched: 32 },
  { name: "California", farms: 595, enriched: 43 },
  { name: "Colorado", farms: 84, enriched: 4 },
  { name: "Connecticut", farms: 132, enriched: 21 },
  { name: "Delaware", farms: 35, enriched: 7 },
  { name: "District of Columbia", farms: 40, enriched: 0 },
  { name: "Florida", farms: 294, enriched: 107 },
  { name: "Georgia", farms: 179, enriched: 36 },
  { name: "Hawaii", farms: 16, enriched: 2 },
  { name: "Idaho", farms: 80, enriched: 15 },
  { name: "Illinois", farms: 178, enriched: 32 },
  { name: "Indiana", farms: 131, enriched: 18 },
  { name: "Iowa", farms: 121, enriched: 2 },
  { name: "Kansas", farms: 77, enriched: 2 },
  { name: "Kentucky", farms: 158, enriched: 18 },
  { name: "Louisiana", farms: 47, enriched: 8 },
  { name: "Maine", farms: 208, enriched: 57 },
  { name: "Maryland", farms: 100, enriched: 0 },
  { name: "Massachusetts", farms: 225, enriched: 47 },
  { name: "Michigan", farms: 348, enriched: 49 },
  { name: "Minnesota", farms: 91, enriched: 22 },
  { name: "Mississippi", farms: 49, enriched: 11 },
  { name: "Missouri", farms: 152, enriched: 30 },
  { name: "Montana", farms: 51, enriched: 1 },
  { name: "Nebraska", farms: 51, enriched: 15 },
  { name: "Nevada", farms: 36, enriched: 1 },
  { name: "New Hampshire", farms: 89, enriched: 27 },
  { name: "New Jersey", farms: 169, enriched: 34 },
  { name: "New Mexico", farms: 46, enriched: 5 },
  { name: "New York", farms: 340, enriched: 77 },
  { name: "North Carolina", farms: 365, enriched: 112 },
  { name: "North Dakota", farms: 28, enriched: 1 },
  { name: "Ohio", farms: 140, enriched: 24 },
  { name: "Oklahoma", farms: 76, enriched: 10 },
  { name: "Oregon", farms: 177, enriched: 73 },
  { name: "Pennsylvania", farms: 201, enriched: 40 },
  { name: "Rhode Island", farms: 49, enriched: 14 },
  { name: "South Carolina", farms: 103, enriched: 39 },
  { name: "South Dakota", farms: 22, enriched: 1 },
  { name: "Tennessee", farms: 230, enriched: 76 },
  { name: "Texas", farms: 211, enriched: 52 },
  { name: "Utah", farms: 54, enriched: 2 },
  { name: "Vermont", farms: 97, enriched: 19 },
  { name: "Virginia", farms: 205, enriched: 21 },
  { name: "Washington", farms: 263, enriched: 51 },
  { name: "West Virginia", farms: 75, enriched: 2 },
  { name: "Wisconsin", farms: 301, enriched: 67 },
  { name: "Wyoming", farms: 26, enriched: 0 },
];

export const stats = {
  farmsListed: 7025,
  withCropData: 1393,
  fullyEnriched: 6,
  confirmedThisWeek: 6,
  inSeasonNow: 921,
};
