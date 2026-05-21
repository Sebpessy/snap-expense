import { Star } from "lucide-react";
import { Marquee } from "./motion/marquee";

const PROFESSIONS = [
  "Freelancers",
  "Consultants",
  "Contractors",
  "Agencies",
  "Small businesses",
  "Photographers",
  "Designers",
  "Writers",
  "Coaches",
  "E-commerce sellers",
  "Trades",
  "Realtors",
];

export function SocialStrip() {
  return (
    <section className="border-y border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
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
            Built for people who run their own work.
          </span>
        </div>

        <Marquee duration={40}>
          {PROFESSIONS.map((p) => (
            <span
              key={p}
              className="text-[11px] font-bold uppercase tracking-widest text-gray-400"
            >
              {p}
              <span aria-hidden className="ml-8 sm:ml-12 text-gray-300">
                ·
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
