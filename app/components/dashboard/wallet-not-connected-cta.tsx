import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

export default function WalletNotConnectedCTA() {
  const navigate = useNavigate();

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4">
      {/* Borrow Card */}
      <div className="relative bg-[#0051bf] rounded-2xl p-6 overflow-hidden min-h-[392px] flex flex-col">
        {/* Decorative coins in background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Back coin - bottom left (behind others) */}
          <img
            src="/coin_03.png"
            alt=""
            className="absolute w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 top-[65%] right-[20%] lg:right-[33%] object-contain"
          />
          {/* Middle coin - bottom right */}
          <img
            src="/coin_01.png"
            alt=""
            className="absolute w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bottom-[15%] lg:bottom-[4%] right-[4%] object-contain"
          />
          {/* Front coin - top right (on top of others) */}
          <img
            src="/coin_02.png"
            alt=""
            className="absolute w-52 h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 top-0 lg:top-[-8%] right-[4%] object-contain"
          />
        </div>

        <div className="relative z-10">
          <p className="text-white text-xs font-medium font-sora uppercase tracking-wider">
            Borrow
          </p>
          <h2 className="text-white text-2xl font-medium font-sora leading-7 py-2 mb-2">
            Open a
            <br />
            borrowing position
          </h2>
          <p className="text-white text-xs font-medium font-sora leading-3 mb-4">
            Deposit wBTC and mint USDU.
          </p>

          <Button
            onClick={() => navigate("/unanim/borrow")}
            className="bg-white hover:bg-white/90 text-[#242424] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Open new position
            <svg
              width="6"
              height="9"
              viewBox="0 0 7 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "6px", height: "9px" }}
            >
              <path
                d="M0.685547 9.21183L4.39714 5.50024L0.685547 1.78865L1.83379 0.648486L6.68555 5.50024L1.83379 10.352L0.685547 9.21183Z"
                fill="#242424"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Connect Wallet Card */}
      <div className="relative bg-white rounded-2xl p-6 overflow-hidden min-h-[392px] flex flex-col">
        {/* Decorative wallet/card image in background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/wallet.png"
            alt=""
            className="absolute bottom-[-12%] right-[-20%] w-[80%] md:w-[90%] lg:w-[140%] h-auto object-contain"
          />
          <img
            src="/coin_02.png"
            alt=""
            className="absolute bottom-[0%] left-[-20%] w-[50%] lg:w-[65%] h-auto object-contain"
          />
        </div>

        <div className="relative z-10">
          <p className="text-[#242424] text-xs font-medium font-sora uppercase tracking-wider">
            Provide liquidity
          </p>
          <h2 className="text-[#242424] text-2xl font-medium font-sora leading-7 py-2 mb-2">
            Liquidity
            <br />
            opportunities
          </h2>
          <p className="text-[#94938D] text-xs font-medium font-sora leading-3 mb-4">
            Browse LP opportunities.
          </p>

          <Button
            onClick={() => navigate("/unanim/borrow")}
            className="bg-[#006CFF] hover:bg-[#0056CC] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Earn incentives
            <svg
              width="6"
              height="9"
              viewBox="0 0 7 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "6px", height: "9px" }}
            >
              <path
                d="M0.685547 9.21183L4.39714 5.50024L0.685547 1.78865L1.83379 0.648486L6.68555 5.50024L1.83379 10.352L0.685547 9.21183Z"
                fill="white"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Earn Card - Full Width */}
      <div className="md:col-span-2 lg:col-span-2 relative bg-white rounded-2xl p-6 overflow-hidden min-h-[392px] md:min-h-[196px]">
        {/* Decorative chart in background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/chart.png"
            alt=""
            className="absolute bottom-[-12%] md:bottom-auto right-[-20%] md:right-[10%] md:top-1/2 md:-translate-y-1/2 h-auto md:h-[180%] w-[70%] md:w-auto object-contain"
          />
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-[#242424] text-xs font-medium font-sora uppercase tracking-wider">
            Earn
          </p>
          <h2 className="text-[#242424] text-2xl font-medium font-sora leading-7 py-2 mb-2">
            Deposit to earn rewards
          </h2>
          <p className="text-[#94938D] text-xs font-medium font-sora leading-3 mb-4">
            Provide USDU to the stability pool and earn yield.
          </p>

          <Button
            onClick={() => navigate("/unanim/earn")}
            className="bg-[#006CFF] hover:bg-[#0056CC] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Start earning
            <svg
              width="6"
              height="9"
              viewBox="0 0 7 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M0.685547 9.21183L4.39714 5.50024L0.685547 1.78865L1.83379 0.648486L6.68555 5.50024L1.83379 10.352L0.685547 9.21183Z"
                fill="white"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
