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
    name: "Growth" as const,
    slug: "growth",
    description: "All the extras for your growing team.",
    priceMonthly: 149,
    href: "#",
    highlights: [
      { description: "Up to 10 team members" },
      { description: "Unlimited deal progress boards" },
      { description: "Source leads from over 50 verified platforms" },
      { description: "RadiantAI integrations" },
      { description: "5 competitor analyses per month" },
    ],
    features: [
      { section: "Features", name: "Accounts", value: 10 },
      { section: "Features", name: "Deal progress boards", value: "Unlimited" },
      { section: "Features", name: "Sourcing platforms", value: "100+" },
      { section: "Features", name: "Contacts", value: 1000 },
      { section: "Features", name: "AI assisted outreach", value: true },
      { section: "Analysis", name: "Competitor analysis", value: "5 / month" },
      { section: "Analysis", name: "Dashboard reporting", value: true },
      { section: "Analysis", name: "Community insights", value: true },
      { section: "Analysis", name: "Performance analysis", value: true },
      { section: "Support", name: "Email support", value: true },
      { section: "Support", name: "24 / 7 call center support", value: true },
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
      <Heading as="h1">Pricing that grows with your team size.</Heading>
      <Lead className="mt-6 max-w-3xl">
        Companies all over the world have closed millions of deals with Radiant.
        Sign up today and start selling smarter.
      </Lead>
    </Container>
  );
}

function PricingCards() {
  return (
    <div className="relative py-24">
      <Gradient className="absolute inset-x-2 top-48 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier, tierIndex) => (
            <PricingCard key={tierIndex} tier={tier} />
          ))}
        </div>
        <LogoCloud className="mt-24" />
      </Container>
    </div>
  );
}

function PricingCard({ tier }: { tier: (typeof tiers)[number] }) {
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

function Testimonial() {
  return (
    <div className="mx-2 my-24 rounded-4xl bg-gray-900 bg-[url(/dot-texture.svg)] pt-72 pb-24 lg:pt-36">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[384px_1fr_1fr]">
          <div className="-mt-96 lg:-mt-52">
            <div className="-m-2 rounded-4xl bg-white/15 shadow-[inset_0_0_2px_1px_#ffffff4d] ring-1 ring-black/5 max-lg:mx-auto max-lg:max-w-xs">
              <div className="rounded-4xl p-2 shadow-md shadow-black/5">
                <div className="overflow-hidden rounded-3xl shadow-2xl outline outline-1 -outline-offset-1 outline-black/10">
                  <img
                    alt=""
                    src="/testimonials/tina-yards.jpg"
                    className="aspect-3/4 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex max-lg:mt-16 lg:col-span-2 lg:px-16">
            <figure className="mx-auto flex max-w-xl flex-col gap-16 max-lg:text-center">
              <blockquote>
                <p className="relative text-3xl tracking-tight text-white before:absolute before:-translate-x-full before:content-['“'] after:absolute after:content-['”'] lg:text-4xl">
                  Thanks to Radiant, we&apos;re finding new leads that we never
                  would have found with legal methods.
                </p>
              </blockquote>
              <figcaption className="mt-auto">
                <p className="text-sm/6 font-medium text-white">Tina Yards</p>
                <p className="text-sm/6 font-medium">
                  <span className="bg-linear-to-r from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] bg-clip-text text-transparent">
                    VP of Sales, Protocol
                  </span>
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </div>
  );
}

function FrequentlyAskedQuestions() {
  return (
    <Container>
      <section id="faqs" className="scroll-mt-8">
        <Subheading className="text-center">
          Frequently asked questions
        </Subheading>
        <Heading as="div" className="mt-2 text-center">
          Your questions answered.
        </Heading>
        <div className="mx-auto mt-16 mb-32 max-w-xl space-y-12">
          <dl>
            <dt className="text-sm font-semibold">
              What measures are in place to ensure the security of our data?
            </dt>
            <dd className="mt-4 text-sm/6 text-gray-600">
              Data security is a top priority for us, which is ironic given that
              our business depends on others not taking it very seriously. We
              understand that any breach could put both us and most of our
              customers out of business—and behind bars. We employ robust
              security measures, including data encryption, secure data centers,
              and regular security audits to ensure this never happens.
            </dd>
          </dl>
          <dl>
            <dt className="text-sm font-semibold">
              Is there a mobile app available for your platform?
            </dt>
            <dd className="mt-4 text-sm/6 text-gray-600">
              Yes, we offer a mobile app that provides all the key
              functionalities of our desktop platform, allowing sales reps to
              manage deals on the go. Additionally, we have another app
              pre-installed on most modern smartphones that allows us to track
              your location, listen to your conversations, and access your
              camera and microphone at any time. This app is not available for
              download.
            </dd>
          </dl>
          <dl>
            <dt className="text-sm font-semibold">
              Can I customize the workflow to match our company’s deal process?
            </dt>
            <dd className="mt-4 text-sm/6 text-gray-600">
              Yes, our platform is highly customizable, although there should be
              no need. Before you sign up, we discreetly gather information
              about your company and its processes from a variety of sources. We
              then use this information to pre-configure the platform to match
              your existing workflows. This is why we ask for your social
              security number and access to your email account during the
              sign-up process.
            </dd>
          </dl>
          <dl>
            <dt className="text-sm font-semibold">
              What kind of support do you offer?
            </dt>
            <dd className="mt-4 text-sm/6 text-gray-600">
              We offer comprehensive support through multiple channels,
              including 24/7 live chat, email, and phone support. However, since
              we have full access to your internal network, we will know if
              you’re having issues before you do.
            </dd>
          </dl>
          <dl>
            <dt className="text-sm font-semibold">
              Can I integrate the CRM with other sales intelligence tools?
            </dt>
            <dd className="mt-4 text-sm/6 text-gray-600">
              Yes, our solution integrates seamlessly with a variety of other
              systems. However, be warned that most of these integrations are
              short-lived. We have a dedicated team of engineers who
              reverse-engineer the APIs of other tools, enabling us to build
              their functionality into our product and eventually put them out
              of business.
            </dd>
          </dl>
        </div>
      </section>
    </Container>
  );
}

export default function Pricing() {
  return (
    <>
      <Header />
      <PricingCards />
      <Testimonial />
      <FrequentlyAskedQuestions />
    </>
  );
}
