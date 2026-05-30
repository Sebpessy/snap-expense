import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "./(marketing)/_components/marketing-nav";
import { Hero } from "./(marketing)/_components/hero";
import { DemoVideo } from "./(marketing)/_components/demo-video";
import { SocialStrip } from "./(marketing)/_components/social-strip";
import { ProblemBlock } from "./(marketing)/_components/problem-block";
import { FeatureGrid } from "./(marketing)/_components/feature-grid";
import { HowItWorks } from "./(marketing)/_components/how-it-works";
import { BuiltForIndependents } from "./(marketing)/_components/built-for-independents";
import { PricingCards } from "./(marketing)/_components/pricing-cards";
import { FAQ } from "./(marketing)/_components/faq";
import { CTABanner } from "./(marketing)/_components/cta-banner";
import { MarketingFooter } from "./(marketing)/_components/marketing-footer";
import { Reveal } from "./(marketing)/_components/motion/reveal";
import { VisitBeacon } from "./(marketing)/_components/visit-beacon";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/capture");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <VisitBeacon />
      <MarketingNav />
      {/* Hero handles its own motion internally (headline cascade + parallax) */}
      <Hero />
      <Reveal>
        <DemoVideo />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal y={16}>
        <SocialStrip />
      </Reveal>
      <Reveal>
        <ProblemBlock />
      </Reveal>
      <Reveal>
        <FeatureGrid />
      </Reveal>
      <Reveal>
        <BuiltForIndependents />
      </Reveal>
      <Reveal>
        <PricingCards />
      </Reveal>
      <Reveal>
        <FAQ />
      </Reveal>
      <Reveal>
        <CTABanner />
      </Reveal>
      <Reveal y={12}>
        <MarketingFooter />
      </Reveal>
    </main>
  );
}
