import { ArrowRight } from "lucide-react";
import growers from "@/assets/growers.jpg";

export default function Growers() {
  return (
    <section id="growers" className="mx-auto max-w-6xl px-5 pb-20">
      <div className="grid items-center gap-10 overflow-hidden rounded-[2.5rem] bg-pine md:grid-cols-2">
        <div className="p-10 md:p-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-harvest">
            For growers
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-cream">
            Grow it? Put your farm on the map.
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-cream/75">
            List your stand, keep your harvest current, and let neighbours find you when your
            fruit is at its peak. Free for small farms, forever.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#top"
              className="group flex items-center gap-2 rounded-full bg-ember px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-ember-deep"
            >
              List your farm
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#guides"
              className="rounded-full px-6 py-3.5 text-sm font-semibold text-cream ring-1 ring-cream/30 transition-colors hover:bg-cream/10"
            >
              How it works
            </a>
          </div>
        </div>
        <div className="relative h-full min-h-72">
          <img
            src={growers}
            alt="Two growers gathering fruit in an orchard"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
