import { Link } from "react-router";
import { Container } from "./container";
import { Gradient } from "./gradient";
import { Subheading } from "./text";

function CTAs() {
  return (
    <div className="relative pt-20 pb-16 text-center sm:py-24">
      <hgroup>
        <Subheading>Get started</Subheading>
        <p className="mt-6 text-3xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Ready to Get Started?
        </p>
      </hgroup>
      <p className="mx-auto mt-6 max-w-xs text-sm/6 text-gray-500">
        Unlock liquidity at the lowest rates in DeFi or earn real yield with
        USDU.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/borrow"
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-orange-500 hover:scale-105 focus-visible:outline-orange-600 shadow-lg shadow-orange-600/20"
        >
          Start Borrowing <span aria-hidden="true">→</span>
        </Link>
        <Link
          to="/#usdu-section"
          className="inline-flex w-full sm:w-64 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-500 hover:scale-105 focus-visible:outline-blue-600 shadow-lg shadow-blue-600/20"
        >
          Get USDU <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export function CallToAction() {
  return (
    <>
      <Gradient className="relative">
        <div className="absolute inset-2 rounded-4xl bg-white/80" />
        <Container>
          <CTAs />
        </Container>
      </Gradient>
    </>
  );
}
