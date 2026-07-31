/**
 * Directory data for the merged prototype.
 * Real listing names/towns from the review pack's North Carolina page
 * (Phinneas/harvestmap-astro dataset), structured with the pack's honesty
 * model: coordinates | approximate (state-level) | unknown crops.
 */

export type GeoQuality = "coordinates" | "approximate" | "none";

export interface Listing {
  id: string;
  name: string;
  town: string;
  state: string;
  kind: "Farm / agritourism" | "Farmers market" | "CSA" | "On-farm market";
  lat?: number;
  lon?: number;
  geo: GeoQuality;
  crops: { name: string; status: "peak" | "now" | "listed" }[] | null;
}

export const CROP_IMAGES: Record<string, string> = {
  Blueberries:
    "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=200&q=70",
  Blackberries:
    "https://images.unsplash.com/photo-1563746098251-d35aef196e83?auto=format&fit=crop&w=200&q=70",
  Raspberries:
    "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=200&q=70",
  Strawberries:
    "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=200&q=70",
  Peaches:
    "https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?auto=format&fit=crop&w=200&q=70",
  Tomatoes:
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=70",
  Apples:
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=70",
  Grapes:
    "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=200&q=70",
  Pumpkins:
    "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=200&q=70",
  Flowers:
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=200&q=70",
  Figs:
    "https://images.unsplash.com/photo-1601379760883-1bb497c558f0?auto=format&fit=crop&w=200&q=70",
  Muscadines:
    "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=200&q=70",
  default:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=200&q=70",
};

export const listings: Listing[] = [
  { id: "1", name: "A Step Above Strawberry Farm", town: "Four Oaks", state: "NC", kind: "Farm / agritourism", lat: 35.45, lon: -78.42, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }] },
  { id: "2", name: "A Vollmer Farm", town: "Bunn", state: "NC", kind: "Farm / agritourism", lat: 35.96, lon: -78.25, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Pumpkins", status: "listed" }] },
  { id: "3", name: "AAA Falu Farm", town: "Raleigh", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "4", name: "Algood's Berry Farm", town: "Fairmont", state: "NC", kind: "Farm / agritourism", lat: 34.5, lon: -79.11, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "5", name: "Alpha & Omega Corn Maze", town: "Hamptonville", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "6", name: "Amazing Grace Lavender Farm", town: "Greenville", state: "NC", kind: "Farm / agritourism", lat: 35.61, lon: -77.37, geo: "coordinates", crops: [{ name: "Flowers", status: "now" }] },
  { id: "7", name: "Anderson's Peach Orchard", town: "Candor", state: "NC", kind: "Farm / agritourism", lat: 35.29, lon: -79.74, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }] },
  { id: "8", name: "Armstrong Farms", town: "New London", state: "NC", kind: "Farm / agritourism", lat: 35.45, lon: -80.22, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }] },
  { id: "9", name: "Asbury Farm", town: "Tryon", state: "NC", kind: "Farm / agritourism", lat: 35.21, lon: -82.24, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }] },
  { id: "10", name: "Aunt Mary's Berries", town: "Clinton", state: "NC", kind: "Farm / agritourism", lat: 34.99, lon: -78.32, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "11", name: "Balloon Farmers Market", town: "Winston-Salem", state: "NC", kind: "Farmers market", geo: "approximate", crops: null },
  { id: "12", name: "Bar-B Ranch", town: "Dobson", state: "NC", kind: "Farm / agritourism", lat: 36.4, lon: -80.72, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }] },
  { id: "13", name: "Barham's Produce", town: "Elm City", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "14", name: "Baxter Blackberries", town: "Leland", state: "NC", kind: "Farm / agritourism", lat: 34.26, lon: -78.04, geo: "coordinates", crops: [{ name: "Blackberries", status: "peak" }] },
  { id: "15", name: "Beasley's Orchard & Farm", town: "Lexington", state: "NC", kind: "Farm / agritourism", lat: 35.82, lon: -80.25, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "16", name: "Berry Good Farm", town: "Chadbourn", state: "NC", kind: "Farm / agritourism", lat: 34.33, lon: -78.83, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "17", name: "Berry Hill U-Pick", town: "Monroe", state: "NC", kind: "Farm / agritourism", lat: 34.99, lon: -80.55, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Raspberries", status: "now" }] },
  { id: "18", name: "Bluebird Farm", town: "Marion", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "19", name: "Blueberry Hill", town: "Shelby", state: "NC", kind: "Farm / agritourism", lat: 35.29, lon: -81.54, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "20", name: "Bostic Blueberry Farm", town: "Bostic", state: "NC", kind: "Farm / agritourism", lat: 35.36, lon: -81.83, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "21", name: "Brooks Berry Patch", town: "Garner", state: "NC", kind: "Farm / agritourism", lat: 35.71, lon: -78.61, geo: "coordinates", crops: [{ name: "Blackberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "22", name: "Brushy Mountain Berry Farm", town: "Moravian Falls", state: "NC", kind: "Farm / agritourism", lat: 36.1, lon: -81.18, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "23", name: "Buckwheat Farm", town: "Apex", state: "NC", kind: "Farm / agritourism", lat: 35.73, lon: -78.85, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "24", name: "Burch Farms", town: "Faison", state: "NC", kind: "On-farm market", geo: "approximate", crops: null },
  { id: "25", name: "Butterfly Bend Farm", town: "Asheboro", state: "NC", kind: "Farm / agritourism", lat: 35.71, lon: -79.81, geo: "coordinates", crops: [{ name: "Flowers", status: "now" }, { name: "Tomatoes", status: "now" }] },
  { id: "26", name: "Cape Fear Blueberry Farm", town: "Currie", state: "NC", kind: "Farm / agritourism", lat: 34.55, lon: -78.02, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "27", name: "Carrigan Farms", town: "Mooresville", state: "NC", kind: "Farm / agritourism", lat: 35.58, lon: -80.81, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Pumpkins", status: "listed" }] },
  { id: "28", name: "Carter's Mountain Orchard", town: "Rutherfordton", state: "NC", kind: "Farm / agritourism", lat: 35.37, lon: -81.96, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }, { name: "Apples", status: "listed" }] },
  { id: "29", name: "Cedar Grove Blueberry Farm", town: "Cedar Grove", state: "NC", kind: "Farm / agritourism", lat: 36.17, lon: -79.16, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "30", name: "Chinquapin Orchard", town: "Brevard", state: "NC", kind: "Farm / agritourism", lat: 35.23, lon: -82.73, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }] },
  { id: "31", name: "Clayton Farmers Market", town: "Clayton", state: "NC", kind: "Farmers market", geo: "approximate", crops: null },
  { id: "32", name: "Coolmore Farm", town: "Tarboro", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "33", name: "Core Sound Crab Co. Farm", town: "Beaufort", state: "NC", kind: "Farm / agritourism", lat: 34.72, lon: -76.66, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Figs", status: "listed" }] },
  { id: "34", name: "Cottle Strawberry Farm", town: "Columbia", state: "NC", kind: "Farm / agritourism", lat: 35.92, lon: -76.25, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }] },
  { id: "35", name: "Creekside Berry Farm", town: "Marshall", state: "NC", kind: "Farm / agritourism", lat: 35.8, lon: -82.66, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Raspberries", status: "now" }] },
  { id: "36", name: "Crowder's Peach Orchard", town: "Wadesboro", state: "NC", kind: "Farm / agritourism", lat: 34.97, lon: -80.07, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }] },
  { id: "37", name: "Davis U-Pick", town: "Zebulon", state: "NC", kind: "Farm / agritourism", lat: 35.82, lon: -78.31, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Blackberries", status: "peak" }] },
  { id: "38", name: "Deep River Blueberries", town: "Ramseur", state: "NC", kind: "Farm / agritourism", lat: 35.73, lon: -79.65, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "39", name: "Devil Dog Orchard", town: "Jacksonville", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "40", name: "Dogwood Hills Farm", town: "Flat Rock", state: "NC", kind: "Farm / agritourism", lat: 35.27, lon: -82.44, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Grapes", status: "listed" }] },
  { id: "41", name: "Double R Farm", town: "Autryville", state: "NC", kind: "Farm / agritourism", lat: 35.1, lon: -78.6, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "42", name: "Down to Earth Farm", town: "Pittsboro", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "43", name: "Dry Creek Berry Farm", town: "Stokesdale", state: "NC", kind: "Farm / agritourism", lat: 36.24, lon: -79.98, geo: "coordinates", crops: [{ name: "Blackberries", status: "peak" }] },
  { id: "44", name: "Dunn's Berry Farm", town: "Dunn", state: "NC", kind: "Farm / agritourism", lat: 35.31, lon: -78.61, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "45", name: "Eno River Farm", town: "Hillsborough", state: "NC", kind: "Farm / agritourism", lat: 36.08, lon: -79.1, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Pumpkins", status: "listed" }] },
  { id: "46", name: "Fairview Berry Patch", town: "Fairview", state: "NC", kind: "Farm / agritourism", lat: 35.51, lon: -82.4, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "47", name: "Flat River Blueberry Farm", town: "Rougemont", state: "NC", kind: "Farm / agritourism", lat: 36.22, lon: -78.93, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "48", name: "Fogleman Farms", town: "Liberty", state: "NC", kind: "Farm / agritourism", lat: 35.85, lon: -79.57, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }] },
  { id: "49", name: "Foothills Fig Farm", town: "Morganton", state: "NC", kind: "Farm / agritourism", lat: 35.75, lon: -81.68, geo: "coordinates", crops: [{ name: "Figs", status: "listed" }] },
  { id: "50", name: "French Broad Farm", town: "Weaverville", state: "NC", kind: "Farm / agritourism", lat: 35.7, lon: -82.56, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Flowers", status: "now" }] },
  { id: "51", name: "Froberg's NC Orchard", town: "Saluda", state: "NC", kind: "Farm / agritourism", lat: 35.24, lon: -82.35, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }] },
  { id: "52", name: "Fuquay Farm & Garden", town: "Fuquay-Varina", state: "NC", kind: "Farmers market", geo: "approximate", crops: null },
  { id: "53", name: "Ganyard Hill Farm", town: "Durham", state: "NC", kind: "Farm / agritourism", lat: 36.0, lon: -78.9, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Pumpkins", status: "listed" }] },
  { id: "54", name: "Gardner's Berries", town: "Pinetops", state: "NC", kind: "Farm / agritourism", lat: 35.8, lon: -77.64, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "55", name: "Gentle Rain Mushrooms", town: "Chapel Hill", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "56", name: "Gilliam's U-Pick", town: "Warsaw", state: "NC", kind: "Farm / agritourism", lat: 35.0, lon: -78.09, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "57", name: "Gladstone Orchard", town: "Hendersonville", state: "NC", kind: "Farm / agritourism", lat: 35.32, lon: -82.46, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }] },
  { id: "58", name: "Golden Acres Berry Farm", town: "Rockingham", state: "NC", kind: "Farm / agritourism", lat: 34.94, lon: -79.77, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "59", name: "Grandad's Apples", town: "Hendersonville", state: "NC", kind: "Farm / agritourism", lat: 35.34, lon: -82.43, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }, { name: "Pumpkins", status: "listed" }] },
  { id: "60", name: "Green Level Berry Farm", town: "Cary", state: "NC", kind: "Farm / agritourism", lat: 35.78, lon: -78.85, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Raspberries", status: "now" }] },
  { id: "61", name: "Grier's Market Garden", town: "Gastonia", state: "NC", kind: "On-farm market", geo: "approximate", crops: null },
  { id: "62", name: "Happy Valley Figs", town: "Lenoir", state: "NC", kind: "Farm / agritourism", lat: 35.91, lon: -81.54, geo: "coordinates", crops: [{ name: "Figs", status: "listed" }] },
  { id: "63", name: "Harvest Home Farm", town: "Pilot Mountain", state: "NC", kind: "Farm / agritourism", lat: 36.39, lon: -80.47, geo: "coordinates", crops: [{ name: "Blackberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "64", name: "Haw River Mushrooms", town: "Saxapahaw", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "65", name: "Hickory Nut Gap Farm", town: "Fairview", state: "NC", kind: "On-farm market", lat: 35.52, lon: -82.41, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Pumpkins", status: "listed" }] },
  { id: "66", name: "Hiddenite Berry Farm", town: "Hiddenite", state: "NC", kind: "Farm / agritourism", lat: 35.9, lon: -81.09, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "67", name: "Hilltop Peach Orchard", town: "Ellenboro", state: "NC", kind: "Farm / agritourism", lat: 35.32, lon: -81.76, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }] },
  { id: "68", name: "Honeycutt Farms", town: "Holly Springs", state: "NC", kind: "Farm / agritourism", lat: 35.65, lon: -78.83, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Tomatoes", status: "now" }] },
  { id: "69", name: "Horton Grove Farm", town: "Bahama", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "70", name: "Imladris Farm", town: "Fairview", state: "NC", kind: "Farm / agritourism", lat: 35.5, lon: -82.39, geo: "coordinates", crops: [{ name: "Raspberries", status: "now" }, { name: "Blueberries", status: "peak" }] },
  { id: "71", name: "J.R. Moore & Sons", town: "Waxhaw", state: "NC", kind: "On-farm market", geo: "approximate", crops: null },
  { id: "72", name: "Justus Orchard", town: "Hendersonville", state: "NC", kind: "Farm / agritourism", lat: 35.36, lon: -82.49, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Blackberries", status: "peak" }] },
  { id: "73", name: "Ken's Korny Corn Maze", town: "Garner", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "74", name: "King's Berry Farm", town: "Kings Mountain", state: "NC", kind: "Farm / agritourism", lat: 35.24, lon: -81.34, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "75", name: "Knob Creek Orchard", town: "Lawndale", state: "NC", kind: "Farm / agritourism", lat: 35.42, lon: -81.56, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }, { name: "Apples", status: "listed" }] },
  { id: "76", name: "Lake Wheeler U-Pick", town: "Raleigh", state: "NC", kind: "Farm / agritourism", lat: 35.72, lon: -78.7, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }, { name: "Blackberries", status: "peak" }] },
  { id: "77", name: "Lazy J Ranch Berry Patch", town: "Willow Spring", state: "NC", kind: "Farm / agritourism", lat: 35.56, lon: -78.7, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "78", name: "Lewis Farms & Nursery", town: "Rocky Point", state: "NC", kind: "On-farm market", lat: 34.43, lon: -77.89, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Strawberries", status: "listed" }] },
  { id: "79", name: "Linville Falls Winery Orchard", town: "Linville Falls", state: "NC", kind: "Farm / agritourism", lat: 35.95, lon: -81.93, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Grapes", status: "listed" }] },
  { id: "80", name: "Long Strawberries Farm", town: "Fayetteville", state: "NC", kind: "Farm / agritourism", lat: 35.05, lon: -78.88, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }] },
  { id: "81", name: "Maple View Farm", town: "Hillsborough", state: "NC", kind: "On-farm market", lat: 36.08, lon: -79.13, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }] },
  { id: "82", name: "McAdams Farm", town: "Efland", state: "NC", kind: "Farm / agritourism", lat: 36.08, lon: -79.17, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Flowers", status: "now" }] },
  { id: "83", name: "McConnell Berries", town: "Lattimore", state: "NC", kind: "Farm / agritourism", lat: 35.32, lon: -81.66, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "84", name: "Millstone Creek Orchards", town: "Ramseur", state: "NC", kind: "Farm / agritourism", lat: 35.71, lon: -79.62, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }] },
  { id: "85", name: "Morning Glory Farm", town: "Monroe", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "86", name: "Mountain Fresh Berries", town: "Fletcher", state: "NC", kind: "Farm / agritourism", lat: 35.43, lon: -82.5, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Raspberries", status: "now" }] },
  { id: "87", name: "Moyock Muscadines", town: "Moyock", state: "NC", kind: "Farm / agritourism", lat: 36.52, lon: -76.18, geo: "coordinates", crops: [{ name: "Muscadines", status: "listed" }] },
  { id: "88", name: "Naylor Family Farm", town: "Angier", state: "NC", kind: "Farm / agritourism", lat: 35.51, lon: -78.74, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Pumpkins", status: "listed" }] },
  { id: "89", name: "New Garden Blueberries", town: "Greensboro", state: "NC", kind: "Farm / agritourism", lat: 36.07, lon: -79.82, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "90", name: "Oak Grove Berry Farm", town: "Oxford", state: "NC", kind: "Farm / agritourism", lat: 36.31, lon: -78.59, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "91", name: "Old North State Vineyard", town: "Elkin", state: "NC", kind: "Farm / agritourism", lat: 36.24, lon: -80.85, geo: "coordinates", crops: [{ name: "Grapes", status: "listed" }] },
  { id: "92", name: "Page Farms", town: "Raleigh", state: "NC", kind: "Farm / agritourism", lat: 35.85, lon: -78.58, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Blackberries", status: "peak" }] },
  { id: "93", name: "Patterson Farm Market", town: "Mount Ulla", state: "NC", kind: "On-farm market", lat: 35.66, lon: -80.73, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Tomatoes", status: "now" }, { name: "Pumpkins", status: "listed" }] },
  { id: "94", name: "Peaceful River Farm", town: "Chapel Hill", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "95", name: "Perry Lowe Orchards", town: "Moravian Falls", state: "NC", kind: "Farm / agritourism", lat: 36.12, lon: -81.2, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }] },
  { id: "96", name: "Phillips Farms of Cary", town: "Cary", state: "NC", kind: "Farm / agritourism", lat: 35.79, lon: -78.83, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Blueberries", status: "peak" }, { name: "Pumpkins", status: "listed" }] },
  { id: "97", name: "Pine Knot Farms", town: "Norlina", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "98", name: "Porter Farms & Nursery", town: "Willow Spring", state: "NC", kind: "Farm / agritourism", lat: 35.57, lon: -78.73, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Tomatoes", status: "now" }] },
  { id: "99", name: "Rabbits Ear Farm", town: "Hendersonville", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "100", name: "Red Hill Berry Farm", town: "Moyock", state: "NC", kind: "Farm / agritourism", lat: 36.51, lon: -76.2, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "101", name: "Ridgefield Farm & Orchard", town: "Brasstown", state: "NC", kind: "Farm / agritourism", lat: 35.03, lon: -83.96, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }] },
  { id: "102", name: "Riverbend Farm", town: "Midland", state: "NC", kind: "Farm / agritourism", lat: 35.23, lon: -80.5, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Flowers", status: "now" }] },
  { id: "103", name: "Rocky River Vineyards", town: "Midland", state: "NC", kind: "Farm / agritourism", lat: 35.24, lon: -80.52, geo: "coordinates", crops: [{ name: "Grapes", status: "listed" }] },
  { id: "104", name: "Sassafras Fork Farm", town: "Rougemont", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "105", name: "Screech Owl Greenhouses", town: "Columbus", state: "NC", kind: "On-farm market", geo: "approximate", crops: null },
  { id: "106", name: "Sky Top Orchard", town: "Flat Rock", state: "NC", kind: "Farm / agritourism", lat: 35.28, lon: -82.43, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }, { name: "Grapes", status: "listed" }] },
  { id: "107", name: "Smith's Nursery & Berry Farm", town: "Benson", state: "NC", kind: "Farm / agritourism", lat: 35.38, lon: -78.55, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Strawberries", status: "listed" }] },
  { id: "108", name: "Spring Valley Farm", town: "Grassy Creek", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "109", name: "Steed's Dairy & Corn Maze", town: "Zebulon", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "110", name: "Stepp's Hillcrest Orchard", town: "Hendersonville", state: "NC", kind: "Farm / agritourism", lat: 35.35, lon: -82.42, geo: "coordinates", crops: [{ name: "Apples", status: "listed" }, { name: "Peaches", status: "peak" }, { name: "Grapes", status: "listed" }] },
  { id: "111", name: "Sweet Blossom Farm", town: "McLeansville", state: "NC", kind: "Farm / agritourism", lat: 36.11, lon: -79.66, geo: "coordinates", crops: [{ name: "Flowers", status: "now" }, { name: "Tomatoes", status: "now" }] },
  { id: "112", name: "The Berry Patch", town: "Bolivia", state: "NC", kind: "Farm / agritourism", lat: 34.07, lon: -78.14, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "113", name: "Ticonderoga Farms NC", town: "Trinity", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "114", name: "Triple B Farms", town: "Beulaville", state: "NC", kind: "Farm / agritourism", lat: 34.92, lon: -77.77, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Tomatoes", status: "now" }] },
  { id: "115", name: "Twin Rivers Berry Farm", town: "New Bern", state: "NC", kind: "Farm / agritourism", lat: 35.1, lon: -77.04, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "116", name: "Uncle Henry's Organics", town: "Swannanoa", state: "NC", kind: "CSA", geo: "approximate", crops: null },
  { id: "117", name: "Vollmer's Peach House", town: "Bunn", state: "NC", kind: "On-farm market", lat: 35.95, lon: -78.24, geo: "coordinates", crops: [{ name: "Peaches", status: "peak" }] },
  { id: "118", name: "Waller Family Farm", town: "Durham", state: "NC", kind: "Farm / agritourism", lat: 36.03, lon: -78.92, geo: "coordinates", crops: [{ name: "Strawberries", status: "listed" }, { name: "Tomatoes", status: "now" }] },
  { id: "119", name: "Watha Berry Farm", town: "Watha", state: "NC", kind: "Farm / agritourism", lat: 34.63, lon: -77.97, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }] },
  { id: "120", name: "White Oak Lavender Farm", town: "Banner Elk", state: "NC", kind: "Farm / agritourism", lat: 36.16, lon: -81.87, geo: "coordinates", crops: [{ name: "Flowers", status: "now" }] },
  { id: "121", name: "Wildberry Farm", town: "Marion", state: "NC", kind: "Farm / agritourism", lat: 35.68, lon: -82.01, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Blackberries", status: "peak" }] },
  { id: "122", name: "Wise Acres Organic Farm", town: "Indian Trail", state: "NC", kind: "Farm / agritourism", lat: 35.07, lon: -80.68, geo: "coordinates", crops: [{ name: "Tomatoes", status: "now" }, { name: "Flowers", status: "now" }] },
  { id: "123", name: "Yellow House Flowers", town: "Punta Gorda", state: "NC", kind: "Farm / agritourism", geo: "approximate", crops: null },
  { id: "124", name: "Zimmerman Berry Farm", town: "Sandy Ridge", state: "NC", kind: "Farm / agritourism", lat: 36.5, lon: -80.09, geo: "coordinates", crops: [{ name: "Blueberries", status: "peak" }, { name: "Raspberries", status: "now" }] },
];

/** Town anchors for resolving the location input. */
export const townAnchors: { name: string; lat: number; lon: number }[] = [
  { name: "Raleigh", lat: 35.78, lon: -78.64 },
  { name: "Charlotte", lat: 35.23, lon: -80.84 },
  { name: "Asheville", lat: 35.6, lon: -82.55 },
  { name: "Durham", lat: 35.99, lon: -78.9 },
  { name: "Greensboro", lat: 36.07, lon: -79.79 },
  { name: "Wilmington", lat: 34.23, lon: -77.94 },
  { name: "Winston-Salem", lat: 36.1, lon: -80.24 },
  { name: "Fayetteville", lat: 35.05, lon: -78.88 },
  { name: "Cary", lat: 35.79, lon: -78.78 },
  { name: "Hendersonville", lat: 35.32, lon: -82.46 },
];

/** NC ZIP3 anchors — the subset the pack's consistency check would pass. */
export const zip3Anchors: Record<string, { lat: number; lon: number }> = {
  "275": { lat: 35.78, lon: -78.64 }, // Raleigh
  "276": { lat: 35.8, lon: -78.65 },
  "277": { lat: 35.99, lon: -78.9 }, // Durham
  "282": { lat: 35.23, lon: -80.84 }, // Charlotte
  "288": { lat: 35.6, lon: -82.55 }, // Asheville
  "274": { lat: 36.07, lon: -79.79 }, // Greensboro
  "284": { lat: 34.23, lon: -77.94 }, // Wilmington
  "271": { lat: 36.1, lon: -80.24 }, // Winston-Salem
  "287": { lat: 35.32, lon: -82.46 }, // Hendersonville
};

export function haversineMiles(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Weekly crop counts, derived from the same seasonality logic. */
export function peakCounts(source: Listing[]) {
  const counts = new Map<string, { picking: number; peak: number }>();
  for (const l of source) {
    if (!l.crops) continue;
    for (const c of l.crops) {
      if (c.status === "listed") continue;
      const cur = counts.get(c.name) ?? { picking: 0, peak: 0 };
      cur.picking += 1;
      if (c.status === "peak") cur.peak += 1;
      counts.set(c.name, cur);
    }
  }
  return [...counts.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.peak - a.peak);
}
