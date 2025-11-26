import { BentoCard } from "~/components/landing/bento-card";
import { Heading, Subheading } from "~/components/landing/text";
import { Container } from "./container";

export function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-4xl bg-[#001B40] py-24">
      <Container>
        <Subheading dark>USDU - The Stablecoin That Powers It All</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Bitcoin-backed, uncensorable, productive.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Backed by Bitcoin"
            title="Backed by Bitcoin, not banks"
            description="Every USDU is overcollateralized by Bitcoin and redeemable for $1 of BTC. No fiat, no banks, no trust required."
            graphic={
              <div className="absolute inset-0 bg-[url(/illustrations/banks.png)] bg-cover bg-center bg-no-repeat" />
            }
            fade={["top"]}
            className="max-lg:rounded-t-4xl lg:col-span-4 lg:rounded-tl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Uncensorable"
            title="Can't be frozen"
            description="No blacklists, no admin keys, no centralized control. Unlike USDC or USDT, your USDU can never be frozen."
            graphic={
              <div className="absolute inset-0 bg-[url(/illustrations/freeze.png)] bg-cover bg-center bg-no-repeat" />
            }
            className="lg:col-span-2 lg:rounded-tr-4xl"
          />
          <BentoCard
            dark
            eyebrow="Yield"
            title="Earn real yield"
            description="Deposit in the Stability Pool and earn APY from borrower interest. Sustainable yield from actual economic activity."
            graphic={
              <div className="absolute inset-0 bg-[url(/illustrations/yield.png)] bg-cover bg-center bg-no-repeat" />
            }
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Peg"
            title="Always redeemable"
            description="USDU is hard-pegged to $1. You can always redeem 1 USDU for $1 worth of Bitcoin directly from the protocol."
            graphic={
              <div className="absolute inset-0 bg-[url(/illustrations/pegged.png)] bg-cover bg-center bg-no-repeat" />
            }
            fade={["top"]}
            className="max-lg:rounded-b-4xl lg:col-span-4 lg:rounded-br-4xl"
          />
        </div>
      </Container>
    </div>
  );
}
