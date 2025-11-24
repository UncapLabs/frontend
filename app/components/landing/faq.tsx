import { Container } from "./container";
import { Heading, Subheading } from "./text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export default function FrequentlyAskedQuestions() {
  return (
    <div className="py-32">
      <Container>
        <section id="faqs" className="scroll-mt-8">
          <Subheading className="text-center">
            Frequently asked questions
          </Subheading>
          <Heading as="div" className="mt-2 text-center text-[#001B40]">
            Your questions answered.
          </Heading>
          <div className="mx-auto mt-16 mb-32 max-w-4xl">
            <Accordion type="single" collapsible className="w-full space-y-6">
              <AccordionItem
                value="item-1"
                className="border-none rounded-3xl bg-gray-50 px-8"
              >
                <AccordionTrigger className="text-xl font-medium text-[#001B40] font-sora hover:no-underline py-6">
                  Is my Bitcoin safe? What are the risks?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#001B40]/80 font-sora pb-8">
                  Your Bitcoin is never rehypothecated or lent out—it stays in
                  the protocol as your collateral. The main risks are:
                  liquidation if Bitcoin price drops significantly, and smart
                  contract risk (though Uncap is built on battle-tested Liquity
                  v2 architecture). You maintain full control and can verify all
                  collateral on-chain at any time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border-none rounded-3xl bg-gray-50 px-8"
              >
                <AccordionTrigger className="text-xl font-medium text-[#001B40] font-sora hover:no-underline py-6">
                  How does USDU maintain its $1 peg?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#001B40]/80 font-sora pb-8">
                  USDU maintains its peg through redemptions. Anyone can always
                  redeem 1 USDU for $1 worth of Bitcoin. If USDU trades below
                  $1, arbitrageurs buy it and redeem for $1 of BTC, pushing the
                  price back up. If it trades above $1, borrowers can mint new
                  USDU and sell it for profit. This mechanism keeps USDU stable
                  without algorithms or centralized intervention.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border-none rounded-3xl bg-gray-50 px-8"
              >
                <AccordionTrigger className="text-xl font-medium text-[#001B40] font-sora hover:no-underline py-6">
                  How is Uncap different from other Bitcoin lending platforms?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#001B40]/80 font-sora pb-8">
                  Unlike custodial lenders (Celsius, BlockFi), you keep full
                  control of your Bitcoin. Unlike other DeFi protocols where
                  committees or algorithms set rates, YOU choose your own
                  interest rate. This creates the lowest rates in DeFi. Uncap is
                  also 100% transparent—every transaction is on-chain and
                  verifiable.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="border-none rounded-3xl bg-gray-50 px-8"
              >
                <AccordionTrigger className="text-xl font-medium text-[#001B40] font-sora hover:no-underline py-6">
                  Why should I trust USDU over USDC or USDT?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#001B40]/80 font-sora pb-8">
                  USDC and USDT are backed by fiat in bank accounts and
                  controlled by centralized companies that can freeze your
                  funds. USDU is overcollateralized by Bitcoin, fully
                  decentralized, and cannot be frozen or censored. There are no
                  admin keys, no blacklists, and you can always verify the
                  collateral backing USDU on-chain.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border-none rounded-3xl bg-gray-50 px-8"
              >
                <AccordionTrigger className="text-xl font-medium text-[#001B40] font-sora hover:no-underline py-6">
                  Why is Uncap built on Starknet?
                </AccordionTrigger>
                <AccordionContent className="text-lg text-[#001B40]/80 font-sora pb-8">
                  Starknet provides the scalability and security needed for a
                  Bitcoin DeFi protocol. It offers low transaction costs, high
                  throughput, and advanced cryptographic proofs. Uncap is built
                  using Cairo, optimized specifically for Starknet's
                  architecture, ensuring efficient and secure operations.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </Container>
    </div>
  );
}
