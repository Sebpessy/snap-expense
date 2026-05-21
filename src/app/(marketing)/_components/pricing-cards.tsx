import { getActivePlans } from "@/lib/plans";
import { PricingCardsClient } from "./pricing-cards-client";

export async function PricingCards() {
  const plans = await getActivePlans();
  const order: Record<string, number> = { free: 0, pro: 1, business: 2 };
  const sorted = [...plans].sort(
    (a, b) => (order[a.code] ?? 99) - (order[b.code] ?? 99),
  );

  return (
    <section id="pricing" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
            Pricing
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Free for 30 days. Then less than your monthly coffee.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            No credit card to start. No auto-charge surprise. Cancel any time
            and your data stays exportable.
          </p>
        </div>

        <PricingCardsClient plans={sorted} />
      </div>
    </section>
  );
}
