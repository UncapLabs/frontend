import { Link } from "react-router";
import { Container } from "./container";
import { Subheading } from "./text";

function CTAs() {
  return (
    <div className="relative pt-20 pb-16 text-center sm:py-24">
      <hgroup>
        <Subheading className="text-blue-200">Get started</Subheading>
        <p className="mt-6 text-3xl font-medium tracking-tight text-white sm:text-5xl font-sora">
          Ready to Get Started?
        </p>
      </hgroup>
      <p className="mx-auto mt-6 max-w-xs text-sm/6 text-blue-100">
        Unlock liquidity at the lowest rates in DeFi or earn real yield with
        USDU.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/borrow"
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0051bf] transition-all hover:bg-blue-50 hover:scale-105 focus-visible:outline-white shadow-lg shadow-black/10"
        >
          Start Borrowing <span aria-hidden="true">→</span>
        </Link>
        <Link
          to="/#usdu-section"
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-[#FF9300] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-orange-500 hover:scale-105 focus-visible:outline-orange-500 shadow-lg shadow-black/10"
        >
          Get USDU <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function CallToAction() {
  return (
    <div className="relative py-16">
      <div className="absolute inset-2 rounded-4xl bg-[#0051bf]" />
      <Container>
        <CTAs />
      </Container>
    </div>
  );
}
