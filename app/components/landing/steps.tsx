import { Heading, Subheading } from "~/components/landing/text";
import { Container } from "./container";

import { clsx } from "clsx";
import { motion, useMotionValue, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useEventListener, useIntersectionObserver } from "usehooks-ts";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        <p className="mt-1 text-2xl/8 font-medium tracking-tight text-[#001B40] group-data-dark:text-white">
          {title}
        </p>
        <p className="mt-2 max-w-[600px] text-sm/6 text-[#001B40]/80 group-data-dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function Steps() {
  const [width, setWidth] = useState(0);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const carousel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  // Track position to update button states
  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      setIsAtStart(latest >= -10);
      setIsAtEnd(latest <= -width + 10);
    });
    return () => unsubscribe();
  }, [x, width]);

  const scroll = (direction: "left" | "right") => {
    if (!carousel.current) return;

    const firstCard = carousel.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth : 500;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    const currentX = x.get();
    let newX =
      direction === "left" ? currentX + scrollAmount : currentX - scrollAmount;

    // Clamp
    if (newX > 0) newX = 0;
    if (newX < -width) newX = -width;

    animate(x, newX, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  };

  // Track if section is in view
  const { isIntersecting, ref: containerRef } = useIntersectionObserver({
    threshold: 0.5, // At least 50% visible
  });

  // Keyboard navigation (arrow keys) when section is in view
  useEventListener("keydown", (e) => {
    if (!isIntersecting) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll("right");
    }
  });

  // Trackpad/wheel horizontal scrolling
  const carouselWheelRef = useRef<HTMLDivElement>(null!);
  useEventListener(
    "wheel",
    (e) => {
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      e.preventDefault();

      const currentX = x.get();
      let newX = currentX - delta;

      // Clamp
      if (newX > 0) newX = 0;
      if (newX < -width) newX = -width;

      x.set(newX);
    },
    carouselWheelRef,
    { passive: false }
  );

  return (
    <div
      id="how-it-works"
      ref={containerRef}
      className="bg-linear-to-b from-white from-50% to-gray-100 py-24">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Subheading>How it works</Subheading>
            <Heading as="h3" className="mt-2 max-w-3xl text-[#001B40]">
              Borrow at the lowest rates in four steps
            </Heading>
          </div>
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => scroll("left")}
              disabled={isAtStart}
              className={clsx(
                "group flex size-12 items-center justify-center rounded-full border bg-white transition-all focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                isAtStart
                  ? "border-gray-100 opacity-40 cursor-not-allowed"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              )}
              aria-label="Previous step"
            >
              <ChevronLeft
                className={clsx(
                  "size-6 transition-colors",
                  isAtStart ? "text-gray-400" : "text-gray-600 group-hover:text-gray-900"
                )}
              />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={isAtEnd}
              className={clsx(
                "group flex size-12 items-center justify-center rounded-full border bg-white transition-all focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                isAtEnd
                  ? "border-gray-100 opacity-40 cursor-not-allowed"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              )}
              aria-label="Next step"
            >
              <ChevronRight
                className={clsx(
                  "size-6 transition-colors",
                  isAtEnd ? "text-gray-400" : "text-gray-600 group-hover:text-gray-900"
                )}
              />
            </button>
          </div>
        </div>

        <div ref={carouselWheelRef} className="mt-10 overflow-hidden sm:mt-16">
          <motion.div
            ref={carousel}
            style={{ x }}
            drag="x"
            dragElastic={0.35}
            dragConstraints={{ right: 0, left: -width }}
            dragTransition={{
              bounceDamping: 18,
              bounceStiffness: 200,
              power: 0.3,
              timeConstant: 200,
            }}
            className="flex gap-4 will-change-transform cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <Card
              eyebrow="Step 1"
              title="Deposit Your Bitcoin"
              description="Connect your wallet and deposit WBTC as collateral. Your Bitcoin stays under your control. No custody, no rehypothecation."
              graphic={
                <img
                  src="/illustrations/step1.jpeg"
                  alt="Deposit Bitcoin"
                  className="size-full object-cover"
                />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 2"
              title="Choose How Much to Borrow"
              description="Decide how much USDU to mint against your Bitcoin. Borrow what you need while maintaining a safe collateral ratio."
              graphic={
                <img
                  src="/illustrations/step2.jpeg"
                  alt="Choose Borrow Amount"
                  className="size-full object-cover"
                />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 3"
              title="Set Your Own Interest Rate"
              description="Choose the rate you want to pay, starting from 0.5%. Lower rates mean cheaper borrowing. This is what makes Uncap the lowest-cost way to borrow against Bitcoin."
              graphic={
                <img
                  src="/illustrations/step3.jpeg"
                  alt="Set Interest Rate"
                  className="size-full object-cover"
                />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
            <Card
              eyebrow="Step 4"
              title="Repay Anytime"
              description="Use USDU however you want: swap it to USDC, use it in DeFi, or hold it. When you're ready, repay your loan and get your Bitcoin back."
              graphic={
                <img
                  src="/illustrations/step4.jpeg"
                  alt="Repay Anytime"
                  className="size-full object-cover"
                />
              }
              fade={["bottom"]}
              className="min-w-[400px] md:min-w-[500px] rounded-lg"
            />
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
