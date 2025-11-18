import { CallToAction } from "~/components/landing/call-to-action";
import Pricing from "./landing/pricing";
import Company from "./landing/company";
import HeroSection from "./landing/hero";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <Pricing />
      <Company />
      <CallToAction />
    </div>
  );
}
