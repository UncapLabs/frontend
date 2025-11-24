import { Container } from "~/components/landing/container";
import { Heading, Lead, Subheading } from "~/components/landing/text";

export default function Problem() {
  return (
    <div id="problem-section">
      <Container className="mt-16">
        <Heading as="h1" className="text-[#001B40]">
          Your Bitcoin Shouldn't Just Sit There.
        </Heading>
        <Lead className="mt-6 max-w-3xl text-[#001B40]/70">
          For years, Bitcoin holders faced an impossible choice: Sell and lose
          your position, or watch your capital sit idle.
        </Lead>
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight text-[#001B40]">
              The few alternatives?
            </h2>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FF4800]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Custodial lenders that collapsed</span>
              </div>
              <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FF4800]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Give up control of your Bitcoin</span>
              </div>
              <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FF4800]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>High rates set by governance</span>
              </div>
              <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-[#FF4800]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Your Bitcoin gets lent out</span>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-3xl font-medium tracking-tight text-[#001B40]">
                Uncap solves this.
              </h2>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 18 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                    style={{ minWidth: "18px", color: "#1E50BC" }}
                  >
                    <path
                      d="M1 6.76191L6.33333 12L17 1"
                      stroke="currentColor"
                      strokeWidth="2.25"
                    />
                  </svg>
                  <span>You set your own interest rate</span>
                </div>
                <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 18 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                    style={{ minWidth: "18px", color: "#1E50BC" }}
                  >
                    <path
                      d="M1 6.76191L6.33333 12L17 1"
                      stroke="currentColor"
                      strokeWidth="2.25"
                    />
                  </svg>
                  <span>Full custody and control</span>
                </div>
                <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 18 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                    style={{ minWidth: "18px", color: "#1E50BC" }}
                  >
                    <path
                      d="M1 6.76191L6.33333 12L17 1"
                      stroke="currentColor"
                      strokeWidth="2.25"
                    />
                  </svg>
                  <span>No rehypothecation</span>
                </div>
                <div className="flex items-center gap-3 text-base text-[#001B40]/80">
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 18 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                    style={{ minWidth: "18px", color: "#1E50BC" }}
                  >
                    <path
                      d="M1 6.76191L6.33333 12L17 1"
                      stroke="currentColor"
                      strokeWidth="2.25"
                    />
                  </svg>
                  <span>100% transparent on-chain</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-20 lg:row-span-2 lg:-mr-16 xl:mr-auto">
            <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-[#001B40]/10">
                <img
                  alt="Full custody and control"
                  src="illustrations/vault.png"
                  className="block size-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-[#001B40]/10 lg:-mt-32">
                <img
                  alt="No rehypothecation"
                  src="illustrations/balance.png"
                  className="block size-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-[#001B40]/10">
                <img
                  alt="100% transparent on-chain"
                  src="illustrations/safety.png"
                  className="block size-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-[#001B40]/10 lg:-mt-32">
                <img
                  alt="Set your own interest rate"
                  src="illustrations/piggybank.png"
                  className="block size-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="max-lg:mt-16 lg:col-span-1">
            <Subheading className="text-[#001B40]/60">The Numbers</Subheading>
            <hr className="mt-6 border-t border-[#001B40]/10" />
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-y-2 border-b border-dotted border-[#001B40]/10 pb-4">
                <dt className="text-sm/6 text-[#001B40]/60">
                  Min Interest Rate
                </dt>
                <dd className="order-first text-6xl font-medium tracking-tight text-[#001B40]">
                  0.5%
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 border-b border-dotted border-[#001B40]/10 pb-4">
                <dt className="text-sm/6 text-[#001B40]/60">
                  Max Loan-to-Value
                </dt>
                <dd className="order-first text-6xl font-medium tracking-tight text-[#001B40]">
                  86.96%
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 max-sm:border-b max-sm:border-dotted max-sm:border-[#001B40]/10 max-sm:pb-4">
                <dt className="text-sm/6 text-[#001B40]/60">
                  Bitcoin Collateral
                </dt>
                <dd className="order-first text-6xl font-medium tracking-tight text-[#001B40]">
                  $800K+
                </dd>
              </div>
              <div className="flex flex-col gap-y-2">
                <dt className="text-sm/6 text-[#001B40]/60">
                  USDU in Circulation
                </dt>
                <dd className="order-first text-6xl font-medium tracking-tight text-[#001B40]">
                  $400K+
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </Container>
    </div>
  );
}
