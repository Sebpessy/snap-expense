"use client";

import { Inbox, TrendingDown, FileWarning } from "lucide-react";
import { PainReceipts, PainProjects, Pain1099 } from "./illustrations";
import { Stagger, StaggerItem } from "./motion/stagger";

const PAINS = [
  {
    icon: Inbox,
    illustration: PainReceipts,
    title: "Shoebox at tax time",
    body: "Faded paper receipts. Glove-box, junk-drawer, or that pile in your bag. April CPA bill that doubles because they have to sort it for you.",
  },
  {
    icon: TrendingDown,
    illustration: PainProjects,
    title: "No clue which project is bleeding",
    body: "You can see the bank balance, but not which of your projects or clients is eating the most. Until it's too late and the margin's gone.",
  },
  {
    icon: FileWarning,
    illustration: Pain1099,
    title: "1099s become a fire drill",
    body: "January hits. Now you're scrolling Venmo, Zelle, and your card statements trying to remember everyone you paid more than $600.",
  },
];

export function ProblemBlock() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-red-600">
            The self-employed tax-prep tax
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            You're already paying for this — just not in cash.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Every independent worker has the same three problems. Most just
            learned to live with them.
          </p>
        </div>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {PAINS.map((p) => (
            <StaggerItem
              key={p.title}
              className="rounded-2xl border border-red-100 bg-red-50/40 p-6"
            >
              <p.illustration className="mb-4 h-32 w-full" />
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <p.icon size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                {p.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
