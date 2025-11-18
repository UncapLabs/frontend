import { LogoCluster } from "~/components/landing/logo-cluster";
import { LogoTimeline } from "~/components/landing/logo-timeline";
import { Map } from "~/components/landing/map";
import { Screenshot } from "~/components/landing/screenshot";
import { Heading, Subheading } from "~/components/landing/text";
import { Gradient } from "~/components/landing/gradient";
import { Keyboard } from "~/components/landing/keyboard";
import { LinkedAvatars } from "~/components/landing/linked-avatars";
import { BentoCard } from "~/components/landing/bento-card";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/landing/container";
import { LogoCloud } from "~/components/landing/logo-cloud";

function Hero() {
  return (
    <div className="relative bg-[#F5F3EE] mb-10">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <div className="pt-24 pb-24 sm:pt-32 sm:pb-32 md:pt-40 md:pb-48 relative">
          {/* Floating Item Left - Hidden on mobile, visible on larger screens */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block -translate-x-12 xl:-translate-x-24 z-0">
            <img
              src="/coin_01.png"
              alt="Bitcoin Coin"
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain drop-shadow-2xl rotate-[-12deg] animate-float-slow opacity-90"
            />
            <img
              src="/wallet.png"
              alt="Wallet"
              className="absolute -bottom-24 -right-12 w-24 h-24 lg:w-28 lg:h-28 object-contain drop-shadow-xl rotate-[15deg] animate-float-delayed opacity-90"
            />
          </div>

          {/* Main Content Centered */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto z-10 relative">
            <h1 className="font-sora text-5xl/[1.1] font-medium tracking-tight text-balance text-[#242424] sm:text-7xl/[1.1] md:text-8xl/[1.1]">
              Finally, do more with your Bitcoin.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-normal font-sora text-neutral-600 sm:text-lg leading-normal">
              Borrow against your Bitcoin at rates as low as 0.5%—the cheapest
              in DeFi. You set the rate and keep full control of your Bitcoin.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
              <Button className="bg-[#3b82f6] hover:bg-blue-600 text-white font-sora rounded-xl h-12 px-8">
                Start Borrowing
              </Button>
              <Button
                variant="outline"
                className="border-neutral-200 bg-white hover:bg-neutral-50 text-[#242424] font-sora rounded-xl h-12 px-8"
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Floating Item Right - Hidden on mobile, visible on larger screens */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block translate-x-12 xl:translate-x-24 z-0">
            <img
              src="/coin_03.png"
              alt="USDU Coin"
              className="w-32 h-32 lg:w-48 lg:h-48 object-contain drop-shadow-2xl rotate-[12deg] animate-float-delayed"
            />
            <img
              src="/chart.png"
              alt="Chart Decorative"
              className="absolute -top-20 -left-16 w-24 h-24 lg:w-32 lg:h-32 object-contain drop-shadow-lg rotate-[-8deg] animate-float-slow opacity-80"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

function FeatureSection() {
  return (
    <div className="overflow-hidden">
      <Container className="pb-24">
        <Heading as="h2" className="max-w-3xl">
          A snapshot of your entire sales pipeline.
        </Heading>
        <Screenshot
          width={1216}
          height={768}
          src="/screenshots/app.png"
          className="mt-16 h-144 sm:h-auto sm:w-304"
        />
      </Container>
    </div>
  );
}

function BentoSection() {
  return (
    <Container>
      <Subheading>Sales</Subheading>
      <Heading as="h3" className="mt-2 max-w-3xl">
        Know more about your customers than they do.
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
  );
}

function DarkBentoSection() {
  return (
    <div className="mx-2 mt-2 rounded-4xl bg-gray-900 py-32">
      <Container>
        <Subheading dark>Outreach</Subheading>
        <Heading as="h3" dark className="mt-2 max-w-3xl">
          Customer outreach has never been easier.
        </Heading>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
          <BentoCard
            dark
            eyebrow="Networking"
            title="Sell at the speed of light"
            description="Our RadiantAI chat assistants analyze the sentiment of your conversations in real time, ensuring you're always one step ahead."
            graphic={
              <div className="h-80 bg-[url(/screenshots/networking.png)] bg-size-[851px_344px] bg-no-repeat" />
            }
            fade={["top"]}
            className="max-lg:rounded-t-4xl lg:col-span-4 lg:rounded-tl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Integrations"
            title="Meet leads where they are"
            description="With thousands of integrations, no one will be able to escape your cold outreach."
            graphic={<LogoTimeline />}
            // `overflow-visible!` is needed to work around a Chrome bug that disables the mask on the graphic.
            className="z-10 overflow-visible! lg:col-span-2 lg:rounded-tr-4xl"
          />
          <BentoCard
            dark
            eyebrow="Meetings"
            title="Smart call scheduling"
            description="Automatically insert intro calls into your leads' calendars without their consent."
            graphic={<LinkedAvatars />}
            className="lg:col-span-2 lg:rounded-bl-4xl"
          />
          <BentoCard
            dark
            eyebrow="Engagement"
            title="Become a thought leader"
            description="RadiantAI automatically writes LinkedIn posts that relate current events to B2B sales, helping you build a reputation as a thought leader."
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

export default function HeroSection() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>
        <div className="bg-linear-to-b from-white from-50% to-gray-100 py-32">
          <FeatureSection />
          <BentoSection />
        </div>
        <DarkBentoSection />
      </main>
    </div>
  );
}
