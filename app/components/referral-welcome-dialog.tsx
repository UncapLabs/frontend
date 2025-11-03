import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { useMediaQuery } from "~/hooks/use-media-query";
import { ExternalLink } from "lucide-react";

interface ReferralWelcomeDialogProps {
  open: boolean;
  onClose: () => void;
  alreadyHasReferral?: boolean;
}

export function ReferralWelcomeDialog({
  open,
  onClose,
  alreadyHasReferral = false,
}: ReferralWelcomeDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const content = (
    <div className="space-y-6">
      {/* What is Uncap */}
      <div className="relative bg-neutral-50 rounded-xl p-6 space-y-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/coin_03.png"
            alt=""
            className="absolute bottom-[-10%] right-[-5%] w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-40"
          />
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-medium font-sora text-[#242424] mb-4">
            What is Uncap Finance?
          </h3>
          <p className="text-sm font-normal font-sora text-neutral-700 mb-4">
            A decentralized lending protocol where you can borrow USDU (a
            BTC-backed stablecoin) against your Bitcoin at ultra-low interest
            rates—starting from just 0.5%.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <p className="text-sm font-medium font-sora text-neutral-800">
                  Audited & Secure
                </p>
              </div>
              <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                Smart contracts{" "}
                <a
                  href="https://www.chainsecurity.com/security-audit/uncap-finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#006CFF] hover:text-[#0056CC] font-medium"
                >
                  audited by ChainSecurity
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <p className="text-sm font-medium font-sora text-neutral-800">
                  Choose Your Rate
                </p>
              </div>
              <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                Set your own interest rate to balance cost and protection
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <p className="text-sm font-medium font-sora text-neutral-800">
                  Earn Points & Rewards
                </p>
              </div>
              <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                Earn points for borrowing, lending, and providing liquidity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {alreadyHasReferral && (
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <p className="text-sm font-normal font-sora text-amber-900">
            <strong>Note:</strong> You've already been referred by someone else,
            so your original referrer won't change.
          </p>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onClose}
          className="flex-1 h-12 bg-[#006CFF] hover:bg-blue-600 text-white text-sm font-medium font-sora rounded-xl transition-all"
        >
          Explore Uncap
        </Button>
        <Button
          onClick={() => {
            window.location.href = "/referrals";
          }}
          className="flex-1 h-12 bg-white hover:bg-neutral-50 text-[#006CFF] border border-[#006CFF] text-sm font-medium font-sora rounded-xl transition-all"
        >
          Start Referring
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="max-w-lg"
          heroImage={
            <div className="relative w-full h-48 bg-gradient-to-br from-orange-50 to-amber-50">
              <img
                src="/live.png"
                alt="Welcome to Uncap"
                className="w-full h-full object-cover"
              />
            </div>
          }
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium font-sora text-[#242424]">
              Welcome to Uncap Finance
            </DialogTitle>
            <DialogDescription className="text-neutral-600 text-sm font-normal font-sora">
              You've been referred by a friend! Your friend will earn 10% bonus
              points from your activity on Uncap.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="overflow-y-auto flex-1">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-medium font-sora text-[#242424]">
              Welcome to Uncap Finance
            </DrawerTitle>
            <DrawerDescription className="text-neutral-800 text-sm font-normal font-sora">
              You've been referred by a friend! Your friend will earn 10% bonus
              points from your activity on Uncap.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">{content}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
