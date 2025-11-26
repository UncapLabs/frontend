import { Container } from "~/components/landing/container";
import { Heading, Lead } from "~/components/landing/text";

export default function Problem() {
  return (
    <div id="problem-section" className="py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side */}
          <div>
            <Heading as="h1" className="text-[#001B40]">
              Your Bitcoin shouldn't just sit there.
            </Heading>
            <Lead className="mt-6 max-w-lg text-[#001B40]/70">
              For years, Bitcoin holders faced an impossible choice: sell your
              Bitcoin or watch your capital sit idle.
            </Lead>

            <div className="mt-12">
              <h2 className="text-2xl font-medium tracking-tight text-[#001B40] font-sora">
                Uncap solves this: borrow against your Bitcoin without giving up
                control.
              </h2>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <CheckItem text="Full custody and control" />
                <CheckItem text="100% transparent onchain" />
                <CheckItem text="No rehypothecation" />
                <CheckItem text="You set your own interest rate" />
              </div>
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Min Interest - Blue Theme */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#1E50BC]/5 p-4 sm:p-8 min-h-[140px] sm:min-h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
              <dt className="text-[10px] sm:text-xs font-semibold text-[#1E50BC] uppercase tracking-widest font-sora">
                Min Interest Rate
              </dt>
              <dd className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tighter text-[#001B40] font-sora">
                0.5%
              </dd>
            </div>

            {/* Max LTV - Blue Theme */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#1E50BC]/5 p-4 sm:p-8 min-h-[140px] sm:min-h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
              <dt className="text-[10px] sm:text-xs font-semibold text-[#1E50BC] uppercase tracking-widest font-sora">
                Max Loan-to-Value
              </dt>
              <dd className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tighter text-[#001B40] font-sora">
                86.96%
              </dd>
            </div>

            {/* Bitcoin Collateral - Orange Theme with Image */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#FF9300]/10 p-4 sm:p-8 min-h-[140px] sm:min-h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
              <dt className="relative z-10 text-[10px] sm:text-xs font-semibold text-[#b36b00] uppercase tracking-widest font-sora">
                Bitcoin Collateral
              </dt>
              <dd className="relative z-10 mt-2 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tighter text-[#001B40] font-sora">
                $800K+
              </dd>
              <img
                src="/bitcoin.png"
                alt=""
                className="absolute -right-2 -bottom-2 w-20 h-20 sm:-right-4 sm:-bottom-4 sm:w-28 sm:h-28 opacity-20 rotate-12 object-contain"
              />
            </div>

            {/* USDU Circulation - USDU Red Theme with Image */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-[#FF4800]/10 p-4 sm:p-8 min-h-[140px] sm:min-h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
              <dt className="relative z-10 text-[10px] sm:text-xs font-semibold text-[#FF4800] uppercase tracking-widest font-sora">
                USDU in Circulation
              </dt>
              <dd className="relative z-10 mt-2 text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tighter text-[#001B40] font-sora">
                $400K+
              </dd>
              <img
                src="/usdu.png"
                alt=""
                className="absolute -right-2 -bottom-2 w-20 h-20 sm:-right-4 sm:-bottom-4 sm:w-28 sm:h-28 opacity-20 rotate-12 object-contain"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-base sm:text-lg text-[#001B40]/80 font-sora">
      <svg
        width="20"
        height="16"
        viewBox="0 0 18 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-4"
        style={{ color: "#1E50BC" }}
      >
        <path
          d="M1 6.76191L6.33333 12L17 1"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}
