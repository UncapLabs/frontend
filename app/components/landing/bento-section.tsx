import { LogoCluster } from "~/components/landing/logo-cluster";
import { LogoTimeline } from "~/components/landing/logo-timeline";
import { Map } from "~/components/landing/map";
import { Keyboard } from "~/components/landing/keyboard";
import { LinkedAvatars } from "~/components/landing/linked-avatars";
import { BentoCard } from "~/components/landing/bento-card";
import { Heading, Subheading } from "~/components/landing/text";
import { Container } from "./container";

export function BentoSection() {
  return (
    <div className="bg-linear-to-b from-white from-50% to-gray-100 py-32">
      <Container>
        <Subheading>USDU - The Stablecoin That Powers It All</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          Bitcoin-Backed, Uncensorable, Productive.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            eyebrow="Insight"
            title="Get perfect clarity"
            description="Radiant uses social engineering to build a detailed financial picture of your leads. Know their budget, compensation package, social security number, and more."
            graphic={
              <div className="h-80 bg-[url(/screenshots/profile.png)] bg-size-[1000px_560px] bg-position-[left_-109px_top_-112px] bg-no-repeat" />
            }
            fade={["bottom"]}
            className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
          />
          <BentoCard
            eyebrow="Analysis"
            title="Undercut your competitors"
            description="With our advanced data mining, you’ll know which companies your leads are talking to and exactly how much they’re being charged."
            graphic={
              <div className="absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-size-[1100px_650px] bg-position-[left_-38px_top_-73px] bg-no-repeat" />
            }
            fade={["bottom"]}
            className="lg:col-span-3 lg:rounded-tr-4xl"
          />
          <BentoCard
            eyebrow="Speed"
            title="Built for power users"
            description="It’s never been faster to cold email your entire contact list using our streamlined keyboard shortcuts."
            graphic={
              <div className="flex size-full pt-10 pl-10">
                <Keyboard highlighted={["LeftCommand", "LeftShift", "D"]} />
              </div>
            }
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            eyebrow="Source"
            title="Get the furthest reach"
            description="Bypass those inconvenient privacy laws to source leads from the most unexpected places."
            graphic={<LogoCluster />}
            className="lg:col-span-2"
          />
          <BentoCard
            eyebrow="Limitless"
            title="Sell globally"
            description="Radiant helps you sell in locations currently under international embargo."
            graphic={<Map />}
            className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
          />
        </div>
      </Container>
    </div>
  );
}

export function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-4xl bg-gray-900 py-32">
      <Container>
        <Subheading dark>USDU - The Stablecoin That Powers It All</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Bitcoin-Backed, Uncensorable, Productive.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Backed by Bitcoin"
            title="Backed by Bitcoin, Not Banks"
            description="Every USDU is overcollateralized by Bitcoin and redeemable for $1 of BTC. No fiat, no banks, no trust required."
            graphic={
              <div className="h-80 bg-[url(/screenshots/networking.png)] bg-size-[851px_344px] bg-no-repeat" />
            }
            fade={["top"]}
            className="max-lg:rounded-t-4xl lg:col-span-4 lg:rounded-tl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Uncensorable"
            title="Can't Be Frozen"
            description="No blacklists, no admin keys, no centralized control. Unlike USDC or USDT, your USDU can never be frozen."
            graphic={<LogoTimeline />}
            // `overflow-visible!` is needed to work around a Chrome bug that disables the mask on the graphic.
            className="z-10 overflow-visible! lg:col-span-2 lg:rounded-tr-4xl"
          />
          <BentoCard
            dark
            eyebrow="Yield"
            title="Earn Real Yield"
            description="Deposit in the Stability Pool and earn APY from borrower interest. Sustainable yield from actual economic activity."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Peg"
            title="Always Redeemable"
            description="USDU is hard-pegged to $1. You can always redeem 1 USDU for $1 worth of Bitcoin directly from the protocol."
            graphic={
              <div className="h-80 bg-[url(/screenshots/engagement.png)] bg-size-[851px_344px] bg-no-repeat" />
            }
            fade={["top"]}
            className="max-lg:rounded-b-4xl lg:col-span-4 lg:rounded-br-4xl"
          />
        </div>
      </Container>
    </div>
  );
}
