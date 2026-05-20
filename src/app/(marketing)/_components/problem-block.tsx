import { Inbox, TrendingDown, FileWarning } from "lucide-react";

const PAINS = [
  {
    icon: Inbox,
    title: "Shoebox at tax time",
    body: "Faded thermal receipts. Glove-box pile. April CPA bill that doubles because they have to sort it for you.",
  },
  {
    icon: TrendingDown,
    title: "No clue which job is bleeding",
    body: "You can see the bank balance, but not which of your 4 active projects is eating the most. Until it's too late.",
  },
  {
    icon: FileWarning,
    title: "1099s become a fire drill",
    body: "January hits. Now you're scrolling Venmo and your check register trying to remember what you paid each sub.",
  },
];

export function ProblemBlock() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-red-600">
            The builder tax-prep tax
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            You're already paying for this — just not in cash.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Every builder has the same three problems. Most just learned to live
            with them.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PAINS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-red-100 bg-red-50/40 p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <p.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
