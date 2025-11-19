import { Container } from "~/components/landing/container";
import { Gradient } from "~/components/landing/gradient";
import { LogoCloud } from "~/components/landing/logo-cloud";
import { Heading, Lead, Subheading } from "~/components/landing/text";

const tiers = [
  {
    name: "Starter" as const,
    slug: "starter",
    description: "Everything you need to start selling.",
    priceMonthly: 99,
    href: "#",
    highlights: [
      { description: "Up to 3 team members" },
      { description: "Up to 5 deal progress boards" },
      { description: "Source leads from select platforms" },
      { description: "RadiantAI integrations", disabled: true },
      { description: "Competitor analysis", disabled: true },
    ],
    features: [
      { section: "Features", name: "Accounts", value: 3 },
      { section: "Features", name: "Deal progress boards", value: 5 },
      { section: "Features", name: "Sourcing platforms", value: "Select" },
      { section: "Features", name: "Contacts", value: 100 },
      { section: "Features", name: "AI assisted outreach", value: false },
      { section: "Analysis", name: "Competitor analysis", value: false },
      { section: "Analysis", name: "Dashboard reporting", value: false },
      { section: "Analysis", name: "Community insights", value: false },
      { section: "Analysis", name: "Performance analysis", value: false },
      { section: "Support", name: "Email support", value: true },
      { section: "Support", name: "24 / 7 call center support", value: false },
      { section: "Support", name: "Dedicated account manager", value: false },
    ],
  },
  {
    name: "Enterprise" as const,
    slug: "enterprise",
    description: "Added flexibility to close deals at scale.",
    priceMonthly: 299,
    href: "#",
    highlights: [
      { description: "Unlimited active team members" },
      { description: "Unlimited deal progress boards" },
      { description: "Source leads from over 100 verified platforms" },
      { description: "RadiantAI integrations" },
      { description: "Unlimited competitor analyses" },
    ],
    features: [
      { section: "Features", name: "Accounts", value: "Unlimited" },
      { section: "Features", name: "Deal progress boards", value: "Unlimited" },
      { section: "Features", name: "Sourcing platforms", value: "100+" },
      { section: "Features", name: "Contacts", value: "Unlimited" },
      { section: "Features", name: "AI assisted outreach", value: true },
      { section: "Analysis", name: "Competitor analysis", value: "Unlimited" },
      { section: "Analysis", name: "Dashboard reporting", value: true },
      { section: "Analysis", name: "Community insights", value: true },
      { section: "Analysis", name: "Performance analysis", value: true },
      { section: "Support", name: "Email support", value: true },
      { section: "Support", name: "24 / 7 call center support", value: true },
      { section: "Support", name: "Dedicated account manager", value: true },
    ],
  },
];

function Header() {
  return (
    <Container className="mt-16">
      <Heading as="h1">Your Bitcoin, Your Way.</Heading>
      <Lead className="mt-6 max-w-3xl">
        Companies all over the world have closed millions of deals with Radiant.
        Sign up today and start selling smarter.
      </Lead>
    </Container>
  );
}

function ProductCards() {
  return (
    <div className="relative py-24">
      <Gradient className="absolute inset-x-2 top-48 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier, tierIndex) => (
            <ProductCard key={tierIndex} tier={tier} />
          ))}
        </div>
        <LogoCloud className="mt-24" />
      </Container>
    </div>
  );
}

function ProductCard({ tier }: { tier: (typeof tiers)[number] }) {
  return (
    <div className="-m-2 grid grid-cols-1 rounded-4xl shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:w-full max-lg:max-w-md">
      <div className="grid grid-cols-1 rounded-4xl p-2 shadow-md shadow-black/5">
        <div className="rounded-3xl bg-white p-10 pb-9 shadow-2xl ring-1 ring-black/5">
          <Subheading>{tier.name}</Subheading>
          <p className="mt-2 text-sm/6 text-gray-950/75">{tier.description}</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="text-5xl font-medium text-gray-950">
              ${tier.priceMonthly}
            </div>
            <div className="text-sm/5 text-gray-950/75">
              <p>USD</p>
              <p>per month</p>
            </div>
          </div>
          <div className="mt-8">
            <a href={tier.href}>Start a free trial</a>
          </div>
          <div className="mt-8">
            <h3 className="text-sm/6 font-medium text-gray-950">
              Start selling with:
            </h3>
            <ul className="mt-3 space-y-3">
              {tier.highlights.map((props, featureIndex) => (
                <FeatureItem key={featureIndex} {...props} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  description,
  disabled = false,
}: {
  description: string;
  disabled?: boolean;
}) {
  return (
    <li
      data-disabled={disabled ? true : undefined}
      className="flex items-start gap-4 text-sm/6 text-gray-950/75 data-disabled:text-gray-950/25"
    >
      <span className="inline-flex h-6 items-center">
        <PlusIcon className="size-3.75 shrink-0 fill-gray-950/25" />
      </span>
      {disabled && <span className="sr-only">Not included:</span>}
      {description}
    </li>
  );
}

function PlusIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 15 15" aria-hidden="true" {...props}>
      <path clipRule="evenodd" d="M8 0H7v7H0v1h7v7h1V8h7V7H8V0z" />
    </svg>
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
