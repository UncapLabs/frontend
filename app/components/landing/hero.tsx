import { Button } from "../ui/button";
import { Container } from "./container";
import { Gradient } from "./gradient";

export default function Hero() {
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
