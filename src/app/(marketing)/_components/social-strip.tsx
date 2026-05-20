import { Star } from "lucide-react";

export function SocialStrip() {
  return (
    <section className="border-y border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="flex items-center -space-x-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={18}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="ml-1.5">
              Built for builders running 3–30 active jobs.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span>Flippers</span>
            <span className="hidden sm:inline">·</span>
            <span>Small GCs</span>
            <span className="hidden sm:inline">·</span>
            <span>BRRRR investors</span>
            <span className="hidden sm:inline">·</span>
            <span>Remodelers</span>
            <span className="hidden sm:inline">·</span>
            <span>Handymen scaling up</span>
          </div>
        </div>
      </div>
    </section>
  );
}
