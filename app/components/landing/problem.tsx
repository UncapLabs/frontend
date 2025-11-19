import { Container } from "~/components/landing/container";
import { Heading, Lead, Subheading } from "~/components/landing/text";

export default function Problem() {
  return (
    <Container className="mt-16">
      <Heading as="h1">Your Bitcoin Shouldn't Just Sit There.</Heading>
      <Lead className="mt-6 max-w-3xl">
        For years, Bitcoin holders faced an impossible choice: Sell and lose
        your position, or watch your capital sit idle.
      </Lead>
      <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div className="max-w-lg">
          <h2 className="text-2xl font-medium tracking-tight">
            The few alternatives?
          </h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>❌ Custodial lenders that collapsed</li>
            <li>❌ Give up control of your Bitcoin</li>
          </ul>

          <p className="mt-8 text-sm/6 text-gray-600">
            Uncap solves this. Borrow against Bitcoin at the lowest rates in
            DeFi while keeping full custody and control."
          </p>
        </div>
        <div className="pt-20 lg:row-span-2 lg:-mr-16 xl:mr-auto">
          <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
            <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
              <img
                alt=""
                src="xverse_wallet.png"
                className="block size-full object-cover"
              />
            </div>
            <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-32">
              <img
                alt=""
                src="ready_wallet.png"
                className="block size-full object-cover"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
              <img
                alt=""
                src="flower.png"
                className="block size-full object-cover"
              />
            </div>
            <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-32">
              <img
                alt=""
                src="wallet.png"
                className="block size-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="max-lg:mt-16 lg:col-span-1">
          <Subheading>The Numbers</Subheading>
          <hr className="mt-6 border-t border-gray-200" />
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4">
              <dt className="text-sm/6 text-gray-600">Raised</dt>
              <dd className="order-first text-6xl font-medium tracking-tight">
                $100M
              </dd>
            </div>
            <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4">
              <dt className="text-sm/6 text-gray-600">Companies</dt>
              <dd className="order-first text-6xl font-medium tracking-tight">
                15K
              </dd>
            </div>
            <div className="flex flex-col gap-y-2 max-sm:border-b max-sm:border-dotted max-sm:border-gray-200 max-sm:pb-4">
              <dt className="text-sm/6 text-gray-600">Deals Closed</dt>
              <dd className="order-first text-6xl font-medium tracking-tight">
                0.9M
              </dd>
            </div>
            <div className="flex flex-col gap-y-2">
              <dt className="text-sm/6 text-gray-600">Leads Generated</dt>
              <dd className="order-first text-6xl font-medium tracking-tight">
                150M
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </Container>
  );
}
