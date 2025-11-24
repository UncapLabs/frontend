import { LogoCluster } from "~/components/landing/logo-cluster";
import { Map } from "~/components/landing/map";
import { Keyboard } from "~/components/landing/keyboard";
import { Heading, Subheading } from "~/components/landing/text";
import { Container } from "./container";

import { clsx } from "clsx";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

function Card({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{
        idle: { scale: 1, y: 0, rotateX: 0, rotateY: 0 },
        active: { scale: 1.02, y: -8, rotateX: 2, rotateY: 2 },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-lg",
        "bg-white shadow-xs ring-1 ring-black/5",
        "data-dark:bg-gray-800 data-dark:ring-white/15"
      )}
      style={{ perspective: 1000 }}
    >
      <div className="relative h-80 shrink-0">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-linear-to-b from-white to-50% group-data-dark:from-gray-800 group-data-dark:from-[-25%]" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-linear-to-t from-white to-50% group-data-dark:from-gray-800 group-data-dark:from-[-25%]" />
        )}
      </div>
      <div className="relative p-10">
        <Subheading as="h3" dark={dark}>
          {eyebrow}
        </Subheading>
        <p className="mt-1 text-2xl/8 font-medium tracking-tight text-gray-950 group-data-dark:text-white">
          {title}
        </p>
        <p className="mt-2 max-w-[600px] text-sm/6 text-gray-600 group-data-dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function Steps() {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  return (
    <div className="bg-linear-to-b from-white from-50% to-gray-100 py-32">
      <Container>
        <Subheading>How it works</Subheading>
        <Heading as="h3" className="mt-2 max-w-3xl">
          Borrow at the Lowest Rates in Four Steps
        </Heading>

        <div className="mt-10 sm:mt-16 overflow-hidden">
          <motion.div
            ref={carousel}
            drag="x"
            dragElastic={0.2}
            dragConstraints={{ right: 0, left: -width }}
            dragTransition={{ bounceDamping: 30 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex gap-4 will-change-transform cursor-grab active:cursor-grabbing"
          >
            <Card
              eyebrow="Step 1"
              title="Deposit Your Bitcoin"
              description="Connect your wallet and deposit WBTC as collateral. Your Bitcoin stays under your control—no custody, no rehypothecation."
              graphic={
                <div className="h-80 bg-[url(/screenshots/profile.png)] bg-size-[1000px_560px] bg-position-[left_-109px_top_-112px] bg-no-repeat" />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 2"
              title="Choose How Much to Borrow"
              description="Decide how much USDU to mint against your Bitcoin. Borrow what you need while maintaining a safe collateral ratio."
              graphic={
                <div className="absolute inset-0 bg-[url(/screenshots/competitors.png)] bg-size-[1100px_650px] bg-position-[left_-38px_top_-73px] bg-no-repeat" />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 3"
              title="Set Your Own Interest Rate"
              description="Choose the rate you want to pay—starting from 0.5%. Lower rates mean cheaper borrowing. This is what makes Uncap the lowest-cost way to borrow against Bitcoin."
              graphic={
                <div className="flex size-full pt-10 pl-10">
                  <Keyboard highlighted={["LeftCommand", "LeftShift", "D"]} />
                </div>
              }
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 4"
              title="Repay Anytime"
              description="Use USDU however you want—swap it to USDC, use it in DeFi, or hold it. When you're ready, repay your loan and get your Bitcoin back."
              graphic={<LogoCluster />}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
