import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useAccount } from "@starknet-react/core";
import { useReferral } from "~/hooks/use-referral";
import { Check, Copy, Users } from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { address } = useAccount();
  const { referralInfo, isLoading, generateCode, isGenerating } = useReferral();
  const [copied, setCopied] = useState(false);

  const normalizedBonusRate = referralInfo?.bonusRate ?? 0.15;
  const bonusPercent = Math.round(normalizedBonusRate * 100);

  const handleCopy = () => {
    if (referralInfo?.referralCode) {
      const url = `https://uncap.finance/?ref=${referralInfo.referralCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    if (!referralInfo?.referralCode) return;

    const url = `https://uncap.finance/?ref=${referralInfo.referralCode}`;
    const text = `Uncap Finance is live! 🚀

Borrow USDU against your BTC at ultra-low rates + earn boosted yields.

Early supporters get points and referral bonuses 👀

Join the BTC economy: ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;

    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline pb-6 lg:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Referrals
          </h1>
          <p className="text-sm text-[#94938D] font-sora mt-2">
            Refer users and earn bonus points when they earn points
          </p>
        </div>
      </div>

      {/* Your Referrals List */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-medium font-sora text-[#242424] mb-2">
              Your Referrals
            </h2>
            <p className="text-sm text-[#94938D] font-sora">
              Users you've referred. Points are calculated weekly on Friday.
            </p>
          </div>
          <div className="flex items-end gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight leading-none mb-2">
                Total Referrals
              </p>
              <p className="text-2xl font-medium font-sora text-[#242424] leading-none">
                {!address
                  ? "—"
                  : isLoading
                  ? "..."
                  : referralInfo?.totalReferrals || 0}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-tight leading-none mb-2">
                Total Points
              </p>
              <p className="text-2xl font-medium font-sora text-[#242424] leading-none">
                {!address
                  ? "—"
                  : isLoading
                  ? "..."
                  : referralInfo?.totalBonusEarned.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {referralInfo?.referees && referralInfo.referees.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-[#AAA28E] font-sora uppercase tracking-tight">
              Referral points refresh every Friday at 10:00 UTC after the weekly calculation.
            </p>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 pb-3 border-b border-[#E5E5E5]">
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider">
                User
              </p>
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider">
                Joined
              </p>
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider text-right">
                Your Bonus
              </p>
            </div>

            {/* Table Rows */}
            {referralInfo.referees.map((referee, idx) => (
              <div
                key={idx}
                className="md:grid md:grid-cols-3 gap-4 py-4 border-b border-[#E5E5E5] last:border-0 space-y-2 md:space-y-0 md:items-center"
              >
                <div>
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    User
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#006CFF]/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#006CFF]">
                        {referee.anonymousName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium font-sora text-[#242424]">
                      {referee.anonymousName}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    Joined
                  </p>
                  <p className="text-sm font-sora text-[#242424]">
                    {new Date(referee.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    Your Bonus
                  </p>
                  {referee.hasCalculation ? (
                    <p className={`text-sm font-bold font-sora ${referee.bonusEarned > 0 ? 'text-[#00C853]' : 'text-[#242424]'}`}>
                      {referee.bonusEarned > 0 ? '+' : ''}{referee.bonusEarned.toFixed(2)} pts
                    </p>
                  ) : (
                    <p className="text-sm font-medium font-sora text-[#94938D]">
                      Pending weekly update
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#94938D]" />
            </div>
            <p className="text-sm text-[#94938D] font-sora">
              {!address
                ? "Connect your wallet to refer and view your referrals"
                : "No referrals yet. Share your code to start earning!"}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-[#006CFF] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <p className="text-white text-xs font-medium font-sora uppercase tracking-wider mb-2">
              Your Referral Code
            </p>
            <h2 className="text-white text-2xl font-medium font-sora leading-7 mb-6">
              Share your code
              <br />
              Earn rewards
            </h2>

            {!address ? (
              <p className="text-white/70 text-sm font-sora leading-relaxed">
                Connect your wallet to generate your referral code and start
                earning rewards.
              </p>
            ) : referralInfo?.referralCode ? (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-white/70 text-xs font-medium font-sora mb-2">
                    Your code
                  </p>
                  <p className="text-white text-3xl font-mono font-bold tracking-wider">
                    {referralInfo.referralCode}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-white hover:bg-white/90 text-[#006CFF] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleTwitterShare}
                    className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on Twitter
                  </Button>
                </div>

                <p className="text-white/70 text-xs font-sora leading-relaxed">
                  Share this code with friends. When they earn points, you'll
                  earn {bonusPercent}% bonus points too!
                </p>
              </div>
            ) : (
              <Button
                onClick={generateCode}
                disabled={isGenerating}
                className="bg-white hover:bg-white/90 text-[#006CFF] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium w-full sm:w-auto"
              >
                {isGenerating ? "Generating..." : "Generate Your Code"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
