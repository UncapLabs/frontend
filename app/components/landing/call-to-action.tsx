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
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-[#FFFBF5] px-8 py-4 text-base font-semibold text-[#003680] transition-all hover:bg-white hover:scale-105 focus-visible:outline-white shadow-lg shadow-black/10"
        >
          Start Borrowing <span aria-hidden="true">→</span>
        </Link>
        <Link
          to="/earn"
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600 px-8 py-4 text-base font-semibold text-white transition-all hover:scale-105 shadow-lg shadow-black/10"
        >
          Start Earning <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function CallToAction() {
  return (
    <div className="relative py-16">
      <div className="absolute inset-2 rounded-4xl bg-[#003680]" />
      <Container>
        <CTAs />
      </Container>
    </div>
  );
}
