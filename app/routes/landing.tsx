import { CallToAction } from "~/components/landing/call-to-action";
import Products from "../components/landing/products";
import Problem from "../components/landing/problem";
import Hero from "~/components/landing/hero";
import { DarkBentoSection } from "~/components/landing/bento-section";
import FrequentlyAskedQuestions from "~/components/landing/faq";
import { Steps } from "~/components/landing/steps";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Section 1: Problem Section */}
      <Problem />

      {/* Section 2: The solution */}
      <Products />

      {/* Section 3: Steps Section */}
      <Steps />

      {/* Section 4: USDU - The Stablecoin That Powers It All */}
      <DarkBentoSection />

      {/* Section 5: FAQ */}
      <FrequentlyAskedQuestions />

      {/* Section 6: Get Started */}
      <CallToAction />
    </div>
  );
}
