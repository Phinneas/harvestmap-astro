import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listings,
  townAnchors,
  zip3Anchors,
  haversineMiles,
  CROP_IMAGES,
  type Listing,
} from "@/data/directory";

interface UserLoc {
  lat: number;
  lon: number;
  label: string;
  zip3?: string;
}

interface Notice {
  kind: "zip3-refused" | "no-match";
  message: string;
}

const cropOptions = [
  "Blueberries",
  "Blackberries",
  "Peaches",
  "Tomatoes",
  "Raspberries",
  "Strawberries",
  "Apples",
  "Flowers",
  "Grapes",
];
const kindOptions = ["Farm / agritourism", "Farmers market", "CSA", "On-farm market"];
const radiusOptions = [25, 50, 100, 500];

function cropImage(l: Listing): string {
  const first = l.crops?.[0]?.name ?? "default";
  return CROP_IMAGES[first] ?? CROP_IMAGES.default;
}

interface Props {
  selectedCrop: string | null;
  onCropChange: (c: string | null) => void;
}

export default function Finder({ selectedCrop, onCropChange }: Props) {
  const [query, setQuery] = useState("");
  const [loc, setLoc] = useState<UserLoc | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const crop = selectedCrop;
  const setCrop = onCropChange;
  const [kind, setKind] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(500);
  const [pickingNow, setPickingNow] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Leaflet map
  useEffect(() => {
    let map: any;
    let layer: any;
    let cancelled = false;

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([L]) => {
      if (cancelled) return;
      const el = document.getElementById("finder-map");
      if (!el || (el as any)._leaflet_id) return;

      map = L.map(el, { scrollWheelZoom: false }).setView([35.5, -79.5], 7);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 18,
      }).addTo(map);
      layer = L.layerGroup().addTo(map);
      (window as any).__finderMap = { map, layer, L };
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      const ref = (window as any).__finderMap;
      if (ref?.map) {
        ref.map.remove();
        (window as any).__finderMap = null;
      }
    };
  }, []);

  const filtered = useMemo(() => {
    let out = listings.filter((l) => {
      if (crop && !(l.crops ?? []).some((c) => c.name === crop)) return false;
      if (kind && l.kind !== kind) return false;
      if (pickingNow && !(l.crops ?? []).some((c) => c.status !== "listed")) return false;
      return true;
    });

    const withDistance = out.map((l) => {
      if (loc && l.lat != null && l.lon != null) {
        const d = haversineMiles(loc.lat, loc.lon, l.lat, l.lon);
        return { ...l, distance: Math.round(d) };
      }
      return { ...l, distance: undefined as number | undefined };
    });

    if (loc) {
      const exact = withDistance.filter(
        (l) => l.distance != null && l.distance <= radius
      );
      const approx = withDistance.filter((l) => l.distance == null);
      exact.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      return { exact, approx, total: out.length };
    }
    return { exact: withDistance, approx: [] as typeof withDistance, total: out.length };
  }, [loc, crop, kind, radius, pickingNow]);

  // repaint markers
  useEffect(() => {
    const ref = (window as any).__finderMap;
    if (!ref) return;
    const { map, layer, L } = ref;
    layer.clearLayers();

    const bounds: [number, number][] = [];
    filtered.exact.slice(0, 60).forEach((l) => {
      if (l.lat == null || l.lon == null) return;
      const isPeak = (l.crops ?? []).some((c) => c.status === "peak");
      const marker = L.circleMarker([l.lat, l.lon], {
        radius: isPeak ? 8 : 6,
        color: isPeak ? "#c4632c" : "#2e4f3e",
        weight: 2,
        fillColor: isPeak ? "#e3a63b" : "#7d8b6f",
        fillOpacity: 0.85,
      });
      marker.bindTooltip(
        `${l.name} — ${l.town}${l.distance != null ? ` · ${l.distance} mi` : ""}`
      );
      marker.addTo(layer);
      bounds.push([l.lat, l.lon]);
    });

    if (loc) {
      L.circleMarker([loc.lat, loc.lon], {
        radius: 9,
        color: "#c4632c",
        weight: 3,
        fillColor: "#c4632c",
        fillOpacity: 0.9,
      })
        .bindTooltip(`You — ${loc.label}`)
        .addTo(layer);
      L.circle([loc.lat, loc.lon], {
        radius: radius * 1609.34,
        color: "#c4632c",
        weight: 1.5,
        dashArray: "6 6",
        fill: false,
      }).addTo(layer);
      map.fitBounds(
        L.latLngBounds([[loc.lat, loc.lon], ...bounds]).pad(0.25),
        { maxZoom: 9 }
      );
    } else if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds).pad(0.15), { maxZoom: 7 });
    }
  }, [filtered, loc, radius, mapReady]);

  const resolve = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setNotice(null);

    const zip = q.match(/\b(\d{5})\b/);
    if (zip) {
      const zip3 = zip[1].slice(0, 3);
      const anchor = zip3Anchors[zip3];
      if (anchor) {
        setLoc({ ...anchor, label: `ZIP ${zip[1]} (approx.)`, zip3 });
        return;
      }
      setNotice({
        kind: "zip3-refused",
        message: `We can't reliably place ZIP ${zip[1]} — its prefix's listings don't agree on a location, so we'd rather say so than send you to the wrong place. Try a nearby town instead.`,
      });
      return;
    }

    const town = townAnchors.find((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    if (town) {
      setLoc({ ...town, label: town.name });
      return;
    }
    setNotice({
      kind: "no-match",
      message: `Hmm — "${q}" isn't in our North Carolina anchors yet. Try a town like Raleigh or Asheville, or a 5-digit ZIP.`,
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setNotice({ kind: "no-match", message: "Your browser doesn't share location. Type a town or ZIP instead." });
      return;
    }
    setGeoBusy(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: "your location" });
        setGeoBusy(false);
      },
      () => {
        setNotice({ kind: "no-match", message: "Couldn't get your location — type a town or ZIP instead." });
        setGeoBusy(false);
      },
      { timeout: 8000 }
    );
  };

  // Expose the resolver so the hero's "Use my location" can drive the finder
  useEffect(() => {
    (window as any).__finderLocate = useMyLocation;
    return () => {
      (window as any).__finderLocate = null;
    };
  });

  const anyFilter = crop || kind || pickingNow;

  return (
    <section id="finder" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember">
          The finder
        </p>
        <h2 className="mt-2 font-display text-4xl font-medium tracking-tight text-pine-deep">
          Places to pick, sorted by how close they are
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-ink/65">
          Not an alphabetical list. Set a location and everything below reorders by distance.{" "}
          <strong className="font-semibold text-pine-deep">
            Crops are only confirmed for some places
          </strong>{" "}
          — those say so plainly instead of pretending.
        </p>
      </div>

      {/* Location bar */}
      <div className="mt-8 rounded-3xl bg-pine-deep p-6 md:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resolve(query);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-cream p-2 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-harvest">
            <MapPin className="ml-2 size-5 shrink-0 text-ember" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Town or ZIP in North Carolina — e.g. Raleigh or 27601"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-ember px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-ember-deep"
          >
            Sort by distance
          </button>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoBusy}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-cream/40 px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
          >
            <Navigation className="size-4" />
            {geoBusy ? "Locating…" : "Use my location"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-cream/50">Or try:</span>
          {["Raleigh", "Asheville", "Charlotte", "Wilmington"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setQuery(t);
                resolve(t);
              }}
              className="rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream/85 transition-colors hover:bg-cream/20"
            >
              {t}
            </button>
          ))}
          {loc && (
            <span className="ml-auto flex items-center gap-2 rounded-full bg-harvest/20 px-3 py-1.5 text-xs font-semibold text-harvest">
              <MapPin className="size-3.5" />
              Near {loc.label}
              <button onClick={() => setLoc(null)} aria-label="Clear location">
                <X className="size-3.5" />
              </button>
            </span>
          )}
        </div>

        <AnimatePresence>
          {notice && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f3dfae]/15 p-4 text-sm leading-relaxed text-[#f3dfae]"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {notice.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={crop ?? ""}
          onChange={(e) => setCrop(e.target.value || null)}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-pine ring-1 ring-ink/10 outline-none"
        >
          <option value="">Crop — any</option>
          {cropOptions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={kind ?? ""}
          onChange={(e) => setKind(e.target.value || null)}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-pine ring-1 ring-ink/10 outline-none"
        >
          <option value="">Kind of place — any</option>
          {kindOptions.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-pine ring-1 ring-ink/10 outline-none"
        >
          {radiusOptions.map((r) => (
            <option key={r} value={r}>
              Within {r === 500 ? "500 mi (statewide)" : `${r} mi`}
            </option>
          ))}
        </select>
        <button
          onClick={() => setPickingNow(!pickingNow)}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            pickingNow
              ? "bg-pine text-cream"
              : "bg-white text-pine ring-1 ring-ink/10 hover:bg-cream-deep"
          }`}
        >
          Picking right now
        </button>
        {anyFilter && (
          <button
            onClick={() => {
              setCrop(null);
              setKind(null);
              setPickingNow(false);
            }}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-ember underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results + map */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-3 text-sm font-medium text-ink/60">
            {loc ? (
              <>
                <strong className="text-pine-deep">{filtered.exact.length}</strong> places within{" "}
                {radius === 500 ? "the state" : `${radius} miles`}
                {filtered.approx.length > 0 && (
                  <>
                    {" "}· <strong className="text-pine-deep">{filtered.approx.length}</strong>{" "}
                    known only to state level
                  </>
                )}
              </>
            ) : (
              <>
                <strong className="text-pine-deep">{filtered.total}</strong> places — set a
                location above to sort by distance
              </>
            )}
          </p>

          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.exact.slice(0, 12).map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-ink/5 transition-shadow hover:shadow-[0_10px_28px_rgba(46,79,62,0.12)]"
                >
                  <img
                    src={cropImage(l)}
                    alt=""
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold leading-snug text-pine-deep">
                      {l.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/60">
                      <MapPin className="size-3.5 text-ember" />
                      {l.town}, {l.state}
                      {l.distance != null && (
                        <span className="font-semibold text-pine">· {l.distance} mi</span>
                      )}
                      <span className="text-ink/40">· {l.kind}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {l.crops ? (
                        l.crops.map((c) => (
                          <span
                            key={c.name}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              c.status === "peak"
                                ? "bg-[#f3dfae] text-[#8a5a12]"
                                : c.status === "now"
                                  ? "bg-[#e3ecd9] text-[#4a6b35]"
                                  : "bg-cream-deep text-ink/60"
                            }`}
                          >
                            {c.name}
                            {c.status === "peak" ? " · peak" : c.status === "now" ? " · now" : ""}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-medium text-ink/55">
                          Crops unknown — help us fill this in
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.approx.length > 0 && loc && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
                Known only to state level — no reliable coordinates
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {filtered.approx.slice(0, 6).map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl bg-cream-deep p-3.5 ring-1 ring-dashed ring-ink/15"
                  >
                    <p className="font-display text-base font-semibold text-pine-deep">{l.name}</p>
                    <p className="text-sm text-ink/55">
                      {l.town}, {l.state} · crops unknown
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div
            id="finder-map"
            className="h-96 w-full overflow-hidden rounded-3xl ring-1 ring-ink/10 lg:h-[34rem]"
          />
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-ink/60">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-[#e3a63b] ring-2 ring-[#c4632c]" />
              At peak this week
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-[#7d8b6f] ring-2 ring-[#2e4f3e]" />
              Crops confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full border-2 border-dashed border-ink/40" />
              Approximate — state only
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/45">
            Season is estimated from growing zone, not confirmed by the farms — always call
            ahead. Sample shows North Carolina; the full finder covers all 51 states.
          </p>
        </div>
      </div>
    </section>
  );
}
