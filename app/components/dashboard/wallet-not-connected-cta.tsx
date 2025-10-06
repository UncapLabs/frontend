import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";

interface WalletNotConnectedCTAProps {
  onConnectWallet?: () => void;
}

export default function WalletNotConnectedCTA({
  onConnectWallet,
}: WalletNotConnectedCTAProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
      {/* Borrow Card */}
      <div className="relative bg-[#0051bf] rounded-2xl p-6 overflow-hidden min-h-[392px] flex flex-col">
        {/* Decorative coins in background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/coin_01.png"
            alt=""
            className="absolute w-64 h-64 -top-8 right-[-10%] object-contain"
          />
          <img
            src="/coin_02.png"
            alt=""
            className="absolute w-72 h-72 top-[30%] right-[-5%] object-contain"
          />
          <img
            src="/coin_03.png"
            alt=""
            className="absolute w-56 h-56 bottom-[5%] right-[20%] object-contain"
          />
        </div>

        <div className="relative z-10">
          <p className="text-white text-xs font-medium font-sora uppercase tracking-wider">
            Borrow
          </p>
          <h2 className="text-white text-2xl font-medium font-sora leading-7 py-2 mb-2">
            Start your
            <br />
            borrowing position
          </h2>
          <p className="text-white text-xs font-medium font-sora leading-3 mb-4">
            Vestibulum consectetur faucibus eros
          </p>

          <Button
            onClick={() => navigate("/unanim/borrow")}
            className="bg-white hover:bg-white/90 text-[#242424] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Open new position
            <ArrowRight className="h-3 w-3" />
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
            className="absolute bottom-[-12%] right-[-20%] w-[140%] h-auto object-contain"
          />
          <img
            src="/coin_02.png"
            alt=""
            className="absolute bottom-[0%] left-[-15%] w-40 h-40 object-contain"
          />
        </div>

        <div className="relative z-10">
          <p className="text-[#242424] text-xs font-medium font-sora uppercase tracking-wider">
            Wallet
          </p>
          <h2 className="text-[#242424] text-2xl font-medium font-sora leading-7 py-2 mb-2">
            Connect
            <br />
            your wallet
          </h2>
          <p className="text-[#94938D] text-xs font-medium font-sora leading-3 mb-4">
            Vestibulum consectetur faucibus eros
          </p>

          <Button
            onClick={onConnectWallet}
            className="bg-[#006CFF] hover:bg-[#0056CC] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Connect wallet
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Earn Card - Full Width */}
      <div className="lg:col-span-2 relative bg-white rounded-2xl p-6 overflow-hidden min-h-[196px]">
        {/* Decorative chart in background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/chart.png"
            alt=""
            className="absolute right-[15%] top-1/2 -translate-y-1/2 h-[180%] w-auto object-contain"
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
            Vestibulum consectetur faucibus eros
          </p>

          <Button
            onClick={() => navigate("/unanim/earn")}
            className="bg-[#006CFF] hover:bg-[#0056CC] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium inline-flex items-center gap-8"
          >
            Start earning
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
