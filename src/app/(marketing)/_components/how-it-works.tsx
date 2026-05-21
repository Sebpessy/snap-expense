"use client";

import { Camera, Tag } from "lucide-react";
import { FlowSnap, FlowTag } from "./illustrations";
import { Stagger, StaggerItem } from "./motion/stagger";

const STEPS = [
  {
    n: "01",
    icon: Camera,
    illustration: FlowSnap,
    title: "Snap",
    body: "Open the app, take a photo of the receipt. AI pulls the vendor, total, date, tax category, and even the last 4 of your card — automatically.",
  },
  {
    n: "02",
    icon: Tag,
    illustration: FlowTag,
    title: "Tag",
    body: "Everything is already filled in. You just confirm the project or client and tap save. 2 seconds, done.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
            How it works
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            From phone to tax-ready in two steps.
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block"
          />
          <Stagger
            className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-6 lg:gap-10"
            stagger={0.15}
          >
            {STEPS.map((s) => (
              <StaggerItem
                key={s.n}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <s.illustration className="w-full" />
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-200 sm:mb-5 sm:h-12 sm:w-12 sm:rounded-2xl lg:h-14 lg:w-14">
                    <s.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-[26px] lg:w-[26px]" strokeWidth={2} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-500 sm:text-xs">
                    Step {s.n}
                  </div>
                  <h3 className="mt-1 text-lg font-extrabold text-gray-900 sm:text-xl lg:text-2xl">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:mt-3 sm:text-[15px]">
                    {s.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-base font-semibold text-amber-900">
            Average user logs 47 expenses a month in under 2 minutes total.
          </p>
          <p className="mt-1 text-sm text-amber-800/80">
            (vs. ~3 hours wrestling QuickBooks at month-end)
          </p>
        </div>
      </div>
    </section>
  );
}
