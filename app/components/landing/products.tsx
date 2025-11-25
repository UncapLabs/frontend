import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { Container } from "~/components/landing/container";
import { Gradient } from "~/components/landing/gradient";
import { Heading, Subheading } from "~/components/landing/text";

const products = [
  {
    name: "BORROW AGAINST YOUR BITCOIN",
    subheadline: "Set Your Own Interest Rate",
    description:
      "Deposit Bitcoin and borrow USDU at rates you control—from 0.5%. Your Bitcoin is never lent out or rehypothecated, so you maintain full ownership and get it back when you repay. Use your USDU however you want: swap to USDC for off-ramps, deploy in DeFi, or hold as stable value.",
    stats: [
      "Low Interest rates (from 0.5%)",
      "Tax-free liquidity without selling",
      "Non-custodial (Your keys, your coins)",
    ],
    cta: "Start Borrowing",
    href: "/borrow",
    image: "/illustrations/borrow.jpeg",
    theme: "orange",
  },
  {
    name: "USDU: STABLE DOLLARS YOU TRULY OWN",
    subheadline: "Bitcoin-Backed & Uncensorable",
    description:
      "Every USDU is backed by over $1 of Bitcoin, keeping it securely pegged 1:1 to USD. You can always redeem it for its full value—no questions asked. Unlike traditional stablecoins, your USDU can never be frozen, censored, or confiscated. True dollar stability with complete ownership.",
    stats: [
      "Backed by over-collateralized Bitcoin",
      "Censorship-resistant & decentralized",
      "Earn native yield from protocol revenue",
    ],
    cta: "Get USDU",
    href: "https://app.avnu.fi/en/usdc-usdu",
    image: "/illustrations/mirror.jpeg",
    theme: "blue",
  },
] as const;

function Header() {
  return (
    <Container className="mt-16">
      <Heading as="h1" className="text-center text-[#001B40]">
        Your Bitcoin, Your Way.
      </Heading>
    </Container>
  );
}

function ProductCards() {
  return (
    <div className="relative py-24">
      <Gradient className="absolute inset-x-2 top-48 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
}

function CheckIcon({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 18 14"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M1 6.76191L6.33333 12L17 1"
        stroke="currentColor"
        strokeWidth="2.25"
      />
    </svg>
  );
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const isOrange = product.theme === "orange";

  return (
    <div
      className={cn(
        "grid grid-cols-1 rounded-4xl p-2 shadow-md shadow-black/5",
        isOrange ? "bg-orange-50/50" : "bg-blue-50/50"
      )}
    >
      <div
        className={cn(
          "flex flex-col rounded-3xl shadow-2xl ring-1 overflow-hidden bg-white h-full",
          isOrange ? "ring-orange-100" : "ring-blue-100"
        )}
      >
        {/* Image Section - Top Half */}
        <div
          className={cn(
            "flex h-64 sm:h-80 w-full items-center justify-center overflow-hidden",
            isOrange ? "bg-orange-100/50" : "bg-blue-100/50"
          )}
        >
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transform transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Subheading
                className={cn(isOrange ? "text-orange-600" : "text-blue-600")}
              >
                {product.subheadline}
              </Subheading>
              <h3 className="mt-2 text-2xl font-medium text-[#001B40] font-sora">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 text-base/7 text-[#001B40]/80">
            {product.description}
          </p>

          {/* Stats Section */}
          <ul className="mt-6 space-y-3">
            {product.stats.map((stat) => (
              <li
                key={stat}
                className="flex items-start gap-3 text-sm/6 text-[#001B40] font-medium"
              >
                <CheckIcon
                  className={cn(
                    "h-4 w-auto flex-none mt-1",
                    isOrange ? "text-orange-600" : "text-blue-600"
                  )}
                />
                {stat}
              </li>
            ))}
          </ul>

          <div className="flex-1" />

          {/* CTA */}
          <div className="mt-8">
            <Link
              to={product.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors",
                isOrange
                  ? "bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600"
                  : "bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
              )}
            >
              {product.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <>
      <Header />
      <ProductCards />
    </>
  );
}
